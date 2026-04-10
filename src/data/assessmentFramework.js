export const defaultScoreLabels = {
  1: "Not in place",
  2: "Exploring",
  3: "Emerging",
  4: "Operational",
  5: "Leading",
};

export const sectorOptions = [
  "Pharma",
  "Publishing",
  "Healthcare",
  "Biotech",
];

export const sizeBands = ["1-25", "26-100", "101-500", "501-2000", "2000+"];

export const annualBudgetBands = [
  "Under $500k",
  "$500k - $2M",
  "$2M - $10M",
  "$10M - $50M",
  "$50M+",
];

export const respondentRoles = [
  "Executive leadership",
  "Operations",
  "Technology / IT",
  "Data / Analytics",
  "Program / Service delivery",
  "Finance",
  "People / HR",
  "Compliance / Risk",
];

export const timelineOptions = ["0-3 months", "3-6 months", "6-12 months", "12+ months"];

export const priorityOptions = [
  "Operational efficiency",
  "Customer / constituent experience",
  "Revenue growth",
  "Mission impact",
  "Risk reduction",
  "Workforce enablement",
];

export const scoreLabels = Object.values(defaultScoreLabels);

export const defaultAssessmentSections = [
  {
    key: "strategy",
    title: "Strategy & Leadership",
    description: "Checks whether leadership has a real mandate, priorities, and ownership model for AI.",
    weight: 1.2,
    sortOrder: 1,
    questions: [
      {
        key: "strategy_vision",
        prompt: "Leadership has a clearly defined AI vision linked to organization goals.",
        whyItMatters: "A strong vision keeps AI efforts tied to measurable outcomes rather than disconnected experiments.",
        weight: 1.2,
        sortOrder: 1,
      },
      {
        key: "strategy_prioritization",
        prompt: "AI priorities are translated into funded initiatives with named owners.",
        whyItMatters: "Ownership and funding are what move AI from ideas into operational execution.",
        weight: 1,
        sortOrder: 2,
      },
      {
        key: "strategy_change",
        prompt: "Leaders actively prepare teams for process changes created by AI adoption.",
        whyItMatters: "Change readiness often determines whether teams trust and use new AI-enabled workflows.",
        weight: 1.1,
        sortOrder: 3,
      },
    ],
  },
  {
    key: "data",
    title: "Data Readiness",
    description: "Measures how usable, governed, and accessible the underlying data foundation is.",
    weight: 1.25,
    sortOrder: 2,
    questions: [
      {
        key: "data_quality",
        prompt: "Core data is reliable, complete, and available for decision-making.",
        whyItMatters: "Weak data quality causes poor model performance and low trust in outputs.",
        weight: 1.3,
        sortOrder: 1,
      },
      {
        key: "data_governance",
        prompt: "There is an active practice for data governance, ownership, and stewardship.",
        whyItMatters: "Governance reduces ambiguity over sensitive data, quality issues, and accountability.",
        weight: 1.1,
        sortOrder: 2,
      },
      {
        key: "data_access",
        prompt: "Teams can access the data they need without major manual effort or bottlenecks.",
        whyItMatters: "Accessible data shortens delivery time and makes AI use cases easier to scale.",
        weight: 1,
        sortOrder: 3,
      },
    ],
  },
  {
    key: "technology",
    title: "Technology & Infrastructure",
    description: "Looks at modern systems, interoperability, and the ability to deploy AI safely.",
    weight: 1.1,
    sortOrder: 3,
    questions: [
      {
        key: "technology_stack",
        prompt: "The current technology stack can integrate modern AI services and automation workflows.",
        whyItMatters: "Outdated systems create high integration cost and limit deployment options.",
        weight: 1.2,
        sortOrder: 1,
      },
      {
        key: "technology_security",
        prompt: "Security, identity, and access controls are ready for AI-enabled products and workflows.",
        whyItMatters: "AI adoption expands the attack surface and increases the need for disciplined controls.",
        weight: 1,
        sortOrder: 2,
      },
      {
        key: "technology_delivery",
        prompt: "The organization can test, deploy, and monitor digital changes with reasonable speed.",
        whyItMatters: "AI programs require iteration speed, not just a one-time implementation push.",
        weight: 1,
        sortOrder: 3,
      },
    ],
  },
  {
    key: "adoption",
    title: "AI Use Cases & Adoption",
    description: "Assesses whether AI is already creating value in the business or mission workflow.",
    weight: 1.2,
    sortOrder: 4,
    questions: [
      {
        key: "adoption_use_cases",
        prompt: "There are active AI use cases in important operational, customer, or program workflows.",
        whyItMatters: "Maturity improves when AI is embedded in work that matters, not isolated pilots.",
        weight: 1.2,
        sortOrder: 1,
      },
      {
        key: "adoption_measurement",
        prompt: "AI initiatives are measured with clear success metrics and review cadences.",
        whyItMatters: "Teams need evidence to decide what to scale, stop, or redesign.",
        weight: 1.1,
        sortOrder: 2,
      },
      {
        key: "adoption_genai",
        prompt: "The organization uses generative AI with practical guardrails and repeatable patterns.",
        whyItMatters: "Generative AI can deliver fast wins, but only when used with responsible controls.",
        weight: 1,
        sortOrder: 3,
      },
    ],
  },
  {
    key: "people",
    title: "Workforce & Change Capacity",
    description: "Covers AI literacy, specialist capability, and confidence across teams.",
    weight: 1.05,
    sortOrder: 5,
    questions: [
      {
        key: "people_literacy",
        prompt: "Teams understand where AI can help and where it introduces risk.",
        whyItMatters: "Basic literacy is the foundation for adoption, oversight, and healthy experimentation.",
        weight: 1.1,
        sortOrder: 1,
      },
      {
        key: "people_talent",
        prompt: "The organization has access to the technical and operational skills needed to deliver AI initiatives.",
        whyItMatters: "Delivery depends on both internal talent and trusted partners who can execute responsibly.",
        weight: 1.1,
        sortOrder: 2,
      },
      {
        key: "people_enablement",
        prompt: "Employees are given training, guidance, and support to use new AI tools effectively.",
        whyItMatters: "Enablement turns enthusiasm into repeatable outcomes instead of sporadic tool usage.",
        weight: 1,
        sortOrder: 3,
      },
    ],
  },
  {
    key: "governance",
    title: "Governance, Risk & Ethics",
    description: "Focuses on policy, privacy, compliance, and human oversight.",
    weight: 1.2,
    sortOrder: 6,
    questions: [
      {
        key: "governance_policy",
        prompt: "The organization has clear AI usage policies and review practices.",
        whyItMatters: "Policy creates consistency around acceptable use, approvals, and accountability.",
        weight: 1.2,
        sortOrder: 1,
      },
      {
        key: "governance_privacy",
        prompt: "Privacy, security, and regulatory concerns are actively considered in AI work.",
        whyItMatters: "Legal and reputational risk can grow quickly when AI touches sensitive information.",
        weight: 1.2,
        sortOrder: 2,
      },
      {
        key: "governance_human",
        prompt: "High-impact AI decisions include meaningful human oversight and escalation paths.",
        whyItMatters: "Oversight reduces harm and improves trust in AI-assisted decision-making.",
        weight: 1,
        sortOrder: 3,
      },
    ],
  },
  {
    key: "operations",
    title: "Operations & Delivery",
    description: "Looks at process discipline, workflow readiness, and the ability to operationalize improvements.",
    weight: 1.05,
    sortOrder: 7,
    questions: [
      {
        key: "operations_processes",
        prompt: "Key processes are documented well enough to automate or augment with AI.",
        whyItMatters: "Messy or inconsistent workflows make automation brittle and difficult to scale.",
        weight: 1.1,
        sortOrder: 1,
      },
      {
        key: "operations_collaboration",
        prompt: "Business, program, and technology teams work together effectively on transformation efforts.",
        whyItMatters: "Cross-functional execution is what turns AI ideas into durable operational changes.",
        weight: 1,
        sortOrder: 2,
      },
      {
        key: "operations_vendor",
        prompt: "The organization can evaluate vendors, tools, and implementation partners with discipline.",
        whyItMatters: "Strong vendor selection prevents expensive tooling that does not fit real workflow needs.",
        weight: 1,
        sortOrder: 3,
      },
    ],
  },
  {
    key: "impact",
    title: "Financial Capacity & Impact Measurement",
    description: "Balances investment discipline with measurable business or mission outcomes.",
    weight: 1.15,
    sortOrder: 8,
    questions: [
      {
        key: "impact_business_case",
        prompt: "AI opportunities are evaluated with a realistic business case or mission-case.",
        whyItMatters: "Clear investment logic helps teams choose initiatives that are worth the effort.",
        weight: 1.2,
        sortOrder: 1,
      },
      {
        key: "impact_reporting",
        prompt: "The organization can report outcomes from AI initiatives to leadership, funders, or stakeholders.",
        whyItMatters: "Transparent reporting supports trust, continued funding, and prioritization.",
        weight: 1,
        sortOrder: 2,
      },
      {
        key: "impact_capacity",
        prompt: "There is enough financial or operational capacity to sustain AI work beyond a pilot stage.",
        whyItMatters: "Many AI efforts stall when there is no plan to fund maintenance and adoption over time.",
        weight: 1.1,
        sortOrder: 3,
      },
    ],
  },
];
