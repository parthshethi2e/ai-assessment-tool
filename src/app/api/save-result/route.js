import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();

    const survey = await prisma.survey.create({
      data: {
        finalScore: body.finalScore,
        maturityLevel: body.maturity,

        // optional category scores (safe)
        dataScore: body.categoryScores?.data || null,
        techScore: body.categoryScores?.technology || null,
        aiUsageScore: body.categoryScores?.["ai-usage"] || null,
        workforceScore: body.categoryScores?.workforce || null,
        leadershipScore: body.categoryScores?.leadership || null,
        governanceScore: body.categoryScores?.governance || null,

        answers: body.answers,
        aiInsights: body.ai,
      },
    });

    return Response.json({ success: true, id: survey.id });
  } catch (error) {
    console.error("SAVE ERROR:", error);
    return Response.json({ error: "Save failed" }, { status: 500 });
  }
}