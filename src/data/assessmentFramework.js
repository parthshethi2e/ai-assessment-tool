export const organizationTypes = [
  {
    id: "for-profit",
    label: "For-profit",
    description: "Commercial organizations focused on growth, margin, customer value, and competitive advantage.",
  },
  {
    id: "non-profit",
    label: "Non-profit",
    description: "Mission-led organizations balancing impact, donor accountability, program delivery, and capacity.",
  },
];

export const sectorOptions = [
  "Technology",
  "Healthcare",
  "Education",
  "Financial Services",
  "Retail",
  "Manufacturing",
  "Professional Services",
  "Government / Public Sector",
  "NGO / Charity",
  "Foundation / Philanthropy",
  "Social Impact",
  "Other",
];

export const sizeBands = [
  "1-25",
  "26-100",
  "101-500",
  "501-2000",
  "2000+",
];

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

export const timelineOptions = [
  "0-3 months",
  "3-6 months",
  "6-12 months",
  "12+ months",
];

export const priorityOptions = [
  "Operational efficiency",
  "Customer / constituent experience",
  "Revenue growth",
  "Mission impact",
  "Risk reduction",
  "Workforce enablement",
];

export const scoreLabels = [
  "Not in place",
  "Exploring",
  "Emerging",
  "Operational",
  "Leading",
];

