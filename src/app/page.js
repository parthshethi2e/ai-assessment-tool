import Link from "next/link";
import { ArrowRight, Building2, ChartNoAxesColumn, FileText, ShieldCheck } from "lucide-react";
import { sectorOptions } from "@/data/assessmentFramework";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Built for real organizations",
    description: "Captures sector, tools, maturity gaps, comments, and operating context before recommendations are generated.",
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
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.12),transparent_32%),linear-gradient(180deg,#f8fcff_0%,#f5f7fb_46%,#eef3f7_100%)]">
      <SiteHeader current="/" />
      <div className="mx-auto max-w-[92rem] px-6 py-6 lg:px-8">
        <main className="py-8 lg:py-12">
          <section className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_420px] xl:grid-cols-[minmax(0,1.5fr)_430px] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-900">
                <ChartNoAxesColumn className="size-4" />
                I2E Consulting assessment platform
              </div>

              <div className="space-y-5">
                <h1 className="font-heading max-w-5xl text-5xl font-semibold tracking-tight text-slate-950 lg:text-6xl">
                  I2E Consulting helps organizations assess AI readiness with clarity and credibility.
                </h1>
                <p className="max-w-4xl text-lg leading-8 text-slate-600">
                  A branded advisory platform for organizations to understand readiness, surface priorities, and move toward a practical AI roadmap.
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
                  <Link href="/admin">Open admin</Link>
                </Button>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <Stat value="8" label="Assessment dimensions" />
                <Stat value="4" label="Supported sectors" />
                <Stat value="1" label="Advisory report flow" />
              </div>
            </div>

            <div className="rounded-[2.25rem] border border-white/70 bg-white/85 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="rounded-[1.9rem] bg-[linear-gradient(160deg,#0f172a,#164e63)] p-7 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">What I2E Consulting delivers</div>
                <div className="font-heading mt-4 text-2xl font-semibold">An assessment-led consulting experience, not a generic survey.</div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                  <p>Captures organization context before scoring readiness.</p>
                  <p>Provides sector-aware starter use cases and priorities.</p>
                  <p>Produces a cleaner scorecard, roadmap, and recommended tooling stack.</p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                <div className="font-semibold text-slate-950">Current-to-target maturity view</div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Each response captures today’s maturity, target maturity, and respondent comments so the report can prioritize the real gap.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-16">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Core capabilities</div>
                <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-slate-950">A simpler path from assessment to action</h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                The experience is designed to stay easy to follow: capture context, assess readiness, review completion, and generate an executive-ready report.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
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
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Coverage</div>
              <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-slate-950">Starting sectors supported in the model</h2>
              <div className="mt-6 flex flex-wrap gap-2">
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
                Launch the workspace, complete the assessment, review unanswered items, and then generate the report.
              </p>
              <Button asChild size="lg" className="mt-6 h-11 rounded-full bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300">
                <Link href="/survey">Open assessment workspace</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="min-h-28 rounded-[1.75rem] border border-slate-200 bg-white/80 px-6 py-6 shadow-sm backdrop-blur">
      <div className="font-heading text-4xl font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm leading-5 text-slate-500">{label}</div>
    </div>
  );
}
