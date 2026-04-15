import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

function createPrismaClient() {
  return new PrismaClient();
}

function hasAssessmentModels(client) {
  const questionFields = client?._runtimeDataModel?.models?.AssessmentQuestion?.fields || [];
  const hasQuestionScoreLabels = questionFields.some((field) => field.name === "scoreLabels");
  const hasQuestionRequiresTarget = questionFields.some((field) => field.name === "requiresTarget");

  return Boolean(client?.assessmentSection && client?.assessmentQuestion && client?.auditLog && hasQuestionScoreLabels && hasQuestionRequiresTarget);
}

export function getPrismaClient() {
  const cachedPrisma = globalForPrisma.prisma;

  if (hasAssessmentModels(cachedPrisma)) {
    return cachedPrisma;
  }

  const prismaClient = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaClient;
  }

  return prismaClient;
}

export const prisma = getPrismaClient();
