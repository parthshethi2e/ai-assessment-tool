import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const scores = body.categoryScores || {};

    const survey = await prisma.survey.create({
      data: {
        finalScore: body.finalScore,
        maturityLevel: body.maturity,
        dataScore: scores.data ?? null,
        techScore: scores.technology ?? null,
        aiUsageScore: scores.adoption ?? null,
        workforceScore: scores.people ?? null,
        leadershipScore: scores.strategy ?? null,
        governanceScore: scores.governance ?? null,
        answers: {
          profile: body.draft?.profile || {},
          notes: body.draft?.notes || {},
          responses: body.draft?.responses || {},
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
