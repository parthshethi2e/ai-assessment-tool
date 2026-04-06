import { openai } from "@/lib/openai";
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

    const prompt = `
You are a senior AI transformation advisor preparing an executive-ready readiness report.

Organization profile:
${JSON.stringify(profile, null, 2)}

Context notes:
${JSON.stringify(notes, null, 2)}

Scored assessment:
${JSON.stringify(assessment, null, 2)}

Instructions:
1. Tailor the language to the organization type and sector.
2. Be practical, specific, and businesslike.
3. Focus on the top 3 gaps, top 3 opportunities, and a realistic roadmap.
4. Keep recommendations aligned with the score profile. Do not invent advanced maturity if scores are weak.
5. Keep the recommended tooling broad and credible.

Return strict JSON only with this shape:
{
  "summary": {
    "headline": "",
    "current_state": "",
    "key_risk": "",
    "recommended_focus": ""
  },
  "gaps": [
    {
      "area": "",
      "description": ""
    }
  ],
  "opportunities": [
    {
      "opportunity": "",
      "description": ""
    }
  ],
  "roadmap": {
    "short_term": [],
    "mid_term": [],
    "long_term": []
  },
  "tools": {
    "data": [],
    "ai": [],
    "cloud": []
  },
  "budget": {
    "level": "",
    "rationale": ""
  }
}
`;

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
