import Link from "next/link";

export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  crumbs?: { href: string; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-line">
      <div className="wrap pt-10 pb-12 sm:pt-14 sm:pb-16">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6 text-[14px] text-muted">
            {crumbs.map((c, i) => (
              <span key={c.href}>
                <Link href={c.href} className="hover:text-ink">
                  {c.label}
                </Link>
                {i < crumbs.length - 1 && <span className="mx-2">/</span>}
              </span>
            ))}
          </nav>
        )}
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-[22ch] text-[2.1rem] leading-[1.06] font-semibold tracking-[-0.03em] sm:text-[3rem]">
          {title}
        </h1>
        {lead && <p className="lead mt-5 max-w-[60ch]">{lead}</p>}
        {children}
      </div>
    </section>
  );
}
