import { getPrismaClient } from "@/lib/prisma";

const SETTINGS_KEY = "default";

function hasSettingsDelegate(prisma) {
  return Boolean(prisma?.assessmentSetting);
}

export async function ensureAssessmentSettings() {
  const prisma = getPrismaClient();

  if (hasSettingsDelegate(prisma)) {
    const existing = await prisma.assessmentSetting.findUnique({
      where: { key: SETTINGS_KEY },
    });

    if (existing) {
      return existing;
    }

    return prisma.assessmentSetting.create({
      data: {
        key: SETTINGS_KEY,
        reportGenerationEnabled: true,
      },
    });
  }

  const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "AssessmentSetting" WHERE "key" = $1 LIMIT 1`, SETTINGS_KEY);
  const existing = rows[0];

  if (existing) {
    return existing;
  }

  const inserted = await prisma.$queryRawUnsafe(
    `
      INSERT INTO "AssessmentSetting" ("id", "key", "reportGenerationEnabled", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, true, NOW(), NOW())
      RETURNING *
    `,
    SETTINGS_KEY
  );

  return inserted[0];
}

export async function getAssessmentSettings() {
  return ensureAssessmentSettings();
}

export async function updateAssessmentSettings(data) {
  const prisma = getPrismaClient();
  const current = await ensureAssessmentSettings();

  if (hasSettingsDelegate(prisma)) {
    return prisma.assessmentSetting.update({
      where: { id: current.id },
      data: {
        reportGenerationEnabled: data.reportGenerationEnabled,
      },
    });
  }

  const rows = await prisma.$queryRawUnsafe(
    `
      UPDATE "AssessmentSetting"
      SET "reportGenerationEnabled" = $2,
          "updatedAt" = NOW()
      WHERE "id" = $1
      RETURNING *
    `,
    current.id,
    data.reportGenerationEnabled
  );

  return rows[0];
}
