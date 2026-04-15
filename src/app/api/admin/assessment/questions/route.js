import { getPrismaClient } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/auditLog";
import { requireAdminApiSession } from "@/lib/adminAuth";
import { ensureDefaultAssessmentFramework, hasFrameworkDelegates } from "@/lib/assessmentRepository";
import { defaultScoreLabels } from "@/data/assessmentFramework";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function snapshotQuestion(question) {
  if (!question) return null;

  return {
    id: question.id,
    key: question.key,
    sectionId: question.sectionId,
    prompt: question.prompt,
    helperText: question.helperText,
    whyItMatters: question.whyItMatters,
    scoreLabels: question.scoreLabels || defaultScoreLabels,
    requiresTarget: question.requiresTarget !== false,
    weight: Number(question.weight),
    sortOrder: Number(question.sortOrder),
    isActive: Boolean(question.isActive),
  };
}

function normalizeScoreLabels(labels) {
  const next = {};

  for (const value of [1, 2, 3, 4, 5]) {
    const label = String(labels?.[value] || labels?.[String(value)] || defaultScoreLabels[value] || "").trim();

    if (!label) {
      return null;
    }

    next[value] = label;
  }

  return next;
}

function questionDelegateSupportsAdminFields(prisma) {
  const questionFields = prisma?._runtimeDataModel?.models?.AssessmentQuestion?.fields || [];
  const fieldNames = new Set(questionFields.map((field) => field.name));
  return fieldNames.has("scoreLabels") && fieldNames.has("requiresTarget");
}

async function ensureScoreLabelsColumn(prisma) {
  await prisma.$executeRawUnsafe(`ALTER TABLE "AssessmentQuestion" ADD COLUMN IF NOT EXISTS "scoreLabels" JSONB`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "AssessmentQuestion" ADD COLUMN IF NOT EXISTS "requiresTarget" BOOLEAN NOT NULL DEFAULT true`);
  await prisma.$executeRawUnsafe(
    `
      UPDATE "AssessmentQuestion"
      SET "scoreLabels" = $1::jsonb
      WHERE "scoreLabels" IS NULL
    `,
    JSON.stringify(defaultScoreLabels)
  );
}

export async function POST(request) {
  try {
    const auth = await requireAdminApiSession(request);
    if (!auth.ok) return auth.response;
    const prisma = getPrismaClient();
    await ensureScoreLabelsColumn(prisma);
    await ensureDefaultAssessmentFramework();
    const body = await request.json();
    const prompt = body.prompt?.trim();
    const whyItMatters = body.whyItMatters?.trim() || null;
    const helperText = body.helperText?.trim() || null;
    const weight = Number(body.weight || 1);
    const sortOrder = body.sortOrder == null ? null : Number(body.sortOrder);
    const scoreLabels = normalizeScoreLabels(body.scoreLabels);
    const requiresTarget = body.requiresTarget !== false;
    let section = null;

    if (!body.sectionId || !prompt) {
      return Response.json({ error: "Section and prompt are required." }, { status: 400 });
    }

    if (!whyItMatters) {
      return Response.json({ error: "Why it matters is required." }, { status: 400 });
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      return Response.json({ error: "Question weight must be greater than 0." }, { status: 400 });
    }

    if (sortOrder != null && (!Number.isFinite(sortOrder) || sortOrder <= 0)) {
      return Response.json({ error: "Sort order must be greater than 0." }, { status: 400 });
    }

    if (!scoreLabels) {
      return Response.json({ error: "Labels for scores 1-5 are required." }, { status: 400 });
    }

    let question;

    if (hasFrameworkDelegates(prisma) && questionDelegateSupportsAdminFields(prisma)) {
      section = await prisma.assessmentSection.findFirst({
        where: {
          OR: [{ id: body.sectionId }, { key: body.sectionId }],
        },
      });

      if (!section) {
        return Response.json({ error: "Section not found." }, { status: 404 });
      }

      const count = await prisma.assessmentQuestion.count({
        where: { sectionId: section.id },
      });

      question = await prisma.assessmentQuestion.create({
        data: {
          sectionId: section.id,
          key: body.key?.trim() || slugify(prompt),
          prompt,
          helperText,
          whyItMatters,
          scoreLabels,
          requiresTarget,
          weight,
          sortOrder: sortOrder || count + 1,
          isActive: body.isActive ?? true,
        },
      });
    } else {
      const countRows = await prisma.$queryRawUnsafe(
        `SELECT * FROM "AssessmentSection" WHERE "id" = $1 OR "key" = $1 LIMIT 1`,
        body.sectionId
      );
      section = countRows[0];

      if (!section) {
        return Response.json({ error: "Section not found." }, { status: 404 });
      }

      const existingRows = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int AS count FROM "AssessmentQuestion" WHERE "sectionId" = $1`,
        section.id
      );
      const count = existingRows[0]?.count ?? 0;
      const insertedRows = await prisma.$queryRawUnsafe(
        `
          INSERT INTO "AssessmentQuestion" (
            "id",
            "key",
            "sectionId",
            "prompt",
            "helperText",
            "whyItMatters",
            "scoreLabels",
            "requiresTarget",
            "weight",
            "sortOrder",
            "isActive",
            "createdAt",
            "updatedAt"
          )
          VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, NOW(), NOW())
          RETURNING *
        `,
        body.key?.trim() || slugify(prompt),
        section.id,
        prompt,
        helperText,
        whyItMatters,
        JSON.stringify(scoreLabels),
        requiresTarget,
        weight,
        sortOrder || count + 1,
        body.isActive ?? true
      );
      question = insertedRows[0];
    }

    await logAuditEvent({
      actorEmail: auth.session.adminUser.email,
      actorType: "admin",
      action: "framework.question_created",
      entityType: "assessment_question",
      entityId: question.id,
      details: {
        section: section
          ? {
              id: section.id,
              key: section.key,
              title: section.title,
            }
          : null,
        question: snapshotQuestion(question),
      },
    });

    return Response.json({ question });
  } catch (error) {
    console.error("CREATE QUESTION ERROR:", error);
    return Response.json({ error: "Unable to create question." }, { status: 500 });
  }
}
