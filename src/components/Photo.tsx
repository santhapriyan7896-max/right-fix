import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

// Shows a real photo from /public if it exists, otherwise a labelled slot
// describing the photo that should go there. Drop the file in and it appears.
export function Photo({
  src,
  alt,
  shot,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  src: string; // e.g. "/photos/shop-front.jpg"
  alt: string;
  shot: string; // description of the photo to take
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const exists = fs.existsSync(path.join(process.cwd(), "public", src));

  if (exists) {
    return (
      <div className={`relative overflow-hidden bg-sand ${className}`}>
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-start overflow-hidden bg-sand ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, transparent 0 14px, rgba(0,0,0,0.025) 14px 15px)",
      }}
      role="img"
      aria-label={alt}
    >
      <div className="m-4 max-w-[30ch] rounded-lg border border-line-2 bg-card/90 px-3 py-2">
        <p className="font-mono text-[11px] uppercase tracking-wider text-amber">Photo needed</p>
        <p className="mt-0.5 text-[13px] leading-snug text-ink-2">{shot}</p>
        <p className="mt-1 font-mono text-[11px] text-muted">public{src}</p>
      </div>
    </div>
  );
}
