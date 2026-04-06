import Link from "next/link";
import { ArrowRight, Building2, ChartNoAxesColumn, FileText, ShieldCheck, Sparkles, Users } from "lucide-react";
import { defaultAssessmentSections, organizationTypes, sectorOptions } from "@/data/assessmentFramework";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Built for real organizations",
    description: "Supports both for-profit and non-profit contexts with language that matches how each organization creates value.",
    icon: Building2,
  },
  {
    title: "Executive-ready reporting",
    description: "Turns survey responses into scorecards, priorities, roadmap guidance, and advisory-style recommendations.",
    icon: FileText,
  },
  {
    title: "AI with governance in view",
    description: "Balances opportunity spotting with policy, privacy, and operating-model readiness.",
    icon: ShieldCheck,
  },
  {
    title: "Designed for transformation teams",
    description: "Useful for leadership, operations, technology, program, and data stakeholders working together.",
    icon: Users,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.12),transparent_32%),linear-gradient(180deg,#f8fcff_0%,#f5f7fb_46%,#eef3f7_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/70 bg-white/80 px-5 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-slate-950 text-white">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-950">AI Assess Pro</div>
              <div className="text-xs text-slate-500">Professional readiness for modern organizations</div>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/admin">Admin</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/reports">Reports</Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link href="/survey">
                Start assessment
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </nav>
        </header>

        <main className="py-10 lg:py-16">
          <section className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-900">
                <ChartNoAxesColumn className="size-4" />
                A richer assessment model for professional use
              </div>

              <div className="space-y-5">
                <h1 className="font-heading max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 lg:text-6xl">
                  Assess AI readiness across strategy, operations, governance, and measurable impact.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-600">
                  A rebuilt advisory-style Next.js application that helps commercial and mission-driven organizations understand where they are,
                  what to improve first, and how to build a practical AI roadmap.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="h-12 rounded-full px-6 text-sm">
                  <Link href="/survey">
                    Launch workspace
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6 text-sm">
                  <Link href="/reports">Browse saved reports</Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Stat value="8" label="Assessment dimensions" />
                <Stat value="2" label="Org models supported" />
                <Stat value="1" label="Executive-ready report flow" />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="rounded-[1.75rem] bg-[linear-gradient(160deg,#0f172a,#164e63)] p-6 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">What the new product does</div>
                <div className="font-heading mt-4 text-2xl font-semibold">Professional AI assessment, not a demo survey.</div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                  <p>Captures organization context before scoring readiness.</p>
                  <p>Provides sector-aware starter use cases and priorities.</p>
                  <p>Produces a cleaner scorecard, roadmap, and recommended tooling stack.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {organizationTypes.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="font-semibold text-slate-950">{item.label}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-20">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Core capabilities</div>
                <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-slate-950">What makes this feel more like a professional tool</h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                The rebuild focuses on breadth of assessment, stronger reporting, and a more credible product experience for advisory or internal transformation use.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-20 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Assessment framework</div>
              <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-slate-950">Expanded dimensions that work across organization types</h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {defaultAssessmentSections.map((section) => (
                  <div key={section.key} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <div className="text-base font-semibold text-slate-950">{section.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Coverage</div>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Sectors supported in the model</h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {sectorOptions.slice(0, 10).map((sector) => (
                    <span key={sector} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-sm">
                <h3 className="text-xl font-semibold">Next step</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Start a new assessment, generate the report, and we can keep iterating from a much stronger foundation.
                </p>
                <Button asChild size="lg" className="mt-6 h-11 rounded-full bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300">
                  <Link href="/survey">Open assessment workspace</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/75 px-5 py-5 shadow-sm backdrop-blur">
      <div className="font-heading text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}
