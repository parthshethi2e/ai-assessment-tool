import { authenticateAdmin, setAdminSessionCookie } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (!isValidEmail) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const auth = await authenticateAdmin(email, password);

    if (!auth) {
      return Response.json({ error: "Invalid credentials." }, { status: 401 });
    }

    await setAdminSessionCookie(auth.rawToken, auth.expiresAt);

    return Response.json({
      success: true,
      user: {
        email: auth.user.email,
      },
      expiresAt: auth.expiresAt,
      timeoutMinutes: 60,
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return Response.json({ error: "Unable to log in." }, { status: 500 });
  }
}
