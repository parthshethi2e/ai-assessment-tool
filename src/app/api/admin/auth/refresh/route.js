import { setAdminSessionCookie, requireAdminApiSession } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    const auth = await requireAdminApiSession(request);
    if (!auth.ok) return auth.response;

    const token = request.cookies.get("admin_session")?.value;
    await setAdminSessionCookie(token, auth.session.expiresAt);

    return Response.json({
      success: true,
      expiresAt: auth.session.expiresAt,
      timeoutMinutes: 60,
    });
  } catch (error) {
    console.error("ADMIN REFRESH ERROR:", error);
    return Response.json({ error: "Unable to refresh session." }, { status: 500 });
  }
}
