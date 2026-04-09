import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

function createPrismaClient() {
  return new PrismaClient();
}

function hasAssessmentModels(client) {
  return Boolean(client?.assessmentSection && client?.assessmentQuestion && client?.auditLog);
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
