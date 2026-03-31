import { openai } from "@/lib/openai";

export async function generateRecommendations(analysis) {
  const prompt = `
Based on this analysis:

${analysis}

Generate a roadmap:

Return JSON:
{
  "short_term": [],
  "mid_term": [],
  "long_term": []
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}