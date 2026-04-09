import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BrandBadge from "@/components/BrandBadge";
import { Button } from "@/components/ui/button";

export default function SiteHeader({ current = "", hideStartAssessment = false }) {
  const showStartAssessment = !hideStartAssessment && !String(current).startsWith("/survey");
  const navClass = (href) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      current === href
        ? "bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
        : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-[linear-gradient(180deg,rgba(248,252,255,0.96),rgba(255,255,255,0.88))] backdrop-blur-xl supports-[backdrop-filter]:bg-white/78">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-4 lg:px-8">
        <Link href="/" className="transition hover:opacity-90">
          <BrandBadge subtitle="AI readiness and transformation advisory" />
        </Link>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
          <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/80 bg-white/90 p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <Link href="/" className={navClass("/")}>
              Home
            </Link>
            <Link href="/survey" className={navClass("/survey")}>
              Assessment
            </Link>
            <Link href="/admin" className={navClass("/admin")}>
              Admin
            </Link>
          </nav>

          {showStartAssessment ? (
            <Button asChild className="h-11 rounded-full bg-slate-950 px-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] hover:bg-slate-800">
              <Link href="/survey">
                Start assessment
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
