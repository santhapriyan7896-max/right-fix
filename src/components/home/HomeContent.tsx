import Link from "next/link";
import { site, whatsappLink } from "@/data/site";
import { formatPrice, getService } from "@/data/services";
import { STORY } from "@/components/bench/scenes";
import { Visit } from "@/components/Visit";
import { Arrow, WhatsApp } from "@/components/icons";
import { Diagnose } from "./Diagnose";

// The homepage story. Each chapter is a scroll anchor: the 3D bench behind the
// page moves to that chapter's scene as it reaches the middle of the screen.

type Step = {
  key: (typeof STORY)[number]["key"];
  tone: "fault" | "work" | "done";
  title: string;
  body: string;
  readout?: [string, string, boolean][];
  quote?: boolean;
  counter?: boolean;
  cta?: boolean;
};

const steps: Step[] = [
  {
    key: "arrive",
    tone: "fault",
    title: "It came in like this.",
    body: "Dropped at the bus stop. Cracked glass, green lines across the screen, and a battery that gives up by lunch.",
  },
  {
    key: "check",
    tone: "fault",
    title: "Free check, while you wait.",
    body: "A technician tests the glass, touch, display, Face ID and battery. It takes about fifteen minutes and costs nothing, whatever you decide.",
    readout: [
      ["Glass", "Cracked, bottom right", true],
      ["Touch", "Dead zone, bottom right", true],
      ["Display", "Green lines", true],
      ["Battery", "71% health · 812 cycles", true],
      ["Face ID", "Working", false],
      ["Logic board", "No faults", false],
    ],
  },
  {
    key: "quote",
    tone: "fault",
    title: "The price comes before the screwdriver.",
    body: "On WhatsApp, in writing: which part, original or alternative, how long and what warranty. Say no and you leave with your phone. No charge.",
    quote: true,
  },
  {
    key: "screws",
    tone: "work",
    title: "You said yes. Two screws first.",
    body: "Two pentalobe screws sit either side of the charging port. They are the first thing out and the last thing back in.",
  },
  {
    key: "heat",
    tone: "work",
    title: "Tape the cracks. Warm the edges.",
    body: "Tape holds broken glass together so it lifts in one piece. Gentle, moving heat softens the waterproof adhesive. Opening picks go in no deeper than 3 mm.",
  },
  {
    key: "open",
    tone: "work",
    title: "Opened like a book.",
    body: "A suction handle lifts the bottom edge and the screen swings open sideways, so the cables underneath stay attached and unstressed.",
  },
  {
    key: "battery",
    tone: "work",
    title: "Battery off before anything else.",
    body: "A small bracket comes off and the battery connector is unplugged first. No power on the board while we work on it.",
  },
  {
    key: "explode",
    tone: "work",
    title: "Seven layers. We know every one.",
    body: `Display, logic board, cameras, battery, frame, MagSafe coil, back glass. Our team has worked at board level since ${site.since}, so only the part that failed gets replaced.`,
  },
  {
    key: "swap",
    tone: "done",
    title: "Broken parts out. New parts in.",
    body: "The cracked display and the worn battery come out. New parts go in, original or clearly labelled. Nothing else is touched.",
  },
  {
    key: "test",
    tone: "done",
    title: "Sealed, then tested 32 ways.",
    body: "A new waterproof seal goes on before the screen closes. Then touch, Face ID, cameras, speakers, microphones, charging and network, one by one.",
    counter: true,
  },
  {
    key: "ready",
    tone: "done",
    title: "Ready before lunch.",
    body: "Check it at the counter, then pay. Your invoice is your warranty.",
    cta: true,
  },
];

const RENEWED_POINTS = [
  "Cameras, focus and flash",
  "MagSafe and wireless charging",
  "Battery health, measured and printed",
  "SIM, network, IMEI not blacklisted",
  "Buttons and sensors",
  "Speakers and microphones",
  "Charging port",
];

function QuoteCard() {
  const screen = formatPrice(getService("mobile-screen")?.priceFrom ?? null) ?? "₹ ——";
  const battery = formatPrice(getService("mobile-battery")?.priceFrom ?? null) ?? "₹ ——";
  return (
    <div className="rv mt-7 max-w-[380px] rounded-2xl bg-[#e9e4dc] p-3 text-[#111] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-2.5 px-1 pb-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-[#1f6a44] text-[12px] font-semibold text-white">RF</span>
        <div className="leading-tight">
          <p className="text-[14px] font-semibold">RightFix Velachery</p>
          <p className="text-[11px] text-[#555]">online</p>
        </div>
      </div>
      <div className="rounded-xl rounded-tl-sm bg-white p-3 text-[14px] leading-snug shadow-sm">
        <p className="font-semibold">Your iPhone 12 · Job 04172</p>
        <div className="mt-2 space-y-1 font-mono text-[11.5px]">
          <p className="flex justify-between gap-4"><span>Display, original</span><span>{screen}</span></p>
          <p className="flex justify-between gap-4"><span>Battery, original</span><span>{battery}</span></p>
          <p className="flex justify-between gap-4 text-[#666]"><span>Check</span><span>Free</span></p>
        </div>
        <p className="mt-2.5">Ready by 12:15. Reply <b>YES</b> to go ahead.</p>
        <p className="mt-1 text-right text-[10.5px] text-[#888]">09:20</p>
      </div>
      <div className="mt-2 ml-auto w-fit rounded-xl rounded-tr-sm bg-[#d4f5c4] px-3 py-2 text-[14px] shadow-sm">
        YES <span className="ml-2 text-[10.5px] text-[#6a8a5c]">09:24 ✓✓</span>
      </div>
    </div>
  );
}

