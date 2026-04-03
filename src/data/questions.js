export const stepsConfig = [
  {
    slug: "data",
    title: "Data Infrastructure",
    questions: [
      { id: "di_01", text: "How would you rate the quality and completeness of your organization's data assets?", weight: 1.5 },
      { id: "di_02", text: "How mature is your organization's data storage and management infrastructure?", weight: 1.2 },
      { id: "di_03", text: "To what extent does your organization practice formal data governance?", weight: 1.0 },
      { id: "di_04", text: "How well does your organization collect and utilize real-time data?", weight: 1.0 },
    ],
  },
  {
    slug: "technology",
    title: "Technology Stack",
    questions: [
      { id: "ts_01", text: "How modern is your technology stack?", weight: 1.3 },
      { id: "ts_02", text: "How much do you use analytics tools?", weight: 1.1 },
      { id: "ts_03", text: "How robust is your AI infrastructure?", weight: 1.4 },
    ],
  },
  {
    slug: "ai-usage",
    title: "AI/ML Usage",
    questions: [
      { id: "ai_01", text: "How extensively is AI used in business processes?", weight: 2.0 },
      { id: "ai_02", text: "What is the sophistication of AI models?", weight: 1.5 },
      { id: "ai_03", text: "How well do you track AI performance?", weight: 1.2 },
      { id: "ai_04", text: "How broadly is GenAI adopted?", weight: 1.3 },
    ],
  },
  {
    slug: "workforce",
    title: "Workforce Skills",
    questions: [
      { id: "ws_01", text: "How strong is AI literacy?", weight: 1.4 },
      { id: "ws_02", text: "How strong is AI talent?", weight: 1.5 },
      { id: "ws_03", text: "How much training investment?", weight: 1.1 },
    ],
  },
  {
    slug: "leadership",
    title: "Leadership Vision",
    questions: [
      { id: "lv_01", text: "How clear is AI strategy?", weight: 1.8 },
      { id: "lv_02", text: "Leadership commitment to AI?", weight: 1.6 },
      { id: "lv_03", text: "Change management effectiveness?", weight: 1.2 },
    ],
  },
  {
    slug: "operations",
    title: "Operational Processes",
    questions: [
      { id: "op_01", text: "Automation level?", weight: 1.4 },
      { id: "op_02", text: "Data-driven decisions?", weight: 1.6 },
      { id: "op_03", text: "AI in customer ops?", weight: 1.3 },
    ],
  },
  {
    slug: "governance",
    title: "Governance & Ethics",
    questions: [
      { id: "ge_01", text: "AI governance maturity?", weight: 1.5 },
      { id: "ge_02", text: "Ethical AI practices?", weight: 1.4 },
      { id: "ge_03", text: "Compliance & privacy?", weight: 1.5 },
    ],
  },
];