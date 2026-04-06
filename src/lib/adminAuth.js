import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { getPrismaClient } from "@/lib/prisma";

export const ADMIN_EMAIL = "admin@i2econsulting.com";
const ADMIN_PASSWORD = "Admin@123";
const SESSION_COOKIE = "admin_session";
const SESSION_TIMEOUT_MINUTES = 60;

function nowPlusMinutes(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = String(storedHash || "").split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const attemptHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(attemptHash, "hex"));
}

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hasAdminDelegates(prisma) {
  return Boolean(prisma?.adminUser && prisma?.adminSession);
}

function getTimeoutSeconds() {
  return SESSION_TIMEOUT_MINUTES * 60;
}

async function ensureAdminUser() {
  const prisma = getPrismaClient();
  const passwordHash = hashPassword(ADMIN_PASSWORD);

  if (hasAdminDelegates(prisma)) {
    const user = await prisma.adminUser.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (!user) {
      return prisma.adminUser.create({
        data: {
          email: ADMIN_EMAIL,
          passwordHash,
          isActive: true,
        },
      });
    }

    return prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        isActive: true,
      },
    });
  }

  const existingRows = await prisma.$queryRawUnsafe(`SELECT * FROM "AdminUser" WHERE "email" = $1 LIMIT 1`, ADMIN_EMAIL);
  const existing = existingRows[0];

  if (!existing) {
    const insertedRows = await prisma.$queryRawUnsafe(
      `
        INSERT INTO "AdminUser" ("id", "email", "passwordHash", "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, true, NOW(), NOW())
        RETURNING *
      `,
      crypto.randomUUID(),
      ADMIN_EMAIL,
      passwordHash
    );
    return insertedRows[0];
  }

  const updatedRows = await prisma.$queryRawUnsafe(
    `
      UPDATE "AdminUser"
      SET "passwordHash" = $2,
          "isActive" = true,
          "updatedAt" = NOW()
      WHERE "id" = $1
      RETURNING *
    `,
    existing.id,
    passwordHash
  );
  return updatedRows[0];
}

export async function authenticateAdmin(email, password) {
  const prisma = getPrismaClient();
  await ensureAdminUser();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  let user;

  if (hasAdminDelegates(prisma)) {
    user = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });
  } else {
    const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "AdminUser" WHERE "email" = $1 LIMIT 1`, normalizedEmail);
    user = rows[0];
  }

  if (!user || !user.isActive) {
    return null;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }

  const rawToken = createSessionToken();
  const tokenHash = hashValue(rawToken);
  const expiresAt = nowPlusMinutes(SESSION_TIMEOUT_MINUTES);

  if (hasAdminDelegates(prisma)) {
    await prisma.adminSession.create({
      data: {
        tokenHash,
        adminUserId: user.id,
        expiresAt,
        lastActivityAt: new Date(),
      },
    });

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  } else {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO "AdminSession" ("id", "tokenHash", "adminUserId", "expiresAt", "lastActivityAt", "createdAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `,
      crypto.randomUUID(),
      tokenHash,
      user.id,
      expiresAt
    );

    await prisma.$executeRawUnsafe(
      `UPDATE "AdminUser" SET "lastLoginAt" = NOW(), "updatedAt" = NOW() WHERE "id" = $1`,
      user.id
    );
  }

  return {
    rawToken,
    expiresAt,
    user,
  };
}

export async function setAdminSessionCookie(token, expiresAt) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
    maxAge: getTimeoutSeconds(),
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function deleteAdminSessionByToken(token) {
  if (!token) return;

  const prisma = getPrismaClient();
  const tokenHash = hashValue(token);

  if (hasAdminDelegates(prisma)) {
    await prisma.adminSession.deleteMany({
      where: { tokenHash },
    });
    return;
  }

  await prisma.$executeRawUnsafe(`DELETE FROM "AdminSession" WHERE "tokenHash" = $1`, tokenHash);
}

export async function getAdminSessionFromToken(token) {
  if (!token) {
    return null;
  }

  const prisma = getPrismaClient();
  const tokenHash = hashValue(token);
  let session;

  if (hasAdminDelegates(prisma)) {
    session = await prisma.adminSession.findUnique({
      where: { tokenHash },
      include: { adminUser: true },
    });
  } else {
    const rows = await prisma.$queryRawUnsafe(
      `
        SELECT
          s.*,
          u."id" AS "user_id",
          u."email" AS "user_email",
          u."passwordHash" AS "user_passwordHash",
          u."isActive" AS "user_isActive",
          u."lastLoginAt" AS "user_lastLoginAt",
          u."createdAt" AS "user_createdAt",
          u."updatedAt" AS "user_updatedAt"
        FROM "AdminSession" s
        JOIN "AdminUser" u ON u."id" = s."adminUserId"
        WHERE s."tokenHash" = $1
        LIMIT 1
      `,
      tokenHash
    );
    const row = rows[0];
    session = row
      ? {
          id: row.id,
          tokenHash: row.tokenHash,
          adminUserId: row.adminUserId,
          expiresAt: row.expiresAt,
          lastActivityAt: row.lastActivityAt,
          createdAt: row.createdAt,
          adminUser: {
            id: row.user_id,
            email: row.user_email,
            passwordHash: row.user_passwordHash,
            isActive: row.user_isActive,
            lastLoginAt: row.user_lastLoginAt,
            createdAt: row.user_createdAt,
            updatedAt: row.user_updatedAt,
          },
        }
      : null;
  }

  if (!session) {
    return null;
  }

  const now = new Date();
  const expired = session.expiresAt <= now;

  if (expired || !session.adminUser?.isActive) {
    if (hasAdminDelegates(prisma)) {
      await prisma.adminSession.deleteMany({
        where: { tokenHash },
      });
    } else {
      await prisma.$executeRawUnsafe(`DELETE FROM "AdminSession" WHERE "tokenHash" = $1`, tokenHash);
    }
    return null;
  }

  const nextExpiry = nowPlusMinutes(SESSION_TIMEOUT_MINUTES);

  if (hasAdminDelegates(prisma)) {
    await prisma.adminSession.update({
      where: { id: session.id },
      data: {
        lastActivityAt: now,
        expiresAt: nextExpiry,
      },
    });
  } else {
    await prisma.$executeRawUnsafe(
      `UPDATE "AdminSession" SET "lastActivityAt" = $2, "expiresAt" = $3 WHERE "id" = $1`,
      session.id,
      now,
      nextExpiry
    );
  }

  return {
    ...session,
    expiresAt: nextExpiry,
  };
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  const session = await getAdminSessionFromToken(token);
  return session || null;
}

export async function requireAdminPageSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireAdminApiSession(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await getAdminSessionFromToken(token);

  if (!session) {
    return { ok: false, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: session.expiresAt,
    maxAge: getTimeoutSeconds(),
  });

  return { ok: true, session };
}

export async function isAdminLoggedIn() {
  const session = await getAdminSession();
  return Boolean(session);
}
