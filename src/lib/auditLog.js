import { getPrismaClient } from "@/lib/prisma";

function hasAuditDelegate(prisma) {
  return Boolean(prisma?.auditLog);
}

function normalizeAuditRows(rows = []) {
  return rows.map((row) => ({
    ...row,
    details:
      typeof row.details === "string"
        ? (() => {
            try {
              return JSON.parse(row.details);
            } catch {
              return row.details;
            }
          })()
        : row.details,
  }));
}

export async function logAuditEvent({ actorEmail = null, actorType = "system", action, entityType, entityId, details = null }) {
  const prisma = getPrismaClient();

  if (hasAuditDelegate(prisma)) {
    return prisma.auditLog.create({
      data: {
        actorEmail,
        actorType,
        action,
        entityType,
        entityId,
        details,
      },
    });
  }

  const rows = await prisma.$queryRawUnsafe(
    `
      INSERT INTO "AuditLog" ("id", "actorEmail", "actorType", "action", "entityType", "entityId", "details", "createdAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6::jsonb, NOW())
      RETURNING *
    `,
    actorEmail,
    actorType,
    action,
    entityType,
    entityId,
    details ? JSON.stringify(details) : null
  );

  return normalizeAuditRows(rows)[0];
}

export async function getAuditEvents(limit = 100) {
  const prisma = getPrismaClient();

  if (hasAuditDelegate(prisma)) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT *
      FROM "AuditLog"
      ORDER BY "createdAt" DESC
      LIMIT $1
    `,
    limit
  );

  return normalizeAuditRows(rows);
}

export async function getAuditEventsForEntity(entityType, entityId) {
  const prisma = getPrismaClient();

  if (hasAuditDelegate(prisma)) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT *
      FROM "AuditLog"
      WHERE "entityType" = $1 AND "entityId" = $2
      ORDER BY "createdAt" DESC
    `,
    entityType,
    entityId
  );

  return normalizeAuditRows(rows);
}
