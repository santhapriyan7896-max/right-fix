import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { site, whatsappLink } from "@/data/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `RightFix Labs is a phone and laptop repair centre in Velachery, Chennai, run by a team that has repaired devices since ${site.since}.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About RightFix"
        title="A repair shop run by people from the service-centre side."
        lead={`Our team has worked in device repair since ${site.since}: in brand service centres, OEM warranty programmes and large repair operations. RightFix is where we now do that work directly for customers in Chennai.`}
      />

      <section className="wrap grid gap-12 py-16 sm:py-24 lg:grid-cols-12">
        <div className="space-y-6 text-[1.05rem] leading-relaxed text-ink-2 lg:col-span-6">
          <h2 className="h2 text-ink">Why we started it</h2>
          <p>
            Most people have a bad repair story. A phone that came back with the same fault. A laptop that died again a
            week later. A price that doubled at the counter.
          </p>
          <p>
            We spent years on the other side of that counter, running service networks and warranty programmes for large
            brands. We knew what good repair work looks like and how it should be documented. We opened RightFix in
            Velachery to offer that standard to everyone, not only brand-warranty customers.
          </p>
          <p>
            So every device gets a free check and a written quote first. We say plainly whether a part is original or an
            alternative. Every repair is tested before you pay, and the warranty is printed on your invoice.
          </p>
        </div>
        <Photo
          src="/photos/workshop.jpg"
          alt="Inside the RightFix Labs workshop"
          shot="A wide shot of your workshop: benches, microscopes, tools, a device being worked on. Natural light if you can."
          className="aspect-[4/5] rounded-[20px] lg:col-span-5 lg:col-start-8"
        />
      </section>

      <section className="border-y border-line bg-card">
        <div className="wrap grid gap-10 py-16 sm:py-20 md:grid-cols-3">
          {[
            ["Repairs", "Phones, laptops and other electronics. Most jobs are done the same day, with genuine or clearly labelled parts."],
            ["Board-level work", "Microsoldering and chip-level repair, so a single failed part does not mean replacing the whole board."],
            ["For businesses", "Laptop fleet repairs, refurbishment and returns handling for companies and OEM programmes. Ask us for details."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="h3">{t}</h3>
              <p className="mt-2 leading-relaxed text-ink-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap grid gap-5 py-16 sm:py-24 md:grid-cols-2" id="careers">
        <div className="card p-7 sm:p-9">
          <h2 className="text-[1.35rem] font-semibold">Work with us</h2>
          <p className="mt-3 text-ink-2">
            We hire board-level technicians, store staff and customer support people at the Velachery centre.
          </p>
          <a href={`mailto:${site.email}?subject=Job%20application`} className="btn-ghost mt-5">
            Send your CV to {site.email}
          </a>
        </div>
        <div className="card p-7 sm:p-9" id="franchisee">
          <h2 className="text-[1.35rem] font-semibold">Open a RightFix centre</h2>
          <p className="mt-3 text-ink-2">
            We are looking for partners who want to run a RightFix service centre in their city, to the same standard.
          </p>
          <a href={whatsappLink("Hi RightFix, I'm interested in a franchise. My city is: ")} className="btn-ghost mt-5">
            Talk to us about a franchise
          </a>
        </div>
      </section>

      <section className="wrap pb-24">
        <div className="flex flex-col gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[1.25rem] font-medium">Have something that needs fixing?</p>
          <div className="flex gap-3">
            <Link href="/book" className="btn-primary">Book a repair</Link>
            <Link href="/contact" className="btn-secondary">Visit us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
