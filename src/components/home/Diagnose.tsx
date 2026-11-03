"use client";

import { useState } from "react";
import Link from "next/link";
import { setFocus } from "@/components/bench/store";
import { formatPrice, services } from "@/data/services";
import { whatsappLink } from "@/data/site";
import { Arrow, WhatsApp } from "@/components/icons";

// "What's wrong with yours?" Picking a symptom points the 3D phone at the part
// that usually causes it, and shows the repair, time and price.

const SYMPTOMS = [
  { key: "screen", label: "Cracked screen", part: "Display assembly", slug: "mobile-screen" },
  { key: "battery", label: "Battery dies fast", part: "Battery", slug: "mobile-battery" },
  { key: "charge", label: "Won't charge", part: "Charging port", slug: "mobile-charging-port" },
  { key: "camera", label: "Blurry photos", part: "Rear cameras", slug: "mobile-camera" },
  { key: "water", label: "It got wet", part: "Logic board", slug: "mobile-water-damage" },
  { key: "power", label: "Won't turn on", part: "Logic board", slug: "mobile-motherboard" },
  { key: "back", label: "Cracked back", part: "Back glass", slug: "mobile-back-glass" },
] as const;

export function Diagnose() {
  const [key, setKey] = useState<string>("screen");
  const sym = SYMPTOMS.find((s) => s.key === key)!;
  const svc = services.find((s) => s.slug === sym.slug)!;
  const price = formatPrice(svc.priceFrom);

  const pick = (k: string) => {
    setKey(k);
    setFocus(k);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pick what is wrong">
        {SYMPTOMS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => pick(s.key)}
            aria-pressed={key === s.key}
            className={`rounded-full border px-3.5 py-2 text-[13.5px] transition-colors ${
              key === s.key
                ? "border-amber bg-amber/10 text-white"
                : "border-line-2 bg-card/70 text-ink-2 backdrop-blur hover:border-ink-2 hover:text-ink"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-line-2 bg-[#0a0d11]/85 p-5 backdrop-blur-md" aria-live="polite">
        <p className="font-mono text-[11px] tracking-[0.1em] text-amber uppercase">Usually the {sym.part.toLowerCase()}</p>
        <p className="mt-2 font-display text-[1.45rem] leading-tight font-semibold tracking-[-0.02em] text-white">{svc.name}</p>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{svc.summary}</p>
        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3.5 text-[13px]">
          <div>
            <dt className="text-muted">Takes</dt>
            <dd className="mt-1 text-ink">{svc.time}</dd>
          </div>
          <div>
            <dt className="text-muted">Price</dt>
            <dd className="mt-1 text-ink">{price ? `from ${price}` : "After free check"}</dd>
          </div>
          <div>
            <dt className="text-muted">Warranty</dt>
            <dd className="mt-1 text-ink">{svc.warranty ?? "On your invoice"}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappLink(`Hi RightFix, my phone: ${sym.label.toLowerCase()}. Model: `)}
            className="btn-primary"
          >
            <WhatsApp /> Get an exact price
          </a>
          <Link href={`/services/${svc.slug}`} className="btn-secondary">
            How we fix it <Arrow />
          </Link>
        </div>
      </div>
    </div>
  );
}
