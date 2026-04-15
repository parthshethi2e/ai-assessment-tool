import { getPrismaClient } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/auditLog";
import { requireAdminApiSession } from "@/lib/adminAuth";
import { hasFrameworkDelegates } from "@/lib/assessmentRepository";
import { defaultScoreLabels } from "@/data/assessmentFramework";

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

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdminApiSession(request);
    if (!auth.ok) return auth.response;
    const prisma = getPrismaClient();
    await ensureScoreLabelsColumn(prisma);
    const { id } = await params;
    const body = await request.json();
    const prompt = body.prompt?.trim();
    const helperText = body.helperText?.trim() || null;
    const whyItMatters = body.whyItMatters?.trim() || null;
    const weight = Number(body.weight || 1);
    const sortOrder = Number(body.sortOrder || 1);
    const scoreLabels = normalizeScoreLabels(body.scoreLabels);
    const requiresTarget = body.requiresTarget !== false;

    if (!prompt) {
      return Response.json({ error: "Question prompt is required." }, { status: 400 });
    }

    if (!whyItMatters) {
      return Response.json({ error: "Why it matters is required." }, { status: 400 });
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      return Response.json({ error: "Question weight must be greater than 0." }, { status: 400 });
    }

    if (!Number.isFinite(sortOrder) || sortOrder <= 0) {
      return Response.json({ error: "Sort order must be greater than 0." }, { status: 400 });
    }

    if (!scoreLabels) {
      return Response.json({ error: "Labels for scores 1-5 are required." }, { status: 400 });
    }

    let question;
    let existing;

    if (hasFrameworkDelegates(prisma) && questionDelegateSupportsAdminFields(prisma)) {
      existing = await prisma.assessmentQuestion.findFirst({
        where: {
          OR: [{ id }, { key: id }],
        },
      });

      if (!existing) {
        return Response.json({ error: "Question not found." }, { status: 404 });
      }

      question = await prisma.assessmentQuestion.update({
        where: { id: existing.id },
        data: {
          prompt,
          helperText,
          whyItMatters,
          scoreLabels,
          requiresTarget,
          weight,
          sortOrder,
          isActive: body.isActive ?? true,
        },
      });
    } else {
      const existingRows = await prisma.$queryRawUnsafe(
        `SELECT * FROM "AssessmentQuestion" WHERE "id" = $1 OR "key" = $1 LIMIT 1`,
        id
      );
      existing = existingRows[0];

      if (!existing) {
        return Response.json({ error: "Question not found." }, { status: 404 });
      }

      const updatedRows = await prisma.$queryRawUnsafe(
        `
          UPDATE "AssessmentQuestion"
          SET "prompt" = $2,
              "helperText" = $3,
              "whyItMatters" = $4,
              "scoreLabels" = $5::jsonb,
              "requiresTarget" = $6,
              "weight" = $7,
              "sortOrder" = $8,
              "isActive" = $9,
              "updatedAt" = NOW()
          WHERE "id" = $1
          RETURNING *
        `,
        existing.id,
        prompt,
        helperText,
        whyItMatters,
        JSON.stringify(scoreLabels),
        requiresTarget,
        weight,
        sortOrder,
        body.isActive ?? true
      );
      question = updatedRows[0];
    }

    await logAuditEvent({
      actorEmail: auth.session.adminUser.email,
      actorType: "admin",
      action: "framework.question_updated",
      entityType: "assessment_question",
      entityId: question.id,
      details: {
        before: snapshotQuestion(existing),
        after: snapshotQuestion(question),
      },
    });

    return Response.json({ question });
  } catch (error) {
    console.error("UPDATE QUESTION ERROR:", error);
    return Response.json({ error: "Unable to update question." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const auth = await requireAdminApiSession(_request);
    if (!auth.ok) return auth.response;
    const prisma = getPrismaClient();
    const { id } = await params;
    let existing;
    if (hasFrameworkDelegates(prisma)) {
      existing = await prisma.assessmentQuestion.findFirst({
        where: {
          OR: [{ id }, { key: id }],
        },
      });

      if (!existing) {
        return Response.json({ error: "Question not found." }, { status: 404 });
      }

      await prisma.assessmentQuestion.delete({
        where: { id: existing.id },
      });

      await logAuditEvent({
        actorEmail: auth.session.adminUser.email,
        actorType: "admin",
        action: "framework.question_deleted",
        entityType: "assessment_question",
        entityId: existing.id,
        details: {
          question: snapshotQuestion(existing),
        },
      });
    } else {
      const existingRows = await prisma.$queryRawUnsafe(
        `SELECT * FROM "AssessmentQuestion" WHERE "id" = $1 OR "key" = $1 LIMIT 1`,
        id
      );
      existing = existingRows[0];

      if (!existing) {
        return Response.json({ error: "Question not found." }, { status: 404 });
      }

      await prisma.$executeRawUnsafe(`DELETE FROM "AssessmentQuestion" WHERE "id" = $1`, existing.id);

      await logAuditEvent({
        actorEmail: auth.session.adminUser.email,
        actorType: "admin",
        action: "framework.question_deleted",
        entityType: "assessment_question",
        entityId: existing.id,
        details: {
          question: snapshotQuestion(existing),
        },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE QUESTION ERROR:", error);
    return Response.json({ error: "Unable to delete question." }, { status: 500 });
  }
}
