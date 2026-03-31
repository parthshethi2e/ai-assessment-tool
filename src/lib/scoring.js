export function calculateMaturityScore(survey) {
  const score =
    survey.dataScore * 0.2 +
    survey.techScore * 0.15 +
    survey.aiUsageScore * 0.2 +
    survey.workforceScore * 0.15 +
    survey.leadershipScore * 0.15 +
    survey.governanceScore * 0.15;

  return score;
}

export function getMaturityLevel(score) {
  if (score < 1.5) return "No AI";
  if (score < 2.5) return "Beginner";
  if (score < 3.5) return "Intermediate";
  if (score < 4.5) return "Advanced";
  return "AI-Driven";
}