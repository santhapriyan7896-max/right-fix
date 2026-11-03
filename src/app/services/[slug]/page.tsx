import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getService, services } from "@/data/services";
import { site, whatsappLink } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { Check, Clock, WhatsApp, Plus } from "@/components/icons";

// Every repair page is pre-built from data/services.ts, so blocking on params is fine.
export const instant = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: `${s.name} in Velachery, Chennai`,
    description: `${s.summary} Free check and written quote at RightFix Labs, AGS Colony, Velachery.`,
  };
}

export default async function ServicePage(props: PageProps<"/services/[slug]">) {
  const { slug } = await props.params;
  const s = getService(slug);
  if (!s) notFound();

  const price = formatPrice(s.priceFrom);
  const related = services.filter((x) => x.category === s.category && x.slug !== s.slug).slice(0, 3);
  const device = s.category === "phone" ? "phone" : "laptop";

  return (
    <>
      <PageHeader
        eyebrow={s.category === "phone" ? "Phone repair" : "Laptop repair"}
        title={s.name}
        lead={s.summary}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/services", label: "Repairs" },
          { href: `/services/${s.slug}`, label: s.name },
        ]}
      />

      <div className="wrap grid gap-12 py-14 sm:py-20 lg:grid-cols-12">
        <div className="space-y-14 lg:col-span-7">
          <section>
            <h2 className="h3">Signs you need this</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {s.signs.map((x) => (
                <li key={x} className="rounded-xl border border-line bg-card px-4 py-3 text-[15px] text-ink-2">
                  {x}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="h3">What we do</h2>
            <ul className="mt-4 space-y-3">
              {s.included.map((x) => (
                <li key={x} className="flex gap-3 text-ink-2">
                  <Check className="mt-1 size-4 shrink-0 text-brand" />
                  {x}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="h3">How it goes</h2>
            <ol className="mt-4 space-y-4 text-ink-2">
              <li><span className="mr-3 font-mono text-[13px] text-brand">01</span>Bring your {device} in, or book a pickup. The check is free.</li>
              <li><span className="mr-3 font-mono text-[13px] text-brand">02</span>We send the price, part type and time on WhatsApp.</li>
              <li><span className="mr-3 font-mono text-[13px] text-brand">03</span>You say yes, we repair it and test it.</li>
              <li><span className="mr-3 font-mono text-[13px] text-brand">04</span>You check it at the counter, then pay.</li>
            </ol>
          </section>

          {s.faqs.length > 0 && (
            <section>
              <h2 className="h3">Questions people ask</h2>
              <div className="mt-4 divide-y divide-line border-y border-line">
                {s.faqs.map((f) => (
                  <details key={f.q} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                      {f.q}
                      <Plus className="size-4 shrink-0 text-muted transition-transform group-open:rotate-45" />
                    </summary>
                    <p className="mt-3 leading-relaxed text-ink-2">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-5">
          <div className="card sticky top-32 p-6 sm:p-8">
            <dl className="space-y-4">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Price</dt>
                <dd className="text-right font-medium">{price ? `from ${price}` : "Quote after free check"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Usually takes</dt>
                <dd className="flex items-center gap-1.5 text-right font-medium">
                  <Clock className="size-4 text-muted" />
                  {s.time}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Warranty</dt>
                <dd className="text-right font-medium">{s.warranty ?? "Written on your invoice"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Check</dt>
                <dd className="text-right font-medium">Free</dd>
              </div>
            </dl>
            <div className="mt-8 grid gap-3">
              <Link href={`/book?service=${s.slug}`} className="btn-primary">
                Book this repair
              </Link>
              <a
                href={whatsappLink(`Hi RightFix, I need a ${s.name.toLowerCase()}. My ${device} model is: `)}
                className="btn-secondary"
              >
                <WhatsApp /> Get an exact price
              </a>
            </div>
            <p className="mt-4 text-center text-[13px] text-muted">
              Or call {site.phone} · {site.hours.short}
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line">
          <div className="wrap py-14">
            <h2 className="h3">Other {device} repairs</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/services/${r.slug}`} className="card p-5 transition-colors hover:border-line-2">
                  <p className="font-medium">{r.name}</p>
                  <p className="mt-1 text-[14px] text-muted">{r.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
