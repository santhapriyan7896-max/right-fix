// One place for every business fact on the site.
// Change it here and it updates everywhere.

export const site = {
  name: "RightFix",
  legalName: "RightFix Labs",
  url: "https://rightfixlabs.com",
  phone: "+91 99885 58847",
  phoneHref: "tel:+919988558847",
  whatsappNumber: "919988558847",
  email: "support@rightfixlabs.com",
  since: 2007,
  copyrightYear: 2026,
  hours: {
    label: "Mon to Sat, 9:00 AM to 8:00 PM",
    short: "Mon–Sat · 9 AM–8 PM",
    // 0 = Sunday. Times in 24h, Chennai time.
    open: { days: [1, 2, 3, 4, 5, 6], from: 9, to: 20 },
  },
  serviceCentre: {
    line1: "5/33, AGS Colony",
    line2: "Velachery",
    city: "Chennai",
    pin: "600091",
    state: "Tamil Nadu",
    mapQuery: "5/33 AGS Colony Velachery Chennai 600091",
    landmark: "", // e.g. "Near Velachery MRTS" — fill in, it helps people find you
  },
  registeredOffice: {
    line1: "New No 173, Old No 103, 9th Floor, Block-B",
    line2: "Navin's Presidium, Nelson Manickam Road, Aminjikarai",
    city: "Chennai",
    pin: "600029",
    state: "Tamil Nadu",
  },
  // Leave empty to hide. Add once you have them; they are strong trust signals.
  gstin: "",
  googleReviewsUrl: "",
  googleRating: null as null | { rating: number; count: number },
  pickupAreas: [
    "Velachery",
    "Adyar",
    "Guindy",
    "Taramani",
    "Pallikaranai",
    "Madipakkam",
    "Perungudi",
    "Saidapet",
  ],
  brands: ["Apple", "Samsung", "Google Pixel", "OnePlus", "Xiaomi", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft"],
  offer: {
    active: true,
    text: "Festival offer: up to 15% off renewed phones",
    until: "2026-11-30",
  },
};

export function whatsappLink(message = "Hi RightFix, I need help with a repair.") {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.serviceCentre.mapQuery)}`;
export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(site.serviceCentre.mapQuery)}&output=embed`;
