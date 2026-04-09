import Image from "next/image";

export default function BrandBadge({ subtitle = "AI readiness advisory platform", dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`overflow-hidden rounded-2xl border ${dark ? "border-white/10 bg-white" : "border-slate-200 bg-white"} p-2 shadow-sm`}>
        <Image src="/i2e-logo.webp" alt="I2E Consulting" width={54} height={54} className="h-10 w-auto object-contain" priority />
      </div>
      <div>
        <div className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-950"}`}>I2E Consulting</div>
        <div className={`text-xs ${dark ? "text-white/70" : "text-slate-500"}`}>{subtitle}</div>
      </div>
    </div>
  );
}
