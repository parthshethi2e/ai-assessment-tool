import { clearAdminSessionCookie, deleteAdminSessionByToken } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    const token = request.cookies.get("admin_session")?.value;
    await deleteAdminSessionByToken(token);
    await clearAdminSessionCookie();

    return Response.json({ success: true });
  } catch (error) {
    console.error("ADMIN LOGOUT ERROR:", error);
    return Response.json({ error: "Unable to log out." }, { status: 500 });
  }
}
