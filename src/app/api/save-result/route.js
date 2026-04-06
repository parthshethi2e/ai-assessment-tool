import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const scores = body.categoryScores || {};
    const profile = body.draft?.profile || {};
    const notes = body.draft?.notes || {};
    const responses = body.draft?.responses || {};
    const finalScore = Number(body.finalScore);

    if (!profile.organizationName?.trim() || profile.organizationName.trim().length < 3) {
      return Response.json({ error: "A valid organization name is required." }, { status: 400 });
    }

    if (!profile.organizationType || !profile.sector || !profile.sizeBand || !profile.annualBudgetBand || !profile.respondentRole) {
      return Response.json({ error: "Complete the organization profile before saving." }, { status: 400 });
    }

    if (!notes.priority || !notes.timeline) {
      return Response.json({ error: "Complete the planning context before saving." }, { status: 400 });
    }

    if (!Number.isFinite(finalScore) || finalScore < 0 || finalScore > 5) {
      return Response.json({ error: "A valid assessment score is required." }, { status: 400 });
    }

    if (!body.maturity || typeof body.maturity !== "string") {
      return Response.json({ error: "A valid maturity stage is required." }, { status: 400 });
    }

    if (!Object.keys(responses).length) {
      return Response.json({ error: "At least one assessment response is required." }, { status: 400 });
    }

    const survey = await prisma.survey.create({
      data: {
        finalScore,
        maturityLevel: body.maturity,
        dataScore: scores.data ?? null,
        techScore: scores.technology ?? null,
        aiUsageScore: scores.adoption ?? null,
        workforceScore: scores.people ?? null,
        leadershipScore: scores.strategy ?? null,
        governanceScore: scores.governance ?? null,
        answers: {
          profile,
          notes,
          responses,
          assessment: body.assessment || {},
        },
        aiInsights: body.ai || {},
      },
    });

    return Response.json({ success: true, id: survey.id });
  } catch (error) {
    console.error("SAVE RESULT ERROR:", error);
    return Response.json({ error: "Unable to save report" }, { status: 500 });
  }
}
