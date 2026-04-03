import { openai } from "@/lib/openai";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      finalScore,
      maturity,
      categoryScores,
      qualitative,
    } = body;

   const prompt = `
You are a senior AI transformation consultant.

Organization Profile:

Score: ${body.finalScore}
Maturity: ${body.maturity}

Category Scores:
${JSON.stringify(body.categoryScores, null, 2)}

Business Context:
- Challenges: ${body.qualitative}
- Priority: ${body.priority}
- Timeline: ${body.timeline}

TASKS:

1. Identify top 3 gaps
2. Identify top 3 opportunities
3. Provide executive summary
   - current_state
   - key_risk
   - recommended_focus
4. Create AI roadmap:
   - Short term (0-3 months)
   - Mid term (3-6 months)
   - Long term (6-12 months)

5. Suggest tools/technologies:
   - Data tools
   - AI/ML tools
   - Cloud platforms

Return STRICT JSON:

{
  "gaps": [],
  "opportunities": [],
  "summary": {
  "current_state": "",
  "key_risk": "",
  "recommended_focus": ""
  },
  "roadmap": {
    "short_term": [],
    "mid_term": [],
    "long_term": []
  },
  "tools": {
    "data": [],
    "ai": [],
    "cloud": []
  }
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI consultant. Always return clean JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.choices[0].message.content;

    return Response.json({ result: text });

  } catch (error) {
    console.error("AI ANALYSIS ERROR:", error);

    return Response.json(
      {
        result: JSON.stringify({
          gaps: ["AI service failed"],
          opportunities: [],
          summary: "Could not generate insights",
        }),
      },
      { status: 500 }
    );
  }
}