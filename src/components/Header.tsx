"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site, mapsLink } from "@/data/site";
import { OpenStatus } from "./OpenStatus";
import { Close, Menu, Phone, Pin } from "./icons";
import { Logo } from "./Logo";

const nav = [
  { href: "/services", label: "Repairs" },
  { href: "/renewed", label: "Renewed phones" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Visit us" },
];

export function Header() {
  const pathname = usePathname();
  // Menu is open only for the page it was opened on, so it closes on navigation.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (fn: (v: boolean) => boolean) => setOpenOn(fn(open) ? pathname : null);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      {/* Shop strip: the facts people check first */}
      <div className="hidden border-b border-line text-[13px] text-ink-2 md:block">
        <div className="wrap flex h-9 items-center justify-between">
          <div className="flex items-center gap-6">
            <OpenStatus />
            <a href={mapsLink} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 hover:text-ink">
              <Pin className="size-3.5" />
              {site.serviceCentre.line1}, {site.serviceCentre.line2}, {site.serviceCentre.city}
            </a>
          </div>
          {site.offer.active && <span className="text-amber">{site.offer.text}</span>}
        </div>
      </div>

      <div className="wrap flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="RightFix home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-4 py-2 text-[15px] transition-colors ${
                  active ? "bg-sand text-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a href={site.phoneHref} className="inline-flex items-center gap-2 text-[15px] font-medium text-ink">
            <Phone />
            {site.phone}
          </a>
          <Link href="/book" className="btn-primary h-10 px-5">
            Book a repair
          </Link>
        </div>

        <button
          className="-mr-2 p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <Close /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-paper lg:hidden">
          <nav className="wrap flex flex-col py-3" aria-label="Mobile">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="border-b border-line py-4 text-[17px] text-ink last:border-0">
                {n.label}
              </Link>
            ))}
            <Link href="/book" className="btn-primary mt-3">
              Book a repair
            </Link>
            <div className="mt-5 mb-2 space-y-1 text-[14px] text-ink-2">
              <OpenStatus />
              <p>
                {site.serviceCentre.line1}, {site.serviceCentre.line2}
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
