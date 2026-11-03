// A sample of the certificate each renewed handset comes with.
// Kept deliberately plain: it should look like a document, not an ad.
export function Certificate() {
  const rows: [string, string][] = [
    ["Model", "iPhone 13 · 128 GB · Midnight"],
    ["IMEI", "35 xxxxxx xxxxxx 4 · not blacklisted"],
    ["Previous accounts", "None linked"],
    ["Data erasure", "Certified, report attached"],
    ["Battery health", "89% · 412 cycles"],
    ["Cosmetic grade", "Excellent"],
    ["Checks passed", "32 of 32"],
    ["Warranty", "6 months from date of invoice"],
  ];
  return (
    <figure className="card relative overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.03),0_12px_40px_-12px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between border-b border-dashed border-line-2 px-6 py-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">RightFix Labs · Handset certificate</p>
          <p className="mt-0.5 font-mono text-[15px] text-ink">No. RF-0142</p>
        </div>
        <span className="rounded-full border border-brand/30 bg-brand-soft px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-brand">
          Passed
        </span>
      </div>
      <dl className="divide-y divide-line px-6 font-mono text-[13px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 py-2.5">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <figcaption className="border-t border-line bg-sand/60 px-6 py-3 text-[13px] text-muted">
        Example. Every handset has its own, and you can read it before you pay.
      </figcaption>
    </figure>
  );
}
