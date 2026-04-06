export async function analyzeSurveyWithAI(payload) {
  const response = await fetch("/api/ai-analysis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || "AI analysis failed");
  }

  return json.analysis;
}
