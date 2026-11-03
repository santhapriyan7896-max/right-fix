import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Visit } from "@/components/Visit";
import { Photo } from "@/components/Photo";
import { site, whatsappLink } from "@/data/site";
import { Mail, Phone, WhatsApp } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact & Directions",
  description: "RightFix Labs service centre, 5/33 AGS Colony, Velachery, Chennai 600091. Open Monday to Saturday, 9 AM to 8 PM.",
};

export default function ContactPage() {
  const r = site.registeredOffice;
  const ways = [
    { icon: WhatsApp, t: "WhatsApp", d: "Fastest. Send a photo of the problem.", href: whatsappLink(), cta: "Open chat" },
    { icon: Phone, t: "Call", d: site.phone, href: site.phoneHref, cta: "Call now" },
    { icon: Mail, t: "Email", d: site.email, href: `mailto:${site.email}`, cta: "Write to us" },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Come in, call, or message us."
        lead={`We are at ${site.serviceCentre.line1}, ${site.serviceCentre.line2}. ${site.hours.label}.`}
      />

      <section className="wrap grid gap-4 pt-14 md:grid-cols-3">
        {ways.map((w) => (
          <a key={w.t} href={w.href} className="card group flex flex-col p-6 transition-colors hover:border-line-2">
            <w.icon className="size-5 text-brand" />
            <p className="mt-4 font-medium">{w.t}</p>
            <p className="mt-1 text-ink-2">{w.d}</p>
            <span className="btn-ghost mt-5">{w.cta}</span>
          </a>
        ))}
      </section>

      <Visit heading={false} />

      <section className="wrap grid gap-10 pb-24 lg:grid-cols-12">
        <Photo
          src="/photos/counter.jpg"
          alt="The customer counter inside RightFix Labs"
          shot="The counter from where a customer stands, with a staff member. Shows people what to expect when they walk in."
          className="aspect-[16/10] rounded-[20px] lg:col-span-7"
        />
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="font-medium">Registered office</p>
          <address className="mt-2 leading-relaxed text-ink-2 not-italic">
            {r.line1}
            <br />
            {r.line2}
            <br />
            {r.city} {r.pin}, {r.state}
          </address>
          <p className="mt-3 text-[14px] text-muted">
            This is our company office. For repairs and phone sales, please visit the Velachery service centre.
          </p>
          {site.gstin && <p className="mt-4 font-mono text-[13px] text-muted">GSTIN {site.gstin}</p>}
        </div>
      </section>
    </>
  );
}
