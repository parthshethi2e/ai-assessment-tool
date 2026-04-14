import Link from "next/link";
import BrandBadge from "@/components/BrandBadge";
import { Button } from "@/components/ui/button";

export default function SiteHeader({ current = "", hideStartAssessment = false }) {
  const navClass = (href) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      current === href
        ? "bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
        : "text-slate-950 hover:bg-slate-100"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-[92rem] flex-wrap items-center justify-between gap-5 px-6 py-4 lg:px-8">
        <Link href="/" className="transition hover:opacity-90">
          <BrandBadge subtitle={null} size="large" />
        </Link>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/" className={navClass("/")}>
              Home
            </Link>
            <Link href="/survey" className={navClass("/survey")}>
              Workspace
            </Link>
            <Link href="/admin" className={navClass("/admin")}>
              Admin
            </Link>
          </nav>

          <Button asChild className="h-11 rounded-full bg-[#2699f5] px-6 text-white shadow-[0_12px_26px_rgba(38,153,245,0.26)] hover:bg-[#1688e2]">
            <a href="https://www.i2econsulting.com/contact-us" target="_blank" rel="noreferrer">
              Contact us
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
