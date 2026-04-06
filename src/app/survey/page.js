import AssessmentWorkspace from "@/components/assessment/AssessmentWorkspace";
import { getAssessmentSections } from "@/lib/assessmentRepository";

export const metadata = {
  title: "Assessment Workspace",
};

export const dynamic = "force-dynamic";

export default async function SurveyPage({ searchParams }) {
  const sections = await getAssessmentSections();
  const query = await searchParams;
  const restoreDraft = query?.resume === "1";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.1),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef3f7_100%)]">
      <AssessmentWorkspace sections={sections} restoreDraft={restoreDraft} />
    </div>
  );
}
