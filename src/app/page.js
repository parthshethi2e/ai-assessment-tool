import Link from "next/link";
import { ArrowRight, ChartNoAxesColumn, FileText, ShieldCheck } from "lucide-react";
import { sectorOptions } from "@/data/assessmentFramework";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Context-first assessment",
    description: "Captures organization context, tools, comments, and maturity inputs before scoring.",
    icon: ChartNoAxesColumn,
  },
  {
    title: "Executive-ready output",
    description: "Turns responses into a clear scorecard, priorities, and advisory-style report.",
    icon: FileText,
  },
  {
    title: "Governance-aware guidance",
    description: "Balances AI opportunity with risk, privacy, and operating-model readiness.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.10),transparent_30%),linear-gradient(180deg,#f8fcff_0%,#f4f8fb_48%,#eef3f7_100%)]">
      <SiteHeader current="/" />
      <div className="mx-auto max-w-[92rem] px-6 py-6 lg:px-8">
        <main className="py-8 lg:py-10">
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_380px] xl:grid-cols-[minmax(0,1.3fr)_400px] lg:items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-900">
                <ChartNoAxesColumn className="size-4" />
                I2E Consulting assessment platform
              </div>

              <div className="space-y-4">
                <h1 className="font-heading max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 lg:text-6xl">
                  Assess AI readiness with a simpler, more credible starting point.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-600">
                  A focused assessment flow for understanding current maturity, identifying priorities, and generating an executive-ready report.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="h-12 rounded-full px-6 text-sm">
                  <Link href="/survey">
                    Start assessment
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6 text-sm">
                  <Link href="/admin">Open admin</Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Stat value="8" label="Assessment areas" />
                <Stat value="4" label="Starting sectors" />
                <Stat value="1" label="Report workflow" />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
              <div className="rounded-[1.75rem] bg-[linear-gradient(160deg,#0f172a,#164e63)] p-6 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">What you get</div>
                <div className="font-heading mt-4 text-2xl font-semibold">A clear scorecard, practical priorities, and a professional report.</div>
                <div className="mt-4 space-y-2 text-sm leading-6 text-white/75">
                  <p>Capture current maturity and target maturity where it matters.</p>
                  <p>Review skipped or unanswered items before report generation.</p>
                  <p>Save the final report for consultant follow-up and delivery.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-14 grid gap-5 md:grid-cols-3">
            {featureCards.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-slate-950">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </section>

          <section className="mt-14 rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Supported sectors</div>
                <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-slate-950">Starting coverage in the current model</h2>
              </div>
              <Button asChild size="lg" className="h-11 rounded-full px-6">
                <Link href="/survey">Start assessment</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {sectorOptions.slice(0, 10).map((sector) => (
                <span key={sector} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                  {sector}
                </span>
              ))}
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
