import Link from "next/link";
import { site, whatsappLink, mapsLink } from "@/data/site";
import { services } from "@/data/services";
import { Logo } from "./Logo";

export function Footer() {
  const c = site.serviceCentre;
  const r = site.registeredOffice;
  return (
    <footer className="mt-auto border-t border-line bg-[#040405] text-white/75">
      <div className="wrap grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo light />
          <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed">
            Phone and laptop repairs, and renewed phones with a 6-month warranty. One service centre in Velachery,
            run by people who have repaired devices since {site.since}.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="mb-4 text-[13px] font-medium text-white">Repairs</p>
          <ul className="space-y-2.5 text-[15px]">
            {services.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-white">
                  {s.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/services" className="text-white hover:underline">
                All repairs and prices
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="mb-4 text-[13px] font-medium text-white">Company</p>
          <ul className="space-y-2.5 text-[15px]">
            <li><Link href="/renewed" className="hover:text-white">Renewed phones</Link></li>
            <li><Link href="/about" className="hover:text-white">About us</Link></li>
            <li><Link href="/book" className="hover:text-white">Book a repair</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="mb-4 text-[13px] font-medium text-white">Service centre</p>
          <address className="text-[15px] leading-relaxed not-italic">
            {c.line1}, {c.line2}
            <br />
            {c.city} {c.pin}
          </address>
          <a href={mapsLink} target="_blank" rel="noopener" className="mt-1 inline-block text-[14px] text-white underline-offset-4 hover:underline">
            Get directions
          </a>
          <p className="mt-4 text-[15px]">{site.hours.label}</p>
          <p className="mt-4 space-y-1 text-[15px]">
            <a href={site.phoneHref} className="block text-white">{site.phone}</a>
            <a href={whatsappLink()} className="block hover:text-white">WhatsApp</a>
            <a href={`mailto:${site.email}`} className="block hover:text-white">{site.email}</a>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-6 text-[13px] text-white/50 md:flex-row md:justify-between">
          <p>
            © {site.copyrightYear} {site.legalName}. Registered office: {r.line1}, {r.line2}, {r.city} {r.pin}.
          </p>
          {site.gstin && <p>GSTIN {site.gstin}</p>}
        </div>
      </div>
    </footer>
  );
}
