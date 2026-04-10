"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function getAnswers(report) {
  return typeof report.answers === "string" ? JSON.parse(report.answers) : report.answers;
}

export default function ReportsList({ initialReports, canManage = false }) {
  const router = useRouter();
  const [reports, setReports] = useState(initialReports);
  const [deletingId, setDeletingId] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handleDelete = async (reportId, organizationName) => {
    const confirmed = window.confirm(`Delete the report for ${organizationName || "this organization"}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(reportId);

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Unable to delete report.");
      }

      setReports((current) => current.filter((report) => report.id !== reportId));
      setToast({ type: "success", message: "Report deleted successfully." });
      router.refresh();
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: error.message || "Unable to delete report." });
    } finally {
      setDeletingId("");
    }
  };

  if (reports.length === 0) {
    return (
      <>
        <Card className="border border-slate-200/80 bg-white/85 shadow-sm">
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold text-slate-950">No reports saved yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Run the new workspace once and your professional report history will appear here.
            </p>
          </CardContent>
        </Card>
        <ToastBanner toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <>
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
                      {profile.sector || "sector not provided"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        report.deliveryStatus === "delivered"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border border-amber-200 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {report.deliveryStatus === "delivered" ? "Delivered" : "Pending"}
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
                  <Metric label="Score" value={Number(report.finalScore || 0).toFixed(2)} />
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
                  {canManage ? (
                    <Button
                      variant="outline"
                      className="rounded-full border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800"
                      disabled={deletingId === report.id}
                      onClick={() => handleDelete(report.id, profile.organizationName)}
                    >
                      <Trash2 className="size-4" />
                      {deletingId === report.id ? "Deleting..." : "Delete"}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ToastBanner toast={toast} onClose={() => setToast(null)} />
    </>
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

function ToastBanner({ toast, onClose }) {
  if (!toast) return null;

  const tone =
    toast.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-rose-200 bg-rose-50 text-rose-900";

  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border px-4 py-3 shadow-xl ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium">{toast.message}</p>
        <button type="button" className="opacity-70 transition hover:opacity-100" onClick={onClose} aria-label="Close toast">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