export function HomeContent() {
  return (
    <>
      {/* Hero */}
      <section data-anchor="hero" className="relative flex min-h-[calc(100svh-64px)] items-end md:items-center lg:min-h-[calc(100svh-100px)]">
        <div className="wrap w-full pt-10 pb-24 max-md:bg-gradient-to-t max-md:from-paper max-md:from-55% max-md:via-paper/80 max-md:to-transparent max-md:pt-24 md:pb-16">
          <div className="max-w-[640px] lg:max-w-[46vw]">
            <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">RightFix Labs · Velachery, Chennai</p>
            <h1 className="hero-title mt-4 md:mt-6" data-crack-title>
              <span className="sr-only">Every phone has a bad day.</span>
              <span className="frag a" aria-hidden>Every phone has a&nbsp;bad&nbsp;day.</span>
              <span className="frag b" aria-hidden>Every phone has a&nbsp;bad&nbsp;day.</span>
            </h1>
            <p className="mt-5 max-w-[44ch] text-[16px] leading-relaxed text-ink-2 md:mt-7 sm:text-[19px]">
              Bring yours to our bench. Before we touch a single screw, you&apos;ll know what&apos;s wrong, what it costs and how long it takes.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-2.5 sm:flex sm:gap-3 md:mt-9">
              <Link href="/book" className="btn-primary px-4 sm:px-6">Book a repair</Link>
              <a href={whatsappLink("Hi RightFix, here is a photo of my phone. How much to fix it?")} className="btn-secondary px-4 sm:px-6">
                <WhatsApp />
                <span>
                  WhatsApp<span className="hidden sm:inline"> a photo</span>
                </span>
              </a>
            </div>
            <p className="scroll-cue mt-14 hidden md:inline-flex">
              <i aria-hidden /> Scroll to watch a repair, start to finish
            </p>
          </div>
        </div>
      </section>

      {/* The repair, chapter by chapter */}
      <div aria-label="How a repair works, step by step">
        {steps.map((s, i) => {
          const time = STORY.find((x) => x.key === s.key)!.time;
          return (
            <section key={s.key} data-anchor={s.key} data-tone={s.tone} data-reveal className="step">
              <div className="wrap w-full">
                <div className="step-copy">
                  <p className="step-time rv">
                    <b>{time}</b>
                    <span>
                      Step {String(i + 1).padStart(2, "0")} of {steps.length}
                    </span>
                  </p>
                  <h2 className="step-title rv">{s.title}</h2>
                  <p className="step-body rv">{s.body}</p>
                  {s.readout && (
                    <ul className="readout rv">
                      {s.readout.map(([k, v, bad]) => (
                        <li key={k}>
                          <span>{k}</span>
                          <b className={bad ? "bad" : ""}>{v}</b>
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.quote && <QuoteCard />}
                  {s.counter && (
                    <p className="rv mt-7 flex items-baseline gap-3 font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
                      <span data-counter className="font-display text-[64px] leading-none font-semibold tracking-[-0.04em] text-brand normal-case">
                        0
                      </span>
                      of 32 checks passed
                    </p>
                  )}
                  {s.cta && (
                    <div className="rv mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link href="/book" className="btn-primary">Book a repair</Link>
                      <a href={whatsappLink()} className="btn-secondary">
                        <WhatsApp /> Ask a technician
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Your turn */}
      <section data-anchor="diagnose" data-reveal data-tone="fault" className="step py-24">
        <div className="wrap w-full">
          <div className="step-copy max-w-[480px]">
            <p className="step-time rv">
              <b>Your turn</b>
            </p>
            <h2 className="step-title rv">What&apos;s wrong with yours?</h2>
            <p className="step-body rv">Pick what you&apos;re seeing. We&apos;ll show you the part that usually causes it, the fix and the time.</p>
            <div className="rv mt-6">
              <Diagnose />
            </div>
          </div>
        </div>
      </section>

      {/* Renewed phones */}
      <section data-anchor="renewed" data-reveal className="step py-24" data-tone="done">
        <div className="wrap w-full">
          <div className="step-copy max-w-[470px]">
            <p className="step-time rv">
              <b>Or start fresh</b>
            </p>
            <h2 className="step-title rv">Renewed iPhones, opened up and certified like this one.</h2>
            <p className="step-body rv">
              Every phone we sell gets the same teardown, then 32 checks printed on its own certificate. 6-month warranty included.
              Trade in your old phone and the value comes off the price.
            </p>
            <ol className="rv mt-6 grid gap-x-6 gap-y-2.5 text-[14px] text-ink-2 sm:grid-cols-2">
              {RENEWED_POINTS.map((p, i) => (
                <li key={p} className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand font-mono text-[10px] font-semibold text-[#04140b]">{i + 1}</span>
                  {p}
                </li>
              ))}
            </ol>
            <div className="rv mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/renewed" className="btn-primary">See phones in stock</Link>
              <Link href="/renewed#checks" className="btn-secondary">All 32 checks <Arrow /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section data-anchor="promises" className="relative overflow-x-clip py-28 sm:py-36" aria-label="What we promise on every repair">
        <div className="space-y-3">
          <p className="promise pl-[6vw]" data-drift="1">
            Free check.<small>Whatever you decide</small>
          </p>
          <p className="promise pl-[18vw]" data-drift="-1">
            <span className="ghost">Price</span> in writing.
          </p>
          <p className="promise pl-[2vw]" data-drift="1">
            Parts named.<small>Original, or clearly labelled</small>
          </p>
          <p className="promise pl-[5vw]" data-drift="-1">
            Warranty on <span className="ghost">the invoice.</span>
          </p>
        </div>
      </section>

      <section data-anchor="visit">
        <Visit />
      </section>
    </>
  );
}
