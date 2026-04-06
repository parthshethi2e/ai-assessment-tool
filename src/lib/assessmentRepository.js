import { getPrismaClient } from "@/lib/prisma";
import { defaultAssessmentSections } from "@/data/assessmentFramework";

export function hasFrameworkDelegates(prisma) {
  return Boolean(prisma?.assessmentSection && prisma?.assessmentQuestion);
}

function mapQuestion(question) {
  return {
    id: question.key,
    dbId: question.id,
    key: question.key,
    prompt: question.prompt,
    helperText: question.helperText || "",
    why: question.whyItMatters || "",
    whyItMatters: question.whyItMatters || "",
    weight: question.weight,
    sortOrder: question.sortOrder,
    isActive: question.isActive,
  };
}

function mapSection(section) {
  return {
    id: section.key,
    dbId: section.id,
    key: section.key,
    title: section.title,
    description: section.description,
    weight: section.weight,
    sortOrder: section.sortOrder,
    isActive: section.isActive,
    questions: section.questions
      .filter((question) => question.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapQuestion),
  };
}

function mapDefaultFramework() {
  return defaultAssessmentSections.map((section) => ({
    id: section.key,
    dbId: section.id || section.key,
    key: section.key,
    title: section.title,
    description: section.description,
    weight: section.weight,
    sortOrder: section.sortOrder,
    isActive: true,
    questions: section.questions.map((question) => ({
      id: question.key,
      dbId: question.id || question.key,
      key: question.key,
      prompt: question.prompt,
      helperText: question.helperText || "",
      why: question.whyItMatters || "",
      whyItMatters: question.whyItMatters || "",
      weight: question.weight,
      sortOrder: question.sortOrder,
      isActive: true,
    })),
  }));
}

