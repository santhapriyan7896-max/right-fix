import Link from "next/link";
import { formatPrice, type Service } from "@/data/services";
import { Arrow } from "./icons";

export function PriceTable({ items }: { items: Service[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="hidden grid-cols-12 gap-4 border-b border-line bg-sand/60 px-5 py-3 text-[13px] text-muted sm:grid">
        <span className="col-span-6">Repair</span>
        <span className="col-span-3">Usually takes</span>
        <span className="col-span-3 text-right">Price</span>
      </div>
      <ul>
        {items.map((s) => {
          const price = formatPrice(s.priceFrom);
          return (
            <li key={s.slug} className="border-b border-line last:border-0">
              <Link
                href={`/services/${s.slug}`}
                className="group grid grid-cols-12 items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-sand/50"
              >
                <span className="col-span-12 sm:col-span-6">
                  <span className="block font-medium text-ink">{s.name}</span>
                  <span className="mt-0.5 block text-[14px] text-muted">{s.summary}</span>
                </span>
                <span className="col-span-7 text-[14px] text-ink-2 sm:col-span-3">{s.time}</span>
                <span className="col-span-5 flex items-center justify-end gap-2 text-right sm:col-span-3">
                  {price ? (
                    <span className="text-[15px]">
                      <span className="text-muted">from </span>
                      <span className="font-medium text-ink">{price}</span>
                    </span>
                  ) : (
                    <span className="text-[14px] text-ink-2">Quote after free check</span>
                  )}
                  <Arrow className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
