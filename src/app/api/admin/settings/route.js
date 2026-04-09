import { requireAdminApiSession } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/auditLog";
import { getAssessmentSettings, updateAssessmentSettings } from "@/lib/platformSettings";

export async function GET(request) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  const settings = await getAssessmentSettings();
  return Response.json({ settings });
}

export async function PATCH(request) {
  try {
    const auth = await requireAdminApiSession(request);
    if (!auth.ok) return auth.response;

    const previousSettings = await getAssessmentSettings();
    const body = await request.json();
    const reportGenerationEnabled = Boolean(body.reportGenerationEnabled);
    const settings = await updateAssessmentSettings({ reportGenerationEnabled });

    await logAuditEvent({
      actorEmail: auth.session.adminUser.email,
      actorType: "admin",
      action: "settings.updated",
      entityType: "assessment_setting",
      entityId: settings.id,
      details: {
        before: {
          reportGenerationEnabled: previousSettings.reportGenerationEnabled,
        },
        after: {
          reportGenerationEnabled,
        },
      },
    });

    return Response.json({ settings });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return Response.json({ error: "Unable to update settings." }, { status: 500 });
  }
}
