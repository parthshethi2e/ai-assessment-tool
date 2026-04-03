export function generateRecommendations(categoryScores) {
  let recommendations = [];

  if (categoryScores.data < 3) {
    recommendations.push(
      "Improve data quality, governance, and centralization"
    );
  }

  if (categoryScores["ai-usage"] < 3) {
    recommendations.push(
      "Start with pilot AI use cases and gradually scale"
    );
  }

  if (categoryScores.leadership < 3) {
    recommendations.push(
      "Define a clear AI strategy and leadership vision"
    );
  }

  if (categoryScores.workforce < 3) {
    recommendations.push(
      "Invest in AI training and hiring skilled talent"
    );
  }

  if (categoryScores.governance < 3) {
    recommendations.push(
      "Establish AI governance and compliance frameworks"
    );
  }

  return recommendations;
}