import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuditEventsForEntity } from "@/lib/auditLog";
import { requireAdminPageSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import CustomRadar from "@/components/RadarChart";
import ReportDeliveryPanel from "@/components/reports/ReportDeliveryPanel";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function parseJson(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}

export default async function ReportDetailPage({ params }) {
  const { id } = await params;
  const session = await requireAdminPageSession();

  const [report, auditEvents] = await Promise.all([
    prisma.survey.findUnique({
      where: { id },
    }),
    getAuditEventsForEntity("survey", id),
  ]);

  if (!report) {
    notFound();
  }

  const answers = parseJson(report.answers) || {};
  const ai = parseJson(report.aiInsights) || {};
  const assessment = answers.assessment || {};
  const profile = answers.profile || {};
  const notes = answers.notes || {};
  const reportMeta = answers.meta || {};
  const chartData = (assessment.scoredSections || []).map((section) => ({
    subject: section.title,
    value: section.score,
  }));
  const responseComments = (assessment.scoredSections || []).flatMap((section) =>
    (section.questions || [])
      .filter((question) => question.comment?.trim())
      .map((question) => ({
        id: question.id,
        section: section.title,
        prompt: question.prompt,
        comment: question.comment.trim(),
        mode: question.mode,
        score: question.score,
        scoreLabel: question.scoreLabel,
        targetScore: question.targetScore,
        targetScoreLabel: question.targetScoreLabel,
      }))
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#edf3f7_100%)]">
      <SiteHeader current="/admin" />
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Saved report</p>
            <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight text-slate-950">
              {profile.organizationName || "Organization report"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {profile.sector || "sector not provided"} • Generated on {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/reports">Back to reports</Link>
            </Button>
            <Button asChild className="rounded-full">
              <a href={`/api/reports/${report.id}`} target="_blank" rel="noreferrer">
                Download PDF
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Overall score" value={report.finalScore.toFixed(2)} />
          <Metric label="Stage" value={report.maturityLevel} />
          <Metric label="Benchmark" value={assessment.benchmark || "n/a"} />
          <Metric label="Confidence" value={`${Math.round((assessment.confidence || 0) * 100)}%`} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="space-y-6">
            <Card className="border-0 bg-[linear-gradient(180deg,rgba(15,23,42,1),rgba(30,41,59,1))] text-white shadow-2xl ring-0">
              <CardHeader>
                <CardTitle className="text-2xl text-white">{ai.summary?.headline || "Executive summary"}</CardTitle>
                <CardDescription className="text-white/70">
                  {reportMeta.reportGenerationEnabled === false
                    ? "AI report generation was disabled for this assessment, so this saved report shows the weighted scorecard and structured responses."
                    : "Tailored to the selected sector, captured score profile, target maturity gaps, and respondent comments."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <Insight title="Current state" body={ai.summary?.current_state} />
                <Insight title="Key risk" body={ai.summary?.key_risk} />
                <Insight title="Recommended focus" body={ai.summary?.recommended_focus} />
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Section scorecard</CardTitle>
                <CardDescription>Weighted across the full professional readiness framework.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(assessment.scoredSections || []).map((section) => (
                  <div key={section.id}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">{section.title}</span>
                      <span className="text-slate-500">{section.score}/5</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-[linear-gradient(90deg,#0ea5e9,#0f172a)]" style={{ width: `${(section.score / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {responseComments.length ? (
              <Card className="border border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Question comments</CardTitle>
                  <CardDescription>Context captured during the assessment for individual questions.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {responseComments.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">{item.section}</div>
                      <div className="mt-2 text-sm font-semibold text-slate-950">{item.prompt}</div>
                      <div className="mt-2 text-xs text-slate-500">{formatResponseLabel(item)}</div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.comment}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <ListCard title="Primary gaps" items={ai.gaps || []} color="rose" titleKey="area" bodyKey="description" />
              <ListCard title="Opportunities" items={ai.opportunities || []} color="emerald" titleKey="opportunity" bodyKey="description" />
            </div>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Transformation roadmap</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-3">
                <RoadmapColumn title="0-3 months" items={ai.roadmap?.short_term || []} />
                <RoadmapColumn title="3-6 months" items={ai.roadmap?.mid_term || []} />
                <RoadmapColumn title="6-12 months" items={ai.roadmap?.long_term || []} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ReportDeliveryPanel
              reportId={report.id}
              initialStatus={report.deliveryStatus}
              initialNotes={report.deliveryNotes || ""}
              deliveredAt={report.deliveredAt}
              deliveredByEmail={report.deliveredByEmail}
              canManage={Boolean(session)}
            />

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Capability map</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                <CustomRadar data={chartData} />
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Organization context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <ContextRow label="Sector">{profile.sector || "n/a"}</ContextRow>
                <ContextRow label="Current tools">{profile.currentTools || "n/a"}</ContextRow>
                <ContextRow label="Size">{profile.sizeBand || "n/a"}</ContextRow>
                <ContextRow label="Budget">{profile.annualBudgetBand || "n/a"}</ContextRow>
                <ContextRow label="Priority">{notes.priority || "n/a"}</ContextRow>
                <ContextRow label="Timeline">{notes.timeline || "n/a"}</ContextRow>
                <ContextRow label="Role">{profile.respondentRole || "n/a"}</ContextRow>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Starter use cases</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {(assessment.recommendedUseCases || []).map((item) => (
                  <div key={item} className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Tooling guidance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <ToolList title="Data" items={ai.tools?.data || []} />
                <ToolList title="AI" items={ai.tools?.ai || []} />
                <ToolList title="Cloud" items={ai.tools?.cloud || []} />
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Audit log</CardTitle>
                <CardDescription>Persistent record of report lifecycle and consultant actions for this assessment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditEvents.length ? (
                  auditEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-950">{formatAuditAction(event.action)}</div>
                        <div className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        {event.actorEmail ? `By ${event.actorEmail}` : "System event"}
                      </div>
                      {event.details ? <p className="mt-2 text-sm leading-6 text-slate-600">{formatAuditDetails(event.details)}</p> : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    No audit entries recorded yet for this assessment.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function Insight({ title, body }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{title}</div>
      <p className="mt-3 text-sm leading-6 text-white/85">{body}</p>
    </div>
  );
}

function ListCard({ title, items, color, titleKey, bodyKey }) {
  const colorClass =
    color === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-950"
      : "border-emerald-200 bg-emerald-50 text-emerald-950";

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((item, index) => (
          <div key={`${item[titleKey]}-${index}`} className={`rounded-2xl border px-4 py-4 ${colorClass}`}>
            <div className="font-semibold">{item[titleKey]}</div>
            <p className="mt-2 text-sm leading-6 opacity-90">{item[bodyKey]}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RoadmapColumn({ title, items }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolList({ title, items }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={`${title}-${item}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ContextRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="font-medium text-slate-900">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function formatResponseLabel(item) {
  if (item.mode === "score") {
    return `Current maturity: ${item.score}/5${item.scoreLabel ? ` (${item.scoreLabel})` : ""}${
      item.targetScore ? ` • Target maturity: ${item.targetScore}/5${item.targetScoreLabel ? ` (${item.targetScoreLabel})` : ""}` : ""
    }`;
  }

  if (item.mode === "skip") {
    return "Marked as skip for now";
  }

  if (item.mode === "na") {
    return "Marked as preferred not to answer";
  }

  return "Response recorded";
}

function formatAuditAction(action) {
  return action
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatAuditDetails(details) {
  if (!details || typeof details !== "object") {
    return "";
  }

  const values = Object.entries(details)
    .filter(([, value]) => value !== null && value !== "")
    .map(([key, value]) => `${key.replaceAll(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}: ${value}`);

  return values.join(" • ");
}
