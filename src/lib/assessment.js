const stageThresholds = [
  { min: 0, label: "Foundational" },
  { min: 2.2, label: "Developing" },
  { min: 3.2, label: "Operational" },
  { min: 4.2, label: "Leading" },
];

const sectionAdvice = {
  strategy: {
    title: "Create a decision-ready AI strategy",
    description: "Define outcomes, owners, and funding so the roadmap is anchored to business or mission value.",
  },
  data: {
    title: "Strengthen the data foundation",
    description: "Prioritize data quality, ownership, and accessible reporting before scaling more advanced AI use cases.",
  },
  technology: {
    title: "Modernize delivery foundations",
    description: "Reduce integration friction and tighten security controls so AI capabilities can move safely into production.",
  },
  adoption: {
    title: "Focus on high-value use cases",
    description: "Select a few measurable use cases, define success metrics, and avoid scattering effort across too many experiments.",
  },
  people: {
    title: "Invest in workforce readiness",
    description: "Build literacy, practical guidance, and execution support so teams can adopt AI confidently.",
  },
  governance: {
    title: "Stand up governance guardrails",
    description: "Formalize policy, privacy review, and human oversight for higher-risk AI workflows.",
  },
  operations: {
    title: "Operationalize change delivery",
    description: "Document processes, assign cross-functional ownership, and standardize how new AI workflows are rolled out.",
  },
  impact: {
    title: "Measure value and sustainability",
    description: "Link initiatives to quantified outcomes, reporting expectations, and sustainable resourcing.",
  },
};

export function getResponseRecord(response) {
  if (typeof response === "number") {
    return {
      mode: "score",
      score: response,
      comment: "",
    };
  }

  if (response && typeof response === "object") {
    return {
      mode: response.mode || (typeof response.score === "number" ? "score" : ""),
      score: typeof response.score === "number" ? response.score : null,
      comment: typeof response.comment === "string" ? response.comment : "",
    };
  }

  return {
    mode: "",
    score: null,
    comment: "",
  };
}

export function isResolvedResponse(response) {
  const record = getResponseRecord(response);
  return Boolean(record.mode);
}

export function getScoredResponseValue(response) {
  const record = getResponseRecord(response);
  return record.mode === "score" && typeof record.score === "number" ? record.score : 0;
}

const useCaseLibrary = {
  "for-profit": {
    default: [
      "Internal knowledge assistant for policy, SOP, and sales enablement",
      "Workflow automation for repetitive back-office tasks",
      "Customer support triage and response drafting",
    ],
    Technology: [
      "Engineering support assistant for specs, QA, and incident analysis",
      "Customer success knowledge assistant",
      "Revenue operations forecasting and pipeline intelligence",
    ],
    Healthcare: [
      "Clinical operations documentation assistant",
      "Revenue cycle workflow automation",
      "Patient support triage with human review",
    ],
    Retail: [
      "Demand forecasting and inventory optimization",
      "Merchandising insights and pricing analysis",
      "Customer service automation with escalation controls",
    ],
  },
  "non-profit": {
    default: [
      "Grant and donor reporting assistant",
      "Program operations knowledge assistant",
      "Volunteer and beneficiary communication support",
    ],
    Education: [
      "Student or learner support assistant",
      "Curriculum and knowledge-base search",
      "Administrative workflow automation",
    ],
    "NGO / Charity": [
      "Case-note summarization with human review",
      "Impact reporting and donor update drafting",
      "Field operations knowledge assistant",
    ],
    "Foundation / Philanthropy": [
      "Grant application triage support",
      "Portfolio reporting assistant",
      "Research synthesis for funding decisions",
    ],
    "Social Impact": [
      "Impact measurement and outcome reporting assistant",
      "Community engagement response drafting",
      "Operations automation for lean teams",
    ],
  },
};

export function getStage(score) {
  let stage = stageThresholds[0].label;

  for (const threshold of stageThresholds) {
    if (score >= threshold.min) {
      stage = threshold.label;
    }
  }

  return stage;
}

export function getBenchmarkLabel(score) {
  if (score >= 4.1) return "ahead of peers";
  if (score >= 3.3) return "competitive with peers";
  if (score >= 2.5) return "slightly behind peers";
  return "materially behind peers";
}

