import { getPrismaClient } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/auditLog";
import { requireAdminApiSession } from "@/lib/adminAuth";
import { ensureDefaultAssessmentFramework, hasFrameworkDelegates } from "@/lib/assessmentRepository";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function snapshotSection(section) {
  if (!section) return null;

  return {
    id: section.id,
    key: section.key,
    title: section.title,
    description: section.description,
    weight: Number(section.weight),
    sortOrder: Number(section.sortOrder),
    isActive: Boolean(section.isActive),
  };
}

export async function GET(request) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;
  const prisma = getPrismaClient();
  const frameworkStatus = await ensureDefaultAssessmentFramework();

  if (frameworkStatus.mode === "raw") {
    const sections = await prisma.$queryRawUnsafe(`SELECT * FROM "AssessmentSection" ORDER BY "sortOrder" ASC`);
    const questions = await prisma.$queryRawUnsafe(`SELECT * FROM "AssessmentQuestion" ORDER BY "sortOrder" ASC`);

    return Response.json({
      sections: sections.map((section) => ({
        ...section,
        questions: questions.filter((question) => question.sectionId === section.id),
      })),
    });
  }

  const sections = await prisma.assessmentSection.findMany({
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return Response.json({ sections });
}

export async function POST(request) {
  try {
    const auth = await requireAdminApiSession(request);
    if (!auth.ok) return auth.response;
    const prisma = getPrismaClient();
    await ensureDefaultAssessmentFramework();
    const body = await request.json();
    const title = body.title?.trim();
    const description = body.description?.trim() || "";
    const weight = Number(body.weight || 1);
    const sortOrder = body.sortOrder == null ? null : Number(body.sortOrder);

    if (!title) {
      return Response.json({ error: "Section title is required." }, { status: 400 });
    }

    if (!description) {
      return Response.json({ error: "Section description is required." }, { status: 400 });
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      return Response.json({ error: "Section weight must be greater than 0." }, { status: 400 });
    }

    if (sortOrder != null && (!Number.isFinite(sortOrder) || sortOrder <= 0)) {
      return Response.json({ error: "Sort order must be greater than 0." }, { status: 400 });
    }

    let section;

    if (hasFrameworkDelegates(prisma)) {
      const count = await prisma.assessmentSection.count();
      section = await prisma.assessmentSection.create({
        data: {
          key: body.key?.trim() || slugify(title),
          title,
          description,
          weight,
          sortOrder: sortOrder || count + 1,
          isActive: body.isActive ?? true,
        },
      });
    } else {
      const countRows = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "AssessmentSection"`);
      const count = countRows[0]?.count ?? 0;
      const insertedRows = await prisma.$queryRawUnsafe(
        `
          INSERT INTO "AssessmentSection" ("id", "key", "title", "description", "weight", "sortOrder", "isActive", "createdAt", "updatedAt")
          VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING *
        `,
        body.key?.trim() || slugify(title),
        title,
        description,
        weight,
        sortOrder || count + 1,
        body.isActive ?? true
      );
      section = insertedRows[0];
    }

    await logAuditEvent({
      actorEmail: auth.session.adminUser.email,
      actorType: "admin",
      action: "framework.section_created",
      entityType: "assessment_section",
      entityId: section.id,
      details: {
        section: snapshotSection(section),
      },
    });

    return Response.json({ section });
  } catch (error) {
    console.error("CREATE SECTION ERROR:", error);
    return Response.json({ error: "Unable to create section." }, { status: 500 });
  }
}
