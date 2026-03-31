import { openai } from "@/lib/openai";

export async function analyzeSurveyWithAI({ score, maturity, qualitative }) {
  const prompt = `
You are an AI transformation expert.

Organization maturity score: ${score}
Level: ${maturity}

User input:
${qualitative}

Tasks:
1. Identify top 3 gaps
2. Identify 3 opportunities
3. Explain why this maturity level fits

Return JSON:
{
  "gaps": [],
  "opportunities": [],
  "summary": ""
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    throw err;
  }
}