export function getRecommendedUseCases(profile) {
  const orgType = profile.organizationType || "for-profit";
  const sector = profile.sector;
  const library = useCaseLibrary[orgType] || useCaseLibrary["for-profit"];

  return library[sector] || library.default;
}

export function calculateAssessment(draft, sections = []) {
  const responses = draft.responses || {};
  const scoredSections = sections.map((section) => {
    let weightedPoints = 0;
    let totalWeight = 0;
    let answered = 0;
    let scoredAnswers = 0;
    let skipped = 0;
    let notAnswered = 0;
    const questionSummaries = [];

    for (const question of section.questions) {
      const response = getResponseRecord(responses[question.id]);
      const value = getScoredResponseValue(response);
      const weight = question.weight || 1;

      if (response.mode === "score" && value > 0) {
        answered += 1;
        scoredAnswers += 1;
      }

      if (response.mode === "skip") {
        skipped += 1;
      }

      if (response.mode === "na") {
        notAnswered += 1;
      }

      if (response.mode === "score" && value > 0) {
        weightedPoints += value * weight;
        totalWeight += weight;
      }

      questionSummaries.push({
        id: question.id,
        prompt: question.prompt,
        helperText: question.helperText || "",
        why: question.why || question.whyItMatters || "",
        mode: response.mode,
        score: response.score,
        comment: response.comment,
      });
    }

    const score = totalWeight ? Number((weightedPoints / totalWeight).toFixed(2)) : 0;

    return {
      id: section.id,
      title: section.title,
      description: section.description,
      score,
      weight: section.weight || 1,
      answered,
      scoredAnswers,
      skipped,
      notAnswered,
      totalQuestions: section.questions.length,
      questions: questionSummaries,
    };
  });

  const weightedTotal = scoredSections.reduce((sum, section) => sum + section.score * section.weight, 0);
  const weightTotal = scoredSections.reduce((sum, section) => sum + section.weight, 0);
  const answeredQuestions = scoredSections.reduce((sum, section) => sum + section.answered, 0);
  const totalQuestions = scoredSections.reduce((sum, section) => sum + section.totalQuestions, 0);
  const finalScore = weightTotal ? Number((weightedTotal / weightTotal).toFixed(2)) : 0;
  const confidence = totalQuestions ? Number((answeredQuestions / totalQuestions).toFixed(2)) : 0;
  const stage = getStage(finalScore);
  const strengths = [...scoredSections].sort((a, b) => b.score - a.score).slice(0, 3);
  const priorities = [...scoredSections].sort((a, b) => a.score - b.score).slice(0, 3);
  const benchmark = getBenchmarkLabel(finalScore);
  const recommendedUseCases = getRecommendedUseCases(draft.profile || {});
  const recommendations = priorities.map((section, index) => ({
    rank: index + 1,
    sectionId: section.id,
    section: section.title,
    score: section.score,
    ...sectionAdvice[section.id],
  }));

  return {
    finalScore,
    confidence,
    stage,
    benchmark,
    scoredSections,
    strengths,
    priorities,
    recommendations,
    recommendedUseCases,
  };
}

export function buildLocalRoadmap(assessment, draft) {
  const first = assessment.recommendations[0];
  const second = assessment.recommendations[1];
  const third = assessment.recommendations[2];
  const priority = draft.notes?.priority || "operational efficiency";

  return {
    shortTerm: [
      `Align leadership around 2-3 AI outcomes tied to ${priority.toLowerCase()}.`,
      `Launch a readiness sprint focused on ${first?.section || "the lowest-scoring capability"} and assign accountable owners.`,
      "Define initial policy, approved tools, and escalation rules for responsible AI usage.",
    ],
    midTerm: [
      `Pilot one high-value use case such as ${assessment.recommendedUseCases[0]?.toLowerCase() || "workflow automation"} with measurable success criteria.`,
      `Improve operating discipline in ${second?.section || "cross-functional delivery"} with standard review cadences and dashboards.`,
      "Create workforce enablement material, practical playbooks, and adoption metrics for key teams.",
    ],
    longTerm: [
      `Scale proven use cases and formalize an operating model that strengthens ${third?.section || "impact measurement"}.`,
      "Establish a quarterly AI portfolio review that balances value, risk, and capacity.",
      "Benchmark progress annually and refresh the roadmap against organization strategy.",
    ],
  };
}

