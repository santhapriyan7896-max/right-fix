// Renewed phones in stock. Each entry is ONE handset (not a model).
// Add a real photo of that exact handset in /public/phones/ and point `photo` at it.
// Remove an entry when it sells.

export type Grade = "Excellent" | "Very good" | "Good";

export type Phone = {
  id: string; // your stock number, shown on the card
  model: string;
  storage: string;
  colour: string;
  grade: Grade;
  batteryHealth: number; // %
  price: number; // rupees
  mrp?: number; // new price, for comparison
  photo?: string; // e.g. "/phones/rf-0142.jpg"
  notes?: string; // e.g. "Light scratch on frame, screen perfect"
};

export const phones: Phone[] = [
  // {
  //   id: "RF-0142",
  //   model: "iPhone 13",
  //   storage: "128 GB",
  //   colour: "Midnight",
  //   grade: "Excellent",
  //   batteryHealth: 89,
  //   price: 38999,
  //   mrp: 59900,
  //   photo: "/phones/rf-0142.jpg",
  //   notes: "No marks on screen or back. Box not included.",
  // },
];

// Shown ONLY while running locally (npm run dev) and only when `phones` is
// empty, so you can see how the shop looks. Never shown on the live site.
export const previewPhones: Phone[] = [
  { id: "SAMPLE-1", model: "iPhone 13", storage: "128 GB", colour: "Midnight", grade: "Excellent", batteryHealth: 89, price: 0, notes: "Sample card for layout only" },
  { id: "SAMPLE-2", model: "iPhone 14 Pro", storage: "256 GB", colour: "Deep Purple", grade: "Very good", batteryHealth: 86, price: 0, notes: "Sample card for layout only" },
  { id: "SAMPLE-3", model: "Galaxy S23", storage: "256 GB", colour: "Phantom Black", grade: "Good", batteryHealth: 91, price: 0, notes: "Sample card for layout only" },
];

export const gradeMeaning: Record<Grade, string> = {
  Excellent: "Looks close to new. No marks visible at arm's length.",
  "Very good": "Light marks on the frame or back. Screen clean.",
  Good: "Visible wear on the body. Screen clean. Works exactly the same.",
};

// The 32-point certification, grouped. Counts add up to 32.
export const checks: { group: string; items: string[] }[] = [
  { group: "Identity", items: ["IMEI matches the box and the board", "Not on the stolen / blacklist register", "Proof of previous ownership", "Model and storage confirmed"] },
  { group: "Data", items: ["Certified data erasure", "Clean first-time setup", "No iCloud, Google or Samsung account linked"] },
  { group: "Display", items: ["No dead pixels", "No burn-in", "Touch works across the full panel", "Brightness and True Tone"] },
  { group: "Battery and charging", items: ["Battery health measured", "Charge cycle count", "Wired charging port", "Wireless charging"] },
  { group: "Cameras", items: ["Rear camera", "Front camera", "Autofocus and stabilisation", "Flash"] },
  { group: "Audio", items: ["Loudspeaker", "Earpiece", "Microphone on a live call"] },
  { group: "Connectivity", items: ["SIM and mobile network", "Wi-Fi", "Bluetooth", "GPS"] },
  { group: "Buttons and sensors", items: ["Power and volume buttons", "Face ID / fingerprint", "Proximity and motion sensors"] },
  { group: "Body", items: ["Frame and back graded", "Water-damage indicator read"] },
  { group: "Final", items: ["Full end-to-end test after all of the above"] },
];
