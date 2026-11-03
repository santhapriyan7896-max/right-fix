// Repair services.
// priceFrom: the lowest price you actually charge, in rupees. Leave null to show
// "Quote after free check". Real starting prices are the single biggest trust
// signal on a repair site, so fill these in when you can.
// time: how long it usually takes while the customer waits or same-day.

export type Service = {
  slug: string;
  name: string;
  category: "phone" | "laptop";
  summary: string;
  signs: string[]; // symptoms people search for
  included: string[];
  time: string;
  sameDay: boolean;
  priceFrom: number | null;
  warranty: string | null; // e.g. "90 days". null shows "Written on your invoice"
  faqs: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "mobile-screen",
    name: "Phone screen replacement",
    category: "phone",
    summary: "Cracked glass, lines on the display, touch not working, or a black screen.",
    signs: ["Cracked or shattered glass", "Green or white lines", "Touch not responding in parts", "Screen black but phone rings"],
    included: [
      "Screen fitted with a new waterproof seal",
      "Face ID / Touch ID checked after fitting",
      "Touch tested across the whole panel",
      "Part type written on your quote (original or labelled alternative)",
    ],
    time: "2 to 4 hours",
    sameDay: true,
    priceFrom: null,
    warranty: null,
    faqs: [
      { q: "Will Face ID still work?", a: "Face ID sits in the top sensor housing, not in the screen, so a screen change done properly does not affect it. We test it in front of you before handing the phone back." },
      { q: "Original or copy screen?", a: "We tell you in writing which part we are fitting and what it costs before we start. If you want original only, say so and we quote for that." },
      { q: "Will I lose my data?", a: "No. A screen replacement does not touch your storage. We still suggest a backup before any repair." },
    ],
  },
  {
    slug: "mobile-battery",
    name: "Phone battery replacement",
    category: "phone",
    summary: "Drains fast, shuts down at 20%, swollen back, or a Service warning in settings.",
    signs: ["Battery health below 80%", "Phone switches off suddenly", "Back panel lifting", "Gets hot while charging"],
    included: ["Battery health checked before and after", "New adhesive and seal", "Health report shown to you at pickup"],
    time: "About 30 minutes",
    sameDay: true,
    priceFrom: null,
    warranty: null,
    faqs: [
      { q: "Will I see a non-genuine battery message on my iPhone?", a: "With a genuine Apple battery the message does not appear. If we quote an alternative battery we tell you up front that the message may show." },
    ],
  },
  {
    slug: "mobile-charging-port",
    name: "Charging port repair",
    category: "phone",
    summary: "Charges only at an angle, very slow charging, or not charging at all.",
    signs: ["Cable is loose in the port", "Charges only at an angle", "Not detected by laptop", "Mic not working on calls"],
    included: ["Port cleaned and checked first (often that is all it needs)", "Port and flex replaced if damaged", "Charging speed tested"],
    time: "Under 90 minutes",
    sameDay: true,
    priceFrom: null,
    warranty: null,
    faqs: [
      { q: "Is it always the port?", a: "No. Lint in the port causes many charging problems. We clean and test it first, and if that fixes it, you pay only for the cleaning." },
    ],
  },
  {
    slug: "mobile-camera",
    name: "Camera repair",
    category: "phone",
    summary: "Blurry photos, camera shaking, black camera screen, or a cracked lens.",
    signs: ["Photos blurry or not focusing", "Camera app shows black", "Lens glass cracked", "Buzzing sound from camera"],
    included: ["Front, rear and ultra-wide modules", "Lens glass replaced separately where possible", "Focus and stabilisation tested"],
    time: "Same day",
    sameDay: true,
    priceFrom: null,
    warranty: null,
    faqs: [],
  },
  {
    slug: "mobile-back-glass",
    name: "Back glass replacement",
    category: "phone",
    summary: "Cracked rear glass replaced without changing the whole body.",
    signs: ["Cracked back panel", "Sharp edges on the back"],
    included: ["Broken glass removed by laser", "New back glass fitted", "Wireless charging tested"],
    time: "Same day",
    sameDay: true,
    priceFrom: null,
    warranty: null,
    faqs: [],
  },
  {
    slug: "mobile-water-damage",
    name: "Water damage",
    category: "phone",
    summary: "Phone fell in water? Do not charge it and do not put it in rice. Bring it in.",
    signs: ["Dropped in water", "Moisture inside the camera", "Phone dead after getting wet"],
    included: ["Board opened and cleaned in an ultrasonic bath", "Corroded parts repaired at component level", "Honest call on whether it is worth fixing"],
    time: "1 to 3 days",
    sameDay: false,
    priceFrom: null,
    warranty: null,
    faqs: [
      { q: "Can every wet phone be saved?", a: "No, and we will not pretend otherwise. We open it, look at the board, and tell you what we see before you pay for anything beyond the check." },
    ],
  },
  {
    slug: "mobile-motherboard",
    name: "Phone motherboard repair",
    category: "phone",
    summary: "Phone will not turn on, no network, or stuck after a fall or water damage.",
    signs: ["Dead, no sign of power", "No service / no SIM", "Restarts on its own"],
    included: ["Fault traced under the microscope", "Chip-level repair instead of a full board swap", "Data kept where the board allows"],
    time: "2 to 5 days",
    sameDay: false,
    priceFrom: null,
    warranty: null,
    faqs: [],
  },
  {
    slug: "mobile-software",
    name: "Software and OS reflash",
    category: "phone",
    summary: "Stuck on the logo, restart loop, very slow phone, or an update gone wrong.",
    signs: ["Stuck on logo", "Restart loop", "Update failed"],
    included: ["Backup attempted before anything is flashed", "Official firmware only"],
    time: "Same day",
    sameDay: true,
    priceFrom: null,
    warranty: null,
    faqs: [
      { q: "Do you remove Google or iCloud locks?", a: "Only for the owner, with proof of purchase. We do not unlock phones that are not yours." },
    ],
  },
  {
    slug: "laptop-screen",
    name: "Laptop screen replacement",
    category: "laptop",
    summary: "Cracked panel, flickering, lines, dead pixels, or a very dim screen.",
    signs: ["Cracked panel", "Flickering or lines", "Dark screen but laptop running", "Dead pixels"],
    included: ["Panel matched to your exact model and connector", "Free check first to rule out a cable fault", "Brightness and colour checked"],
    time: "Same day if the panel is in stock",
    sameDay: true,
    priceFrom: null,
    warranty: null,
    faqs: [
      { q: "Is it always the screen?", a: "No. A loose display cable gives the same symptoms and costs far less. We check that first." },
    ],
  },
  {
    slug: "laptop-battery",
    name: "Laptop battery replacement",
    category: "laptop",
    summary: "Swollen battery, shuts down without warning, or lasts only minutes off charger.",
    signs: ["Battery swelling, trackpad lifting", "Shuts down off charger", "Not charging"],
    included: ["Battery health and charger checked before quoting", "Batteries with safety certification", "Old battery disposed of safely"],
    time: "Same day",
    sameDay: true,
    priceFrom: null,
    warranty: null,
    faqs: [
      { q: "My battery is swollen. Is it safe to use?", a: "Stop using it and do not charge it. A swollen lithium battery can catch fire. Bring it in and we will remove it safely." },
    ],
  },
  {
    slug: "ssd-upgrade",
    name: "SSD and RAM upgrade",
    category: "laptop",
    summary: "Make a slow laptop quick again. Your files moved across to the new drive for free.",
    signs: ["Takes minutes to boot", "Freezes with many tabs open", "Disk always at 100%"],
    included: ["Free data migration to the new drive", "Drive maker's warranty passed to you", "We tell you if your laptop will not benefit"],
    time: "2 to 3 hours",
    sameDay: true,
    priceFrom: null,
    warranty: null,
    faqs: [],
  },
  {
    slug: "laptop-keyboard",
    name: "Keyboard and trackpad repair",
    category: "laptop",
    summary: "Sticky keys, missing keys, keys typing on their own, or a dead trackpad.",
    signs: ["Keys not working", "Liquid spilled on keyboard", "Trackpad not clicking"],
    included: ["Single-key repair where possible", "Full keyboard replacement when needed"],
    time: "Same day for most models",
    sameDay: true,
    priceFrom: null,
    warranty: null,
    faqs: [],
  },
  {
    slug: "laptop-motherboard",
    name: "Laptop motherboard repair",
    category: "laptop",
    summary: "No power, liquid spill, short circuit, or no display. Repaired at chip level.",
    signs: ["No power at all", "Liquid spilled", "Fan runs but no display"],
    included: ["Fault traced on the board", "Component-level repair, not a board swap", "Written report of what failed"],
    time: "2 to 5 days",
    sameDay: false,
    priceFrom: null,
    warranty: null,
    faqs: [],
  },
  {
    slug: "os-software",
    name: "OS install and cleanup",
    category: "laptop",
    summary: "Slow start-up, viruses, pop-ups, or a fresh Windows or macOS install.",
    signs: ["Very slow", "Pop-ups and viruses", "Windows will not start"],
    included: ["Your data backed up first", "Genuine licences only", "Drivers installed and checked"],
    time: "Same day",
    sameDay: true,
    priceFrom: null,
    warranty: null,
    faqs: [],
  },
  {
    slug: "data-recovery",
    name: "Data recovery",
    category: "laptop",
    summary: "Dead drive, accidental format, or corrupted files. If we recover nothing, you pay nothing.",
    signs: ["Drive not detected", "Formatted by mistake", "Files will not open"],
    included: ["Free assessment of the drive", "List of recoverable files shown before you pay", "No data, no charge"],
    time: "2 to 7 days",
    sameDay: false,
    priceFrom: null,
    warranty: null,
    faqs: [],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);

export function formatPrice(n: number | null) {
  if (n == null) return null;
  return "₹" + n.toLocaleString("en-IN");
}
