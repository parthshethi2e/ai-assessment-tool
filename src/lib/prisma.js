import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

function createPrismaClient() {
  return new PrismaClient();
}

function hasAssessmentModels(client) {
  const questionFields = client?._runtimeDataModel?.models?.AssessmentQuestion?.fields || [];
  const hasQuestionScoreLabels = questionFields.some((field) => field.name === "scoreLabels");

  return Boolean(client?.assessmentSection && client?.assessmentQuestion && client?.auditLog && hasQuestionScoreLabels);
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
