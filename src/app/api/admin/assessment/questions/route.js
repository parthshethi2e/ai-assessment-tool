import { getPrismaClient } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/adminAuth";
import { ensureDefaultAssessmentFramework, hasFrameworkDelegates } from "@/lib/assessmentRepository";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request) {
  try {
    const auth = await requireAdminApiSession(request);
    if (!auth.ok) return auth.response;
    const prisma = getPrismaClient();
    await ensureDefaultAssessmentFramework();
    const body = await request.json();
    const prompt = body.prompt?.trim();
    const whyItMatters = body.whyItMatters?.trim() || null;
    const helperText = body.helperText?.trim() || null;
    const weight = Number(body.weight || 1);
    const sortOrder = body.sortOrder == null ? null : Number(body.sortOrder);

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

    let question;

    if (hasFrameworkDelegates(prisma)) {
      const count = await prisma.assessmentQuestion.count({
        where: { sectionId: body.sectionId },
      });

      question = await prisma.assessmentQuestion.create({
        data: {
          sectionId: body.sectionId,
          key: body.key?.trim() || slugify(prompt),
          prompt,
          helperText,
          whyItMatters,
          weight,
          sortOrder: sortOrder || count + 1,
          isActive: body.isActive ?? true,
        },
      });
    } else {
      const countRows = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int AS count FROM "AssessmentQuestion" WHERE "sectionId" = $1`,
        body.sectionId
      );
      const count = countRows[0]?.count ?? 0;
      const insertedRows = await prisma.$queryRawUnsafe(
        `
          INSERT INTO "AssessmentQuestion" (
            "id",
            "key",
            "sectionId",
            "prompt",
            "helperText",
            "whyItMatters",
            "weight",
            "sortOrder",
            "isActive",
            "createdAt",
            "updatedAt"
          )
          VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *
        `,
        body.key?.trim() || slugify(prompt),
        body.sectionId,
        prompt,
        helperText,
        whyItMatters,
        weight,
        sortOrder || count + 1,
        body.isActive ?? true
      );
      question = insertedRows[0];
    }

    return Response.json({ question });
  } catch (error) {
    console.error("CREATE QUESTION ERROR:", error);
    return Response.json({ error: "Unable to create question." }, { status: 500 });
  }
}
