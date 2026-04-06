import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getAnswers(report) {
  return typeof report.answers === "string" ? JSON.parse(report.answers) : report.answers;
}

export default async function ReportsPage() {
  const reports = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#edf3f7_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Saved reports</p>
            <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight text-slate-950">Assessment history</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review saved assessments, revisit executive reports, and export a PDF snapshot when needed.
            </p>
          </div>

          <Button asChild size="lg" className="h-11 rounded-full px-6">
            <Link href="/survey">New assessment</Link>
          </Button>
        </div>

        {reports.length === 0 ? (
          <Card className="border border-slate-200/80 bg-white/85 shadow-sm">
            <CardHeader>
              <CardTitle>No reports saved yet</CardTitle>
              <CardDescription>Run the new workspace once and your professional report history will appear here.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-5">
            {reports.map((report) => {
              const answers = getAnswers(report);
              const profile = answers?.profile || {};
              const assessment = answers?.assessment || {};
              const topPriority = assessment?.priorities?.[0]?.title || "Review report";

              return (
                <Card key={report.id} className="border border-slate-200/80 bg-white/90 shadow-sm">
                  <CardContent className="flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-800">
                          {profile.organizationType || "organization"}
                        </span>
                        <span className="text-sm text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div>
                        <h2 className="font-heading text-2xl font-semibold text-slate-950">
                          {profile.organizationName || "Untitled organization report"}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {profile.sector || "Sector not provided"} • {profile.sizeBand || "Size not provided"} • Top priority: {topPriority}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
                      <Metric label="Score" value={report.finalScore.toFixed(2)} />
                      <Metric label="Stage" value={report.maturityLevel} />
                      <Metric label="Focus" value={topPriority} />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button asChild variant="outline" className="rounded-full">
                        <Link href={`/reports/${report.id}`}>Open report</Link>
                      </Button>
                      <Button asChild className="rounded-full">
                        <a href={`/api/reports/${report.id}`} target="_blank" rel="noreferrer">
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}