async function countSectionsRaw(prisma) {
  const rows = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "AssessmentSection"`);
  return rows[0]?.count ?? 0;
}

async function getSectionsWithQuestionsRaw(prisma, activeOnly = false) {
  const sections = await prisma.$queryRawUnsafe(
    `SELECT * FROM "AssessmentSection" ${activeOnly ? 'WHERE "isActive" = true' : ""} ORDER BY "sortOrder" ASC`
  );
  const questions = await prisma.$queryRawUnsafe(
    `SELECT * FROM "AssessmentQuestion" ${activeOnly ? 'WHERE "isActive" = true' : ""} ORDER BY "sortOrder" ASC`
  );

  return sections.map((section) => ({
    ...section,
    questions: questions.filter((question) => question.sectionId === section.id),
  }));
}

async function seedDefaultFrameworkRaw(prisma) {
  let sectionOrder = 1;

  for (const section of defaultAssessmentSections) {
    const insertedSections = await prisma.$queryRawUnsafe(
      `
        INSERT INTO "AssessmentSection" ("id", "key", "title", "description", "weight", "sortOrder", "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, true, NOW(), NOW())
        RETURNING *
      `,
      section.key,
      section.title,
      section.description,
      Number(section.weight),
      Number(section.sortOrder || sectionOrder)
    );

    const insertedSection = insertedSections[0];

    for (const question of section.questions) {
      await prisma.$queryRawUnsafe(
        `
          INSERT INTO "AssessmentQuestion" (
            "id",
            "key",
            "sectionId",
            "prompt",
            "helperText",
            "whyItMatters",
            "weight",
            "sortOrder",
            "isActive",
            "createdAt",
            "updatedAt"
          )
          VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
        `,
        question.key,
        insertedSection.id,
        question.prompt,
        question.helperText || null,
        question.whyItMatters || null,
        Number(question.weight),
        Number(question.sortOrder)
      );
    }

    sectionOrder += 1;
  }
}

export async function ensureDefaultAssessmentFramework() {
  const prisma = getPrismaClient();

  if (!hasFrameworkDelegates(prisma)) {
    try {
      const existingCount = await countSectionsRaw(prisma);

      if (existingCount === 0) {
        await seedDefaultFrameworkRaw(prisma);
      }

      return { available: true, mode: "raw" };
    } catch (error) {
      console.error("FRAMEWORK RAW FALLBACK ERROR:", error);
      return { available: false, mode: "default" };
    }
  }

  const existingCount = await prisma.assessmentSection.count();

  if (existingCount > 0) {
    return { available: true, mode: "delegate" };
  }

  for (const section of defaultAssessmentSections) {
    await prisma.assessmentSection.create({
      data: {
        key: section.key,
        title: section.title,
        description: section.description,
        weight: section.weight,
        sortOrder: section.sortOrder,
        questions: {
          create: section.questions.map((question) => ({
            key: question.key,
            prompt: question.prompt,
            helperText: question.helperText || null,
            whyItMatters: question.whyItMatters || null,
            weight: question.weight,
            sortOrder: question.sortOrder,
          })),
        },
      },
    });
  }

  return { available: true, mode: "delegate" };
}

export async function getAssessmentSections() {
  const prisma = getPrismaClient();
  const frameworkStatus = await ensureDefaultAssessmentFramework();

  if (!frameworkStatus.available) {
    return mapDefaultFramework();
  }

  if (frameworkStatus.mode === "raw") {
    const sections = await getSectionsWithQuestionsRaw(prisma, true);
    return sections.map(mapSection);
  }

  const sections = await prisma.assessmentSection.findMany({
    where: { isActive: true },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return sections.map(mapSection);
}

export async function getAdminAssessmentSections() {
  const prisma = getPrismaClient();
  const frameworkStatus = await ensureDefaultAssessmentFramework();

  if (!frameworkStatus.available) {
    return mapDefaultFramework();
  }

  if (frameworkStatus.mode === "raw") {
    const sections = await getSectionsWithQuestionsRaw(prisma, false);
    return sections.map((section) => ({
      ...mapSection(section),
      questions: section.questions.sort((a, b) => a.sortOrder - b.sortOrder).map(mapQuestion),
    }));
  }

  const sections = await prisma.assessmentSection.findMany({
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return sections.map((section) => ({
    ...mapSection(section),
    questions: section.questions.sort((a, b) => a.sortOrder - b.sortOrder).map(mapQuestion),
  }));
}

export async function getAssessmentAdminOverview() {
  const prisma = getPrismaClient();
  const frameworkStatus = await ensureDefaultAssessmentFramework();

  if (!frameworkStatus.available) {
    const surveyCount = await prisma.survey.count();
    const avgScore = await prisma.survey.aggregate({ _avg: { finalScore: true } });
    const recentSurveys = await prisma.survey.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return {
      sectionCount: defaultAssessmentSections.length,
      questionCount: defaultAssessmentSections.reduce((sum, section) => sum + section.questions.length, 0),
      surveyCount,
      averageScore: avgScore._avg.finalScore ? Number(avgScore._avg.finalScore.toFixed(2)) : 0,
      recentSurveys,
      frameworkUnavailable: true,
    };
  }

  if (frameworkStatus.mode === "raw") {
    const [sectionRows, questionRows, surveyCount, avgScore, recentSurveys] = await Promise.all([
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "AssessmentSection" WHERE "isActive" = true`),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "AssessmentQuestion" WHERE "isActive" = true`),
      prisma.survey.count(),
      prisma.survey.aggregate({ _avg: { finalScore: true } }),
      prisma.survey.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return {
      sectionCount: sectionRows[0]?.count ?? 0,
      questionCount: questionRows[0]?.count ?? 0,
      surveyCount,
      averageScore: avgScore._avg.finalScore ? Number(avgScore._avg.finalScore.toFixed(2)) : 0,
      recentSurveys,
      frameworkUnavailable: false,
    };
  }

  const [sectionCount, questionCount, surveyCount, avgScore, recentSurveys] = await Promise.all([
    prisma.assessmentSection.count({ where: { isActive: true } }),
    prisma.assessmentQuestion.count({ where: { isActive: true } }),
    prisma.survey.count(),
    prisma.survey.aggregate({ _avg: { finalScore: true } }),
    prisma.survey.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    sectionCount,
    questionCount,
    surveyCount,
    averageScore: avgScore._avg.finalScore ? Number(avgScore._avg.finalScore.toFixed(2)) : 0,
    recentSurveys,
    frameworkUnavailable: false,
  };
}
