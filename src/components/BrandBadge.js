import Image from "next/image";

export default function BrandBadge({ subtitle = "AI readiness advisory platform", dark = false, size = "default" }) {
  const isLarge = size === "large";

  return (
    <div className={`flex items-center ${isLarge ? "gap-4" : "gap-3"}`}>
      <div className={`overflow-hidden rounded-2xl border ${dark ? "border-white/10 bg-white" : "border-slate-200 bg-white"} p-2 shadow-sm`}>
        <Image
          src="/i2e-logo.webp"
          alt="I2E Consulting"
          width={54}
          height={54}
          className={`${isLarge ? "h-12" : "h-10"} w-auto object-contain`}
          priority
        />
      </div>
      <div>
        <div className={`${isLarge ? "text-xl" : "text-sm"} font-semibold leading-tight ${dark ? "text-white" : "text-slate-950"}`}>
          I2E Consulting
        </div>
        {subtitle ? <div className={`text-xs ${dark ? "text-white/70" : "text-slate-500"}`}>{subtitle}</div> : null}
      </div>
    </div>
  );
}
