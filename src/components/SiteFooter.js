import Link from "next/link";
import { ArrowRight, ChartNoAxesColumn, FileText, ShieldCheck } from "lucide-react";
import BrandBadge from "@/components/BrandBadge";
import { Button } from "@/components/ui/button";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/survey", label: "Workspace" },
  { href: "/admin", label: "Admin" },
];

export default function SiteFooter({ hideStartAssessment = false }) {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-[linear-gradient(180deg,rgba(244,249,252,0.72),rgba(232,240,245,0.98))]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(145deg,rgba(15,23,42,1),rgba(18,83,105,0.96))] p-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">I2E Consulting</div>
              <h2 className="font-heading max-w-3xl text-3xl font-semibold tracking-tight">Build a more credible AI roadmap with the right readiness baseline.</h2>
              <p className="max-w-2xl text-sm leading-7 text-white/75">
                Use the assessment, reports, and governance-focused insights to move from scattered exploration to structured AI execution.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              {!hideStartAssessment ? (
                <Button asChild className="h-11 rounded-full bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300">
                  <Link href="/survey">
                    Open workspace
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline" className="h-11 rounded-full border-white/20 bg-white/10 px-6 text-white hover:bg-white/15 hover:text-white">
                <Link href="/admin">Admin access</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_0.8fr_0.9fr_1fr]">
          <div className="space-y-4">
            <BrandBadge subtitle="Strategy, governance, and practical AI readiness" />
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              I2E Consulting helps organizations assess readiness, surface the right priorities, and move from exploration to practical,
              well-governed AI execution.
            </p>
            <div className="flex flex-wrap gap-3">
              <FooterPill icon={ChartNoAxesColumn} label="Executive scoring" />
              <FooterPill icon={FileText} label="Structured reports" />
              <FooterPill icon={ShieldCheck} label="Governance-first" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Navigation</div>
            <div className="mt-4 grid gap-3">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-slate-600 transition hover:text-slate-950">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Platform</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <div>Executive-ready AI readiness assessments</div>
              <div>Dynamic backend-managed question framework</div>
              <div>Saved reports, PDF exports, and admin controls</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Advisory Focus</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <div>Strategy and operating-model alignment</div>
              <div>Risk, privacy, and governance readiness</div>
              <div>Practical roadmap planning for scale</div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200/80 pt-5">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div>© 2026 I2E Consulting. All rights reserved.</div>
            <div>AI readiness platform for advisory-led transformation work.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterPill({ icon: Icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">
      <Icon className="size-3.5 text-cyan-700" />
      {label}
    </div>
  );
}
