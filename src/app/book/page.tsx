import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Check } from "@/components/icons";
import { site } from "@/data/site";
import { BookForm } from "./BookForm";

export const metadata: Metadata = {
  title: "Book a Repair",
  description: "Book a phone or laptop repair at RightFix Labs, Velachery. Free check, written quote, free pickup in nearby areas.",
};

export default function BookPage() {
  return (
    <>
      <PageHeader
        eyebrow="Book a repair"
        title="Tell us what needs fixing."
        lead="Takes about a minute. We reply on WhatsApp with a price range and a time that suits you."
      />
      <div className="wrap grid gap-12 py-14 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <BookForm />
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="card sticky top-32 p-6 sm:p-7">
            <p className="font-medium">What happens next</p>
            <ul className="mt-4 space-y-3 text-[15px] text-ink-2">
              {[
                "We reply on WhatsApp, usually within 15 minutes in opening hours.",
                "Free check when your device reaches us.",
                "Written price before any repair. Say no and you pay nothing.",
                "Check it works, then pay. The invoice is your warranty.",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <Check className="mt-1 size-4 shrink-0 text-brand" />
                  {x}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-line pt-5 text-[14px] text-ink-2">
              <p className="font-medium text-ink">Service centre</p>
              <p className="mt-1">
                {site.serviceCentre.line1}, {site.serviceCentre.line2}, {site.serviceCentre.city} {site.serviceCentre.pin}
              </p>
              <p className="mt-1">{site.hours.label}</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
