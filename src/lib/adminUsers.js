import crypto from "node:crypto";
import { hashPassword } from "@/lib/adminAuth";
import { getPrismaClient } from "@/lib/prisma";

export const SUPER_ADMIN_EMAIL = "admin@i2econsulting.com";

const profileColumnSql = [
  `ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "firstName" TEXT`,
  `ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "lastName" TEXT`,
  `ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "mobileNumber" TEXT`,
  `ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "designation" TEXT`,
  `ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "department" TEXT`,
  `ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'admin'`,
  `ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "notes" TEXT`,
];

export async function ensureAdminUserProfileColumns(prisma = getPrismaClient()) {
  for (const statement of profileColumnSql) {
    await prisma.$executeRawUnsafe(statement);
  }

  await prisma.$executeRawUnsafe(
    `UPDATE "AdminUser" SET "role" = 'super_admin' WHERE LOWER("email") = $1`,
    SUPER_ADMIN_EMAIL
  );
}

function normalizeAdminUser(row) {
  if (!row) return null;
  const email = String(row.email || "").toLowerCase();
  const role = email === SUPER_ADMIN_EMAIL ? "super_admin" : row.role || "admin";

  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName || "",
    lastName: row.lastName || "",
    mobileNumber: row.mobileNumber || "",
    designation: row.designation || "",
    department: row.department || "",
    role,
    notes: row.notes || "",
    isActive: Boolean(row.isActive),
    lastLoginAt: row.lastLoginAt || null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function getAdminDisplayName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Admin";
}

export function isSuperAdmin(user) {
  return String(user?.email || "").toLowerCase() === SUPER_ADMIN_EMAIL || user?.role === "super_admin";
}

export async function getAdminUsers() {
  const prisma = getPrismaClient();
  await ensureAdminUserProfileColumns(prisma);

  const rows = await prisma.$queryRawUnsafe(`
    SELECT "id", "email", "firstName", "lastName", "mobileNumber", "designation", "department", "role", "notes",
           "isActive", "lastLoginAt", "createdAt", "updatedAt"
    FROM "AdminUser"
    ORDER BY "createdAt" ASC
  `);

  return rows.map(normalizeAdminUser);
}

export async function getAdminUserById(id) {
  const prisma = getPrismaClient();
  await ensureAdminUserProfileColumns(prisma);

  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT "id", "email", "firstName", "lastName", "mobileNumber", "designation", "department", "role", "notes",
             "isActive", "lastLoginAt", "createdAt", "updatedAt"
      FROM "AdminUser"
      WHERE "id" = $1
      LIMIT 1
    `,
    id
  );

  return normalizeAdminUser(rows[0]);
}

export async function createAdminUser(payload) {
  const prisma = getPrismaClient();
  await ensureAdminUserProfileColumns(prisma);

  const rows = await prisma.$queryRawUnsafe(
    `
      INSERT INTO "AdminUser" (
        "id", "email", "passwordHash", "firstName", "lastName", "mobileNumber", "designation", "department",
        "role", "notes", "isActive", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING "id", "email", "firstName", "lastName", "mobileNumber", "designation", "department", "role", "notes",
                "isActive", "lastLoginAt", "createdAt", "updatedAt"
    `,
    crypto.randomUUID(),
    payload.email,
    hashPassword(payload.password),
    payload.firstName || null,
    payload.lastName || null,
    payload.mobileNumber || null,
    payload.designation || null,
    payload.department || null,
    payload.email === SUPER_ADMIN_EMAIL ? "super_admin" : payload.role || "admin",
    payload.notes || null,
    payload.isActive ?? true
  );

  return normalizeAdminUser(rows[0]);
}

export async function updateAdminUser(id, payload) {
  const prisma = getPrismaClient();
  await ensureAdminUserProfileColumns(prisma);

  const rows = await prisma.$queryRawUnsafe(
    `
      UPDATE "AdminUser"
      SET "firstName" = $2,
          "lastName" = $3,
          "mobileNumber" = $4,
          "designation" = $5,
          "department" = $6,
          "role" = $7,
          "notes" = $8,
          "isActive" = $9,
          "updatedAt" = NOW()
      WHERE "id" = $1
      RETURNING "id", "email", "firstName", "lastName", "mobileNumber", "designation", "department", "role", "notes",
                "isActive", "lastLoginAt", "createdAt", "updatedAt"
    `,
    id,
    payload.firstName || null,
    payload.lastName || null,
    payload.mobileNumber || null,
    payload.designation || null,
    payload.department || null,
    payload.role || "admin",
    payload.notes || null,
    payload.isActive ?? true
  );

  return normalizeAdminUser(rows[0]);
}
