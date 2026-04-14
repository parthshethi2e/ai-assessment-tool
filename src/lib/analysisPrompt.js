export const assessmentAnalysisPromptTemplate = `You are a senior AI transformation advisor preparing an executive-ready readiness report.

Organization profile:
{{profile_json}}

Context notes:
{{notes_json}}

Scored assessment:
{{assessment_json}}

Instructions:
1. Tailor the language to the selected sector and the tools the user says they currently use.
2. Be practical, specific, and businesslike.
3. Focus on the top 3 gaps, top 3 opportunities, and a realistic roadmap.
4. Keep recommendations aligned with the score profile. Do not invent advanced maturity if scores are weak.
5. Keep the recommended tooling broad and credible.
6. Use all user-provided inputs when relevant, including current tools, current maturity scores, target maturity scores when provided, skip/NA responses, and question comments.
7. Treat target maturity as the desired future state when it is available, and prioritize large current-vs-target gaps.

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
}`;

export function buildAssessmentAnalysisPrompt(profile, notes, assessment) {
  return assessmentAnalysisPromptTemplate
    .replace("{{profile_json}}", JSON.stringify(profile, null, 2))
    .replace("{{notes_json}}", JSON.stringify(notes, null, 2))
    .replace("{{assessment_json}}", JSON.stringify(assessment, null, 2));
}
