export function calculateScore(answers, stepsConfig) {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  let categoryScores = {};

  stepsConfig.forEach((step) => {
    let categoryTotal = 0;
    let categoryWeight = 0;

    step.questions.forEach((q) => {
      const answer = answers[q.id] || 0;
      const weight = q.weight || 1;

      categoryTotal += answer * weight;
      categoryWeight += weight;

      totalWeightedScore += answer * weight;
      totalWeight += weight;
    });

    categoryScores[step.slug] = categoryWeight
      ? categoryTotal / categoryWeight
      : 0;
  });

  const finalScore = totalWeight
    ? totalWeightedScore / totalWeight
    : 0;

  return {
    finalScore: Number(finalScore.toFixed(2)),
    categoryScores,
  };
}

export function getMaturityLevel(score) {
  if (score < 2) return "Beginner";
  if (score < 3) return "Emerging";
  if (score < 4) return "Scaling";
  return "AI-Driven";
}