import { getPrismaClient } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/adminAuth";
import { hasFrameworkDelegates } from "@/lib/assessmentRepository";

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdminApiSession(request);
    if (!auth.ok) return auth.response;
    const prisma = getPrismaClient();
    const { id } = await params;
    const body = await request.json();
    const title = body.title?.trim();
    const description = body.description?.trim() || "";
    const weight = Number(body.weight || 1);
    const sortOrder = Number(body.sortOrder || 1);

    if (!title) {
      return Response.json({ error: "Section title is required." }, { status: 400 });
    }

    if (!description) {
      return Response.json({ error: "Section description is required." }, { status: 400 });
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      return Response.json({ error: "Section weight must be greater than 0." }, { status: 400 });
    }

    if (!Number.isFinite(sortOrder) || sortOrder <= 0) {
      return Response.json({ error: "Sort order must be greater than 0." }, { status: 400 });
    }

    let section;

    if (hasFrameworkDelegates(prisma)) {
      const existing = await prisma.assessmentSection.findFirst({
        where: {
          OR: [{ id }, { key: id }],
        },
      });

      if (!existing) {
        return Response.json({ error: "Section not found." }, { status: 404 });
      }

      section = await prisma.assessmentSection.update({
        where: { id: existing.id },
        data: {
          title,
          description,
          weight,
          sortOrder,
          isActive: body.isActive ?? true,
        },
      });
    } else {
      const existingRows = await prisma.$queryRawUnsafe(
        `SELECT * FROM "AssessmentSection" WHERE "id" = $1 OR "key" = $1 LIMIT 1`,
        id
      );
      const existing = existingRows[0];

      if (!existing) {
        return Response.json({ error: "Section not found." }, { status: 404 });
      }

      const updatedRows = await prisma.$queryRawUnsafe(
        `
          UPDATE "AssessmentSection"
          SET "title" = $2,
              "description" = $3,
              "weight" = $4,
              "sortOrder" = $5,
              "isActive" = $6,
              "updatedAt" = NOW()
          WHERE "id" = $1
          RETURNING *
        `,
        existing.id,
        title,
        description,
        weight,
        sortOrder,
        body.isActive ?? true
      );
      section = updatedRows[0];
    }

    return Response.json({ section });
  } catch (error) {
    console.error("UPDATE SECTION ERROR:", error);
    return Response.json({ error: "Unable to update section." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const auth = await requireAdminApiSession(_request);
    if (!auth.ok) return auth.response;
    const prisma = getPrismaClient();
    const { id } = await params;

    if (hasFrameworkDelegates(prisma)) {
      const existing = await prisma.assessmentSection.findFirst({
        where: {
          OR: [{ id }, { key: id }],
        },
      });

      if (!existing) {
        return Response.json({ error: "Section not found." }, { status: 404 });
      }

      await prisma.assessmentSection.delete({
        where: { id: existing.id },
      });
    } else {
      const existingRows = await prisma.$queryRawUnsafe(
        `SELECT * FROM "AssessmentSection" WHERE "id" = $1 OR "key" = $1 LIMIT 1`,
        id
      );
      const existing = existingRows[0];

      if (!existing) {
        return Response.json({ error: "Section not found." }, { status: 404 });
      }

      await prisma.$executeRawUnsafe(`DELETE FROM "AssessmentSection" WHERE "id" = $1`, existing.id);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE SECTION ERROR:", error);
    return Response.json({ error: "Unable to delete section." }, { status: 500 });
  }
}
