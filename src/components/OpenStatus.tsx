"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";

function statusNow() {
  // Chennai time regardless of where the visitor is.
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "";
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  const { days, from, to } = site.hours.open;
  const t = h + m / 60;
  const openToday = days.includes(day);
  if (openToday && t >= from && t < to) return { open: true, text: `Open now · closes ${to - 12} PM` };
  if (openToday && t < from) return { open: false, text: `Closed · opens ${from} AM today` };
  const next = days.includes((day + 1) % 7) ? "tomorrow" : "Monday";
  return { open: false, text: `Closed · opens ${from} AM ${next}` };
}

export function OpenStatus({ className = "" }: { className?: string }) {
  const [s, setS] = useState<{ open: boolean; text: string } | null>(null);
  useEffect(() => {
    const tick = () => setS(statusNow());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`size-2 rounded-full ${s == null ? "bg-line-2" : s.open ? "bg-emerald-500" : "bg-amber"}`}
        aria-hidden
      />
      <span>{s?.text ?? site.hours.short}</span>
    </span>
  );
}
