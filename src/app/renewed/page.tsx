import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { checks, gradeMeaning, phones, previewPhones, type Phone } from "@/data/phones";
import { site, whatsappLink } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { Certificate } from "@/components/Certificate";
import { Check, WhatsApp } from "@/components/icons";
import { formatPrice } from "@/data/services";

export const metadata: Metadata = {
  title: "Renewed iPhones & Smartphones in Chennai",
  description:
    "Used iPhones and Android phones checked on 32 points in our Velachery workshop. Certificate for every handset, 6-month warranty, exchange accepted.",
};

const isDev = process.env.NODE_ENV === "development";

function PhoneCard({ p, sample }: { p: Phone; sample?: boolean }) {
  const price = formatPrice(p.price);
  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="relative aspect-square bg-sand">
        {p.photo ? (
          <Image src={p.photo} alt={`${p.model} ${p.colour}, stock ${p.id}`} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[12px] text-muted">Photo of this handset</div>
        )}
        {sample && (
          <span className="absolute top-3 left-3 rounded-full bg-amber px-2.5 py-1 font-mono text-[11px] text-white">
            Sample · only shows locally
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[12px] text-muted">{p.id}</p>
        <h3 className="mt-1 text-[1.1rem] font-semibold">{p.model}</h3>
        <p className="text-[14px] text-ink-2">
          {p.storage} · {p.colour}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
          <div className="rounded-lg bg-sand/70 px-3 py-2">
            <dt className="text-muted">Battery</dt>
            <dd className="font-medium">{p.batteryHealth}%</dd>
          </div>
          <div className="rounded-lg bg-sand/70 px-3 py-2">
            <dt className="text-muted">Condition</dt>
            <dd className="font-medium">{p.grade}</dd>
          </div>
        </dl>
        {p.notes && <p className="mt-3 text-[14px] text-ink-2">{p.notes}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {price && p.price > 0 ? <p className="text-[1.2rem] font-semibold">{price}</p> : <p className="text-[15px] text-muted">Price on request</p>}
            {p.mrp && <p className="text-[13px] text-muted">New: {formatPrice(p.mrp)}</p>}
          </div>
          <a href={whatsappLink(`Hi RightFix, is ${p.model} ${p.storage} (${p.id}) still available?`)} className="btn-secondary h-10 px-4 text-[14px]">
            <WhatsApp /> Ask
          </a>
        </div>
      </div>
    </article>
  );
}

export default function RenewedPage() {
  const showSamples = isDev && phones.length === 0;
  const list = showSamples ? previewPhones : phones;

  return (
    <>
      <PageHeader
        eyebrow="Renewed phones"
        title="Used phones, checked by us, with a 6-month warranty."
        lead="Each phone is a single handset that came through our Velachery workshop. We check where it came from, wipe it, test it on 32 points and grade how it looks. You can read its certificate before you pay."
      >
        {site.offer.active && (
          <p className="mt-6 inline-flex rounded-full border border-amber/30 bg-amber-soft px-4 py-2 text-[14px] text-amber">
            {site.offer.text}, until 30 November
          </p>
        )}
      </PageHeader>

      {/* Stock */}
      <section className="wrap py-14 sm:py-20" id="stock">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em]">In stock now</h2>
            <p className="mt-1 text-ink-2">Stock changes often. Ask on WhatsApp for photos of the exact phone.</p>
          </div>
        </div>

        {list.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <PhoneCard key={p.id} p={p} sample={showSamples} />
            ))}
          </div>
        ) : (
          <div className="card grid gap-6 p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-[1.25rem] font-semibold">The next batch is being checked.</h3>
              <p className="mt-2 text-ink-2">
                Nothing is listed until it has passed all 32 checks. Tell us the model and budget you have in mind and we
                will message you when a matching phone is ready.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <a href={whatsappLink("Hi RightFix, I am looking for a renewed phone. Model: , Budget: ")} className="btn-primary">
                <WhatsApp /> Tell us what you want
              </a>
              <a href={site.phoneHref} className="btn-secondary">Call {site.phone}</a>
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {Object.entries(gradeMeaning).map(([g, d]) => (
            <div key={g} className="border-t border-line pt-4">
              <p className="font-medium">{g}</p>
              <p className="mt-1 text-[14px] text-ink-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Checks */}
      <section className="border-y border-line bg-card" id="checks">
        <div className="wrap grid gap-12 py-20 sm:py-24 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">The 32 checks</p>
            <h2 className="h2 mt-3">What we test before a phone goes on sale.</h2>
            <p className="mt-5 text-ink-2">
              If a phone fails any check, it is repaired and tested again, or it is not sold. The result for each phone is
              on its certificate.
            </p>
            <div className="mt-10 hidden lg:block">
              <Certificate />
            </div>
          </div>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {checks.map((g) => (
              <div key={g.group}>
                <div className="flex items-baseline justify-between border-b border-line pb-2">
                  <h3 className="font-medium">{g.group}</h3>
                  <span className="font-mono text-[12px] text-muted">{g.items.length}</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {g.items.map((i) => (
                    <li key={i} className="flex gap-2.5 text-[15px] text-ink-2">
                      <Check className="mt-1 size-3.5 shrink-0 text-brand" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="lg:hidden">
            <Certificate />
          </div>
        </div>
      </section>

      {/* Warranty + exchange */}
      <section className="wrap grid gap-5 py-20 sm:py-24 md:grid-cols-2">
        <div className="card p-7 sm:p-9">
          <h2 className="text-[1.35rem] font-semibold">Warranty</h2>
          <p className="mt-3 text-ink-2">
            6 months, included in the price. If a hardware fault shows up, bring the phone and the invoice to Velachery
            and we repair it here. Longer cover can be added at the counter.
          </p>
          <p className="mt-4 text-[14px] text-muted">Covers hardware faults. Does not cover drops, cracks or water.</p>
        </div>
        <div className="card p-7 sm:p-9">
          <h2 className="text-[1.35rem] font-semibold">Exchange and buyback</h2>
          <p className="mt-3 text-ink-2">
            Bring your current phone and we will value it against any phone here. The value comes off the price. You can
            also sell it to us for cash.
          </p>
          <a href={whatsappLink("Hi RightFix, I want a valuation for my phone. Model and condition: ")} className="btn-ghost mt-4">
            Get a valuation on WhatsApp
          </a>
        </div>
        <div className="md:col-span-2">
          <p className="text-[14px] text-muted">
            EMI options are available at the counter. Ask in store. <Link href="/contact" className="underline underline-offset-4">How to find us</Link>
          </p>
        </div>
      </section>
    </>
  );
}
