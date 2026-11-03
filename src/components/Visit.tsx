import { site, mapsEmbed, mapsLink, whatsappLink } from "@/data/site";
import { Clock, Phone, Pin, WhatsApp } from "./icons";
import { OpenStatus } from "./OpenStatus";

export function Visit({ heading = true }: { heading?: boolean }) {
  const c = site.serviceCentre;
  return (
    <section className="wrap py-20 sm:py-28" id="visit">
      {heading && (
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">Visit the service centre</p>
          <h2 className="h2 mt-3">Bring it in, or we will come and get it.</h2>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="card overflow-hidden lg:col-span-7">
          <iframe
            title="Map to RightFix Labs, AGS Colony, Velachery"
            src={mapsEmbed}
            className="h-[320px] w-full border-0 sm:h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="card flex flex-col p-6 sm:p-8 lg:col-span-5">
          <div className="flex gap-3">
            <Pin className="mt-1 size-5 shrink-0 text-brand" />
            <div>
              <p className="font-medium text-ink">
                {c.line1}, {c.line2}
              </p>
              <p className="text-ink-2">
                {c.city} {c.pin}, {c.state}
              </p>
              {c.landmark && <p className="mt-1 text-[14px] text-muted">{c.landmark}</p>}
              <a href={mapsLink} target="_blank" rel="noopener" className="btn-ghost mt-2">
                Open in Google Maps
              </a>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Clock className="mt-1 size-5 shrink-0 text-brand" />
            <div>
              <p className="font-medium text-ink">{site.hours.label}</p>
              <p className="text-[14px] text-ink-2">
                <OpenStatus />
              </p>
            </div>
          </div>
          <div className="mt-6 border-t border-line pt-6">
            <p className="text-[14px] font-medium text-ink">Free pickup and drop</p>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{site.pickupAreas.join(", ")}, and nearby.</p>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
            <a href={site.phoneHref} className="btn-secondary px-4">
              <Phone /> Call
            </a>
            <a href={whatsappLink()} className="btn-secondary px-4">
              <WhatsApp /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
