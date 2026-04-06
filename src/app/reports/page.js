import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ReportsList from "@/components/reports/ReportsList";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

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
          <Button asChild variant="outline" size="lg" className="h-11 rounded-full px-6">
            <Link href="/admin">Admin</Link>
          </Button>
        </div>

        <ReportsList initialReports={reports} />
      </div>
    </div>
  );
}
