import AssessmentWorkspace from "@/components/assessment/AssessmentWorkspace";

export const metadata = {
  title: "Assessment Workspace",
};

export default function SurveyPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.1),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef3f7_100%)]">
      <AssessmentWorkspace />
    </div>
  );
}
