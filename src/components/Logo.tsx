// Text wordmark. To use your logo file instead, put it at /public/logo.svg
// (or .png) and swap this for <Image src="/logo.svg" ... />.
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 28 28" className="size-7" aria-hidden>
        <rect width="28" height="28" rx="7" className={light ? "fill-white" : "fill-brand"} />
        <path
          d="m8 14.5 4 4 8-9"
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={light ? "stroke-[#040405]" : "stroke-paper"}
        />
      </svg>
      <span className={`text-[19px] font-semibold tracking-[-0.03em] ${light ? "text-white" : "text-ink"}`}>
        RightFix
        <span className={`ml-1.5 font-mono text-[11px] font-normal tracking-normal ${light ? "text-white/60" : "text-muted"}`}>
          LABS
        </span>
      </span>
    </span>
  );
}
