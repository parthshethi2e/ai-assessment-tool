import AdminDashboard from "@/components/admin/AdminDashboard";
import { requireAdminPageSession } from "@/lib/adminAuth";
import { getAdminAssessmentSections, getAssessmentAdminOverview } from "@/lib/assessmentRepository";

export const metadata = {
  title: "Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireAdminPageSession();
  const [sections, overview] = await Promise.all([
    getAdminAssessmentSections(),
    getAssessmentAdminOverview(),
  ]);

  return <AdminDashboard initialSections={sections} overview={overview} adminEmail={session.adminUser.email} />;
}
