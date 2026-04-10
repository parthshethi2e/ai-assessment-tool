import { logAuditEvent } from "@/lib/auditLog";
import { requireAdminApiSession } from "@/lib/adminAuth";
import { getAdminUserById, isSuperAdmin, SUPER_ADMIN_EMAIL, updateAdminUser } from "@/lib/adminUsers";

function normalizeProfilePayload(body) {
  return {
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

export async function PATCH(request, { params }) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const existing = await getAdminUserById(id);

    if (!existing) {
      return Response.json({ error: "Admin user not found." }, { status: 404 });
    }

    const payload = normalizeProfilePayload(await request.json());
    const canManageAdmins = isSuperAdmin(auth.session.adminUser);

    if (!canManageAdmins && existing.id !== auth.session.adminUser.id) {
      return Response.json({ error: "Only the super admin can edit other admin users." }, { status: 403 });
    }

    if (!payload.firstName || !payload.lastName) {
      return Response.json({ error: "First name and last name are required." }, { status: 400 });
    }

    if (existing.id === auth.session.adminUser.id && (!payload.isActive || (canManageAdmins && payload.role !== "super_admin" && isSuperAdmin(existing)))) {
      return Response.json({ error: "You cannot remove super-admin access from your own account." }, { status: 400 });
    }

    if (!canManageAdmins) {
      payload.role = existing.role;
      payload.isActive = existing.isActive;
    }

    if (String(existing.email || "").toLowerCase() === SUPER_ADMIN_EMAIL) {
      payload.role = "super_admin";
      payload.isActive = true;
    }

    const user = await updateAdminUser(id, payload);

    await logAuditEvent({
      actorEmail: auth.session.adminUser.email,
      actorType: "admin",
      action: "admin_user.update",
      entityType: "admin_user",
      entityId: user.id,
      details: {
        before: existing,
        after: user,
      },
    });

    return Response.json({ user });
  } catch (error) {
    console.error("ADMIN USERS UPDATE ERROR:", error);
    return Response.json({ error: "Unable to update admin user." }, { status: 500 });
  }
}
