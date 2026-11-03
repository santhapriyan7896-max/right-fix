import type { Metadata, Viewport } from "next";
import { Funnel_Display, Funnel_Sans, Martian_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";
import { site } from "@/data/site";

const display = Funnel_Display({ variable: "--font-funnel-display", subsets: ["latin"] });
const sans = Funnel_Sans({ variable: "--font-funnel-sans", subsets: ["latin"] });
const mono = Martian_Mono({ variable: "--font-martian", subsets: ["latin"], axes: ["wdth"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "RightFix Labs · Phone & Laptop Repair and Renewed iPhones in Velachery, Chennai",
    template: "%s · RightFix Labs, Velachery",
  },
  description:
    "Phone and laptop repair in Velachery, Chennai. Free check and a written quote before any work. Renewed iPhones with 32-point certification and a 6-month warranty.",
  openGraph: { type: "website", locale: "en_IN", siteName: "RightFix Labs" },
};

export const viewport: Viewport = { themeColor: "#06080b" };

const c = site.serviceCentre;
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: site.legalName,
  url: site.url,
  telephone: site.phone,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${c.line1}, ${c.line2}`,
    addressLocality: c.city,
    postalCode: c.pin,
    addressRegion: c.state,
    addressCountry: "IN",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "20:00",
    },
  ],
  areaServed: site.pickupAreas.map((a) => ({ "@type": "Place", name: `${a}, Chennai` })),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}>
      <body className="flex min-h-screen flex-col pb-16 lg:pb-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBar />
      </body>
    </html>
  );
}
