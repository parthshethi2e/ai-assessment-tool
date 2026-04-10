import AdminDashboard from "@/components/admin/AdminDashboard";
import { requireAdminPageSession } from "@/lib/adminAuth";
import { getAdminAssessmentSections, getAssessmentAdminOverview } from "@/lib/assessmentRepository";
import { getAssessmentSettings } from "@/lib/platformSettings";

export const metadata = {
  title: "Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireAdminPageSession();
  const [sections, overview, settings] = await Promise.all([
    getAdminAssessmentSections(),
    getAssessmentAdminOverview(),
    getAssessmentSettings(),
  ]);

  return (
    <AdminDashboard
      initialSections={sections}
      overview={overview}
      adminUser={session.adminUser}
      initialSettings={settings}
    />
  );
}
