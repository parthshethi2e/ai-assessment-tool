import { logAuditEvent } from "@/lib/auditLog";
import { requireAdminApiSession } from "@/lib/adminAuth";
import { createAdminUser, getAdminUserById, getAdminUsers, isSuperAdmin } from "@/lib/adminUsers";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeProfilePayload(body) {
  return {
    email: String(body.email || "").trim().toLowerCase(),
    password: String(body.password || ""),
    firstName: String(body.firstName || "").trim(),
    lastName: String(body.lastName || "").trim(),
    mobileNumber: String(body.mobileNumber || "").trim(),
    designation: String(body.designation || "").trim(),
    department: String(body.department || "").trim(),
    role: String(body.role || "admin").trim() || "admin",
    notes: String(body.notes || "").trim(),
    isActive: body.isActive !== false,
  };
}

export async function GET(request) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  try {
    const users = isSuperAdmin(auth.session.adminUser)
      ? await getAdminUsers()
      : [await getAdminUserById(auth.session.adminUser.id)].filter(Boolean);
    return Response.json({ users });
  } catch (error) {
    console.error("ADMIN USERS GET ERROR:", error);
    return Response.json({ error: "Unable to load admin users." }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  try {
    if (!isSuperAdmin(auth.session.adminUser)) {
      return Response.json({ error: "Only the super admin can add admin users." }, { status: 403 });
    }

    const body = await request.json();
    const payload = normalizeProfilePayload(body);

    if (!validateEmail(payload.email)) {
      return Response.json({ error: "Enter a valid admin email address." }, { status: 400 });
    }

    if (payload.password.length < 8) {
      return Response.json({ error: "Temporary password must be at least 8 characters." }, { status: 400 });
    }

    if (!payload.firstName || !payload.lastName) {
      return Response.json({ error: "First name and last name are required." }, { status: 400 });
    }

    const user = await createAdminUser(payload);

    await logAuditEvent({
      actorEmail: auth.session.adminUser.email,
      actorType: "admin",
      action: "admin_user.create",
      entityType: "admin_user",
      entityId: user.id,
      details: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        designation: user.designation,
        department: user.department,
        role: user.role,
        isActive: user.isActive,
      },
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("ADMIN USERS CREATE ERROR:", error);

    if (String(error?.message || "").includes("AdminUser_email_key") || String(error?.code || "") === "P2002") {
      return Response.json({ error: "An admin user with this email already exists." }, { status: 409 });
    }

    return Response.json({ error: "Unable to create admin user." }, { status: 500 });
  }
}