export const assessmentSections = [
  {
    id: "strategy",
    title: "Strategy & Leadership",
    description: "Checks whether leadership has a real mandate, priorities, and ownership model for AI.",
    weight: 1.2,
    questions: [
      {
        id: "strategy_vision",
        prompt: "Leadership has a clearly defined AI vision linked to organization goals.",
        why: "A strong vision keeps AI efforts tied to measurable outcomes rather than disconnected experiments.",
        weight: 1.2,
      },
      {
        id: "strategy_prioritization",
        prompt: "AI priorities are translated into funded initiatives with named owners.",
        why: "Ownership and funding are what move AI from ideas into operational execution.",
        weight: 1,
      },
      {
        id: "strategy_change",
        prompt: "Leaders actively prepare teams for process changes created by AI adoption.",
        why: "Change readiness often determines whether teams trust and use new AI-enabled workflows.",
        weight: 1.1,
      },
    ],
  },
  {
    id: "data",
    title: "Data Readiness",
    description: "Measures how usable, governed, and accessible the underlying data foundation is.",
    weight: 1.25,
    questions: [
      {
        id: "data_quality",
        prompt: "Core data is reliable, complete, and available for decision-making.",
        why: "Weak data quality causes poor model performance and low trust in outputs.",
        weight: 1.3,
      },
      {
        id: "data_governance",
        prompt: "There is an active practice for data governance, ownership, and stewardship.",
        why: "Governance reduces ambiguity over sensitive data, quality issues, and accountability.",
        weight: 1.1,
      },
      {
        id: "data_access",
        prompt: "Teams can access the data they need without major manual effort or bottlenecks.",
        why: "Accessible data shortens delivery time and makes AI use cases easier to scale.",
        weight: 1,
      },
    ],
  },
  {
    id: "technology",
    title: "Technology & Infrastructure",
    description: "Looks at modern systems, interoperability, and the ability to deploy AI safely.",
    weight: 1.1,
    questions: [
      {
        id: "technology_stack",
        prompt: "The current technology stack can integrate modern AI services and automation workflows.",
        why: "Outdated systems create high integration cost and limit deployment options.",
        weight: 1.2,
      },
      {
        id: "technology_security",
        prompt: "Security, identity, and access controls are ready for AI-enabled products and workflows.",
        why: "AI adoption expands the attack surface and increases the need for disciplined controls.",
        weight: 1,
      },
      {
        id: "technology_delivery",
        prompt: "The organization can test, deploy, and monitor digital changes with reasonable speed.",
        why: "AI programs require iteration speed, not just a one-time implementation push.",
        weight: 1,
      },
    ],
  },
  {
    id: "adoption",
    title: "AI Use Cases & Adoption",
    description: "Assesses whether AI is already creating value in the business or mission workflow.",
    weight: 1.2,
    questions: [
      {
        id: "adoption_use_cases",
        prompt: "There are active AI use cases in important operational, customer, or program workflows.",
        why: "Maturity improves when AI is embedded in work that matters, not isolated pilots.",
        weight: 1.2,
      },
      {
        id: "adoption_measurement",
        prompt: "AI initiatives are measured with clear success metrics and review cadences.",
        why: "Teams need evidence to decide what to scale, stop, or redesign.",
        weight: 1.1,
      },
      {
        id: "adoption_genai",
        prompt: "The organization uses generative AI with practical guardrails and repeatable patterns.",
        why: "Generative AI can deliver fast wins, but only when used with responsible controls.",
        weight: 1,
      },
    ],
  },
  {
    id: "people",
    title: "Workforce & Change Capacity",
    description: "Covers AI literacy, specialist capability, and confidence across teams.",
    weight: 1.05,
    questions: [
      {
        id: "people_literacy",
        prompt: "Teams understand where AI can help and where it introduces risk.",
        why: "Basic literacy is the foundation for adoption, oversight, and healthy experimentation.",
        weight: 1.1,
      },
      {
        id: "people_talent",
        prompt: "The organization has access to the technical and operational skills needed to deliver AI initiatives.",
        why: "Delivery depends on both internal talent and trusted partners who can execute responsibly.",
        weight: 1.1,
      },
      {
        id: "people_enablement",
        prompt: "Employees are given training, guidance, and support to use new AI tools effectively.",
        why: "Enablement turns enthusiasm into repeatable outcomes instead of sporadic tool usage.",
        weight: 1,
      },
    ],
  },
  {
    id: "governance",
    title: "Governance, Risk & Ethics",
    description: "Focuses on policy, privacy, compliance, and human oversight.",
    weight: 1.2,
    questions: [
      {
        id: "governance_policy",
        prompt: "The organization has clear AI usage policies and review practices.",
        why: "Policy creates consistency around acceptable use, approvals, and accountability.",
        weight: 1.2,
      },
      {
        id: "governance_privacy",
        prompt: "Privacy, security, and regulatory concerns are actively considered in AI work.",
        why: "Legal and reputational risk can grow quickly when AI touches sensitive information.",
        weight: 1.2,
      },
      {
        id: "governance_human",
        prompt: "High-impact AI decisions include meaningful human oversight and escalation paths.",
        why: "Oversight reduces harm and improves trust in AI-assisted decision-making.",
        weight: 1,
      },
    ],
  },
  {
    id: "operations",
    title: "Operations & Delivery",
    description: "Looks at process discipline, workflow readiness, and the ability to operationalize improvements.",
    weight: 1.05,
    questions: [
      {
        id: "operations_processes",
        prompt: "Key processes are documented well enough to automate or augment with AI.",
        why: "Messy or inconsistent workflows make automation brittle and difficult to scale.",
        weight: 1.1,
      },
      {
        id: "operations_collaboration",
        prompt: "Business, program, and technology teams work together effectively on transformation efforts.",
        why: "Cross-functional execution is what turns AI ideas into durable operational changes.",
        weight: 1,
      },
      {
        id: "operations_vendor",
        prompt: "The organization can evaluate vendors, tools, and implementation partners with discipline.",
        why: "Strong vendor selection prevents expensive tooling that does not fit real workflow needs.",
        weight: 1,
      },
    ],
  },
  {
    id: "impact",
    title: "Financial Capacity & Impact Measurement",
    description: "Balances investment discipline with measurable business or mission outcomes.",
    weight: 1.15,
    questions: [
      {
        id: "impact_business_case",
        prompt: "AI opportunities are evaluated with a realistic business case or mission-case.",
        why: "Clear investment logic helps teams choose initiatives that are worth the effort.",
        weight: 1.2,
      },
      {
        id: "impact_reporting",
        prompt: "The organization can report outcomes from AI initiatives to leadership, funders, or stakeholders.",
        why: "Transparent reporting supports trust, continued funding, and prioritization.",
        weight: 1,
      },
      {
        id: "impact_capacity",
        prompt: "There is enough financial or operational capacity to sustain AI work beyond a pilot stage.",
        why: "Many AI efforts stall when there is no plan to fund maintenance and adoption over time.",
        weight: 1.1,
      },
    ],
  },
];

