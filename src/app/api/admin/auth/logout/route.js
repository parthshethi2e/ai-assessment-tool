import { logAuditEvent } from "@/lib/auditLog";
import { clearAdminSessionCookie, deleteAdminSessionByToken, getAdminSessionFromToken } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    const token = request.cookies.get("admin_session")?.value;
    const session = await getAdminSessionFromToken(token);

    if (session) {
      await logAuditEvent({
        actorEmail: session.adminUser?.email || null,
        actorType: "admin",
        action: "auth.logout",
        entityType: "admin_user",
        entityId: session.adminUser?.id || session.id,
        details: {
          reason: "manual_logout",
          email: session.adminUser?.email || null,
        },
      });
    }

    await deleteAdminSessionByToken(token);
    await clearAdminSessionCookie();

    return Response.json({ success: true });
  } catch (error) {
    console.error("ADMIN LOGOUT ERROR:", error);
    return Response.json({ error: "Unable to log out." }, { status: 500 });
  }
}
