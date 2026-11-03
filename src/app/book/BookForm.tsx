"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { services } from "@/data/services";
import { site, whatsappLink } from "@/data/site";
import { Check, WhatsApp } from "@/components/icons";

const brands = {
  phone: ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Vivo", "Oppo", "Other"],
  laptop: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "Other"],
};

type Device = "phone" | "laptop";

const noSubscribe = () => () => {};

export function BookForm() {
  // "Book this repair" links add ?service=<slug>. Read it in the browser so the
  // page itself can stay fully static.
  const search = useSyncExternalStore(noSubscribe, () => window.location.search, () => "");
  const pre = services.find((s) => s.slug === new URLSearchParams(search).get("service"));

  const [deviceChoice, setDevice] = useState<Device | null>(null);
  const device: Device = deviceChoice ?? pre?.category ?? "phone";
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [picked, setPicked] = useState<string[] | null>(null); // null = not touched yet
  const issues = picked ?? (pre && pre.category === device ? [pre.name] : []);
  const [details, setDetails] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [how, setHow] = useState<"walk-in" | "pickup">("walk-in");
  const [area, setArea] = useState("");
  const [tried, setTried] = useState(false);

  const options = useMemo(() => services.filter((s) => s.category === device).map((s) => s.name), [device]);
  const phoneOk = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));
  const valid = brand && (issues.length > 0 || details.trim()) && name.trim() && phoneOk && (how === "walk-in" || area);

  const message = [
    "Hi RightFix, I'd like to book a repair.",
    "",
    `Device: ${device === "phone" ? "Phone" : "Laptop"}, ${brand}${model ? " " + model : ""}`,
    `Problem: ${[...issues, details.trim()].filter(Boolean).join("; ")}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    how === "pickup" ? `Pickup from: ${area}` : "I'll bring it to the Velachery centre",
  ].join("\n");

  function toggle(i: string) {
    setPicked(issues.includes(i) ? issues.filter((x) => x !== i) : [...issues, i]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!valid) return;
    window.open(whatsappLink(message), "_blank", "noopener");
  }

  const err = (cond: boolean) => tried && cond;

  return (
    <form onSubmit={submit} noValidate className="space-y-10">
      {/* Device */}
      <fieldset>
        <legend className="h3">1. Your device</legend>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(["phone", "laptop"] as Device[]).map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => {
                setDevice(d);
                setBrand("");
                setPicked([]);
              }}
              aria-pressed={device === d}
              className={`h-14 rounded-xl border text-[15px] font-medium transition-colors ${
                device === d ? "border-brand bg-brand-soft text-brand" : "border-line-2 bg-card text-ink hover:border-ink"
              }`}
            >
              {d === "phone" ? "Phone" : "Laptop"}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="brand">Brand</label>
            <select id="brand" className="field" value={brand} onChange={(e) => setBrand(e.target.value)} aria-invalid={err(!brand)}>
              <option value="">Choose brand</option>
              {brands[device].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            {err(!brand) && <p className="mt-1.5 text-[13px] text-amber">Choose a brand</p>}
          </div>
          <div>
            <label className="label" htmlFor="model">
              Model <span className="font-normal text-muted">(if you know it)</span>
            </label>
            <input id="model" className="field" placeholder={device === "phone" ? "e.g. iPhone 13" : "e.g. Inspiron 15 3520"} value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
        </div>
      </fieldset>

      {/* Problem */}
      <fieldset>
        <legend className="h3">2. What is wrong with it?</legend>
        <p className="mt-1 text-[14px] text-muted">Pick any that apply. Not sure? Just describe it below.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {options.map((o) => {
            const on = issues.includes(o);
            return (
              <button
                type="button"
                key={o}
                onClick={() => toggle(o)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] transition-colors ${
                  on ? "border-brand bg-brand-soft text-brand" : "border-line-2 bg-card text-ink-2 hover:border-ink"
                }`}
              >
                {on && <Check className="size-3.5" />}
                {o}
              </button>
            );
          })}
        </div>
        <label className="label mt-5" htmlFor="details">
          Describe the problem <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="details"
          rows={3}
          className="field h-auto py-3"
          placeholder="e.g. Dropped it yesterday, screen has lines and touch doesn't work at the bottom"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        {err(issues.length === 0 && !details.trim()) && <p className="mt-1.5 text-[13px] text-amber">Pick a problem or describe it</p>}
      </fieldset>

      {/* Contact */}
      <fieldset>
        <legend className="h3">3. Your details</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={err(!name.trim())} />
            {err(!name.trim()) && <p className="mt-1.5 text-[13px] text-amber">Enter your name</p>}
          </div>
          <div>
            <label className="label" htmlFor="phone">Mobile number</label>
            <input id="phone" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="98xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={err(!phoneOk)} />
            {err(!phoneOk) && <p className="mt-1.5 text-[13px] text-amber">Enter a 10-digit Indian mobile number</p>}
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {([
            ["walk-in", "I'll bring it in", `${site.serviceCentre.line1}, ${site.serviceCentre.line2}`],
            ["pickup", "Pick it up from me", "Free in nearby areas"],
          ] as const).map(([v, t, d]) => (
            <label
              key={v}
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                how === v ? "border-brand bg-brand-soft" : "border-line-2 bg-card hover:border-ink"
              }`}
            >
              <input type="radio" name="how" className="mt-1 accent-[var(--color-brand)]" checked={how === v} onChange={() => setHow(v)} />
              <span>
                <span className="block font-medium">{t}</span>
                <span className="block text-[14px] text-muted">{d}</span>
              </span>
            </label>
          ))}
        </div>
        {how === "pickup" && (
          <div className="mt-4">
            <label className="label" htmlFor="area">Your area</label>
            <select id="area" className="field" value={area} onChange={(e) => setArea(e.target.value)} aria-invalid={err(!area)}>
              <option value="">Choose area</option>
              {site.pickupAreas.map((a) => (
                <option key={a}>{a}</option>
              ))}
              <option>Somewhere else in Chennai</option>
            </select>
            {err(!area) && <p className="mt-1.5 text-[13px] text-amber">Choose your area</p>}
          </div>
        )}
      </fieldset>

      <div className="border-t border-line pt-8">
        <button type="submit" className="btn-primary w-full sm:w-auto">
          <WhatsApp /> Send booking on WhatsApp
        </button>
        <p className="mt-3 text-[14px] text-muted">
          This opens WhatsApp with your booking filled in. Press send and we reply during opening hours ({site.hours.short}).
          Prefer to talk? Call <a href={site.phoneHref} className="text-ink underline underline-offset-4">{site.phone}</a>.
        </p>
      </div>
    </form>
  );
}
