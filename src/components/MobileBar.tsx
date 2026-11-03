import Link from "next/link";
import { site, whatsappLink } from "@/data/site";
import { Phone, WhatsApp } from "./icons";

// Fixed bar on phones: call, WhatsApp, book. Most local customers want one of these three.
export function MobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
      <div className="grid grid-cols-3 text-[13px] font-medium">
        <a href={site.phoneHref} className="flex flex-col items-center gap-1 py-2.5 text-ink">
          <Phone className="size-5" />
          Call
        </a>
        <a href={whatsappLink()} className="flex flex-col items-center gap-1 py-2.5 text-ink">
          <WhatsApp className="size-5" />
          WhatsApp
        </a>
        <Link href="/book" className="m-1.5 flex items-center justify-center rounded-xl bg-ink text-paper">
          Book repair
        </Link>
      </div>
    </div>
  );
}
