export async function analyzeSurveyWithAI(data) {
  const res = await fetch("/api/ai-analysis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  try {
    let text = json.result;

    // 🔥 CLEAN AI RESPONSE
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (err) {
    console.error("PARSE ERROR:", err);
    return {
      gaps: [],
      opportunities: [],
      summary: "Parsing failed",
      roadmap: { short_term: [], mid_term: [], long_term: [] },
      tools: { data: [], ai: [], cloud: [] },
    };
  }
}