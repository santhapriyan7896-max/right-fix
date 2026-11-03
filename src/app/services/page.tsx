import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/data/services";
import { whatsappLink } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { PriceTable } from "@/components/PriceTable";
import { WhatsApp } from "@/components/icons";

export const metadata: Metadata = {
  title: "Phone & Laptop Repair Prices",
  description:
    "Repair prices and turnaround times for phone screens, batteries, charging ports, laptop screens, SSD upgrades and more at RightFix Labs, Velachery, Chennai.",
};

export default function ServicesPage() {
  const phone = services.filter((s) => s.category === "phone");
  const laptop = services.filter((s) => s.category === "laptop");
  return (
    <>
      <PageHeader
        eyebrow="Repairs"
        title="Phone and laptop repairs, with prices."
        lead="Every repair starts with a free check. You get the price, the part type, the time and the warranty in writing before we start. If you say no, you pay nothing."
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/book" className="btn-primary">Book a repair</Link>
          <a href={whatsappLink("Hi RightFix, can I get a price for a repair? My device is: ")} className="btn-secondary">
            <WhatsApp /> Get a price on WhatsApp
          </a>
        </div>
      </PageHeader>

      <div className="wrap space-y-16 py-16 sm:py-20">
        <section id="phone">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em]">Phones</h2>
            <p className="text-[14px] text-muted">iPhone, Samsung, OnePlus, Pixel, Xiaomi and more</p>
          </div>
          <PriceTable items={phone} />
        </section>
        <section id="laptop">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em]">Laptops</h2>
            <p className="text-[14px] text-muted">MacBook, Dell, HP, Lenovo, Asus, Acer and more</p>
          </div>
          <PriceTable items={laptop} />
        </section>
        <p className="max-w-[70ch] text-[14px] leading-relaxed text-muted">
          Prices depend on your exact model and on whether you choose an original or a labelled alternative part.
          Times are for parts in stock. If a part has to be ordered, we tell you the date before you agree.
        </p>
      </div>
    </>
  );
}
