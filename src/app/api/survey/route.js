import { prisma } from "@/lib/prisma";
import { calculateMaturityScore, getMaturityLevel } from "@/lib/scoring";
import { analyzeSurveyWithAI } from "@/services/analysisService";
import { generateRecommendations } from "@/services/recommendationService";

export async function POST(req) {
  try {
    console.log("STEP 1: Request received");

    const body = await req.json();

    console.log("STEP 2: Body parsed");

    const score = calculateMaturityScore(body);
    const maturity = getMaturityLevel(score);

    console.log("STEP 3: Score calculated");

    const survey = await prisma.survey.create({
    data: {
        dataScore: body.dataScore,
        techScore: body.techScore,
        aiUsageScore: body.aiUsageScore,
        workforceScore: body.workforceScore,
        leadershipScore: body.leadershipScore,
        governanceScore: body.governanceScore,
        qualitative: body.qualitative,
        maturityLevel: maturity,
    },
    });

    console.log("STEP 4: DB saved");

    const analysis = await analyzeSurveyWithAI({
      score,
      maturity,
      qualitative: body.qualitative,
    });

    console.log("STEP 5: AI analysis done");

    const recommendations = await generateRecommendations(analysis);

    console.log("STEP 6: Recommendations done");

    return Response.json({
      surveyId: survey.id,
      score,
      maturity,
      message: "DB working ✅",
      // analysis,
      // recommendations,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}