export function generateFallbackAnalysis(draft, assessment) {
  const roadmap = buildLocalRoadmap(assessment, draft);

  return {
    summary: {
      headline: `${draft.profile?.organizationName || "This organization"} is currently at the ${assessment.stage} stage of AI readiness.`,
      current_state: `The organization shows strongest readiness in ${assessment.strengths[0]?.title || "a few foundational areas"}, but it remains ${assessment.benchmark} overall with a score of ${assessment.finalScore}/5.`,
      key_risk: `The biggest delivery risk is weak readiness in ${assessment.priorities[0]?.title || "core operating foundations"}, which could slow adoption and increase execution friction.`,
      recommended_focus: `Focus the next quarter on ${assessment.priorities.map((item) => item.title).join(", ")} while proving value with one measurable use case.`,
    },
    gaps: assessment.priorities.map((item) => ({
      area: item.title,
      description: sectionAdvice[item.id]?.description || "This area is limiting execution maturity and should be improved before scaling AI broadly.",
    })),
    opportunities: assessment.recommendedUseCases.map((item) => ({
      opportunity: item,
      description: `This use case is a strong fit for a ${draft.profile?.organizationType || "for-profit"} organization in ${draft.profile?.sector || "its sector"} and can be scoped as a pragmatic near-term pilot.`,
    })),
    roadmap: {
      short_term: roadmap.shortTerm,
      mid_term: roadmap.midTerm,
      long_term: roadmap.longTerm,
    },
    tools: {
      data: ["Snowflake", "BigQuery", "Airtable", "Power BI"],
      ai: ["OpenAI", "Azure OpenAI", "LangChain", "Notion AI"],
      cloud: ["AWS", "Azure", "Google Cloud"],
    },
    budget: {
      level: assessment.finalScore >= 3.5 ? "Moderate expansion budget" : "Focused pilot budget",
      rationale: "Start with a narrow implementation scope, prove measurable outcomes, and fund scale-up based on adoption and risk readiness.",
    },
  };
}

export function normalizeAnalysis(analysis, draft, assessment) {
  const fallback = generateFallbackAnalysis(draft, assessment);
  const safe = analysis && typeof analysis === "object" ? analysis : {};

  return {
    summary: {
      headline: safe.summary?.headline || fallback.summary.headline,
      current_state: safe.summary?.current_state || fallback.summary.current_state,
      key_risk: safe.summary?.key_risk || fallback.summary.key_risk,
      recommended_focus: safe.summary?.recommended_focus || fallback.summary.recommended_focus,
    },
    gaps: Array.isArray(safe.gaps) && safe.gaps.length ? safe.gaps : fallback.gaps,
    opportunities: Array.isArray(safe.opportunities) && safe.opportunities.length ? safe.opportunities : fallback.opportunities,
    roadmap: {
      short_term: Array.isArray(safe.roadmap?.short_term) && safe.roadmap.short_term.length ? safe.roadmap.short_term : fallback.roadmap.short_term,
      mid_term: Array.isArray(safe.roadmap?.mid_term) && safe.roadmap.mid_term.length ? safe.roadmap.mid_term : fallback.roadmap.mid_term,
      long_term: Array.isArray(safe.roadmap?.long_term) && safe.roadmap.long_term.length ? safe.roadmap.long_term : fallback.roadmap.long_term,
    },
    tools: {
      data: Array.isArray(safe.tools?.data) && safe.tools.data.length ? safe.tools.data : fallback.tools.data,
      ai: Array.isArray(safe.tools?.ai) && safe.tools.ai.length ? safe.tools.ai : fallback.tools.ai,
      cloud: Array.isArray(safe.tools?.cloud) && safe.tools.cloud.length ? safe.tools.cloud : fallback.tools.cloud,
    },
    budget: {
      level: safe.budget?.level || fallback.budget.level,
      rationale: safe.budget?.rationale || fallback.budget.rationale,
    },
  };
}
