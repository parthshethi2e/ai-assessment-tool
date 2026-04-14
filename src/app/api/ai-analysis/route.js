import { openai } from "@/lib/openai";
import { buildAssessmentAnalysisPrompt } from "@/lib/analysisPrompt";
import { generateFallbackAnalysis, normalizeAnalysis } from "@/lib/assessment";

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Model response did not contain JSON");
  }

  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

export async function POST(request) {
  const body = await request.json();

  try {
    const { profile, notes, assessment } = body;

    const prompt = buildAssessmentAnalysisPrompt(profile, notes, assessment);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: "You are an expert AI transformation consultant. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content || "";
    const parsed = extractJson(text);
    const analysis = normalizeAnalysis(parsed, body, assessment);

    return Response.json({ analysis });
  } catch (error) {
    console.error("AI ANALYSIS ERROR:", error);
    const fallback = normalizeAnalysis(generateFallbackAnalysis(body, body.assessment), body, body.assessment);
    return Response.json({ analysis: fallback });
  }
}
