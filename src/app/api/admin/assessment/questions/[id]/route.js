import { getPrismaClient } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/auditLog";
import { requireAdminApiSession } from "@/lib/adminAuth";
import { hasFrameworkDelegates } from "@/lib/assessmentRepository";

function snapshotQuestion(question) {
  if (!question) return null;

  return {
    id: question.id,
    key: question.key,
    sectionId: question.sectionId,
    prompt: question.prompt,
    helperText: question.helperText,
    whyItMatters: question.whyItMatters,
    weight: Number(question.weight),
    sortOrder: Number(question.sortOrder),
    isActive: Boolean(question.isActive),
  };
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdminApiSession(request);
    if (!auth.ok) return auth.response;
    const prisma = getPrismaClient();
    const { id } = await params;
    const body = await request.json();
    const prompt = body.prompt?.trim();
    const helperText = body.helperText?.trim() || null;
    const whyItMatters = body.whyItMatters?.trim() || null;
    const weight = Number(body.weight || 1);
    const sortOrder = Number(body.sortOrder || 1);

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

    let question;
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

      question = await prisma.assessmentQuestion.update({
        where: { id: existing.id },
        data: {
          prompt,
          helperText,
          whyItMatters,
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
              "weight" = $5,
              "sortOrder" = $6,
              "isActive" = $7,
              "updatedAt" = NOW()
          WHERE "id" = $1
          RETURNING *
        `,
        existing.id,
        prompt,
        helperText,
        whyItMatters,
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
          key: existing.key,
          prompt: existing.prompt,
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
