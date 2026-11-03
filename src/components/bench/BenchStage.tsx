"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import Lenis from "lenis";
import { bench, blendInto, cloneState, smoothstep, type Tier } from "./store";
import { scenes, stateFor, STORY, toMinutes } from "./scenes";
import { anchorSound, sfx, soundOff, soundOn } from "./audio";
import "./bench.css";

const BenchCanvas = dynamic(() => import("./Scene"), { ssr: false });

const STORY_INDEX: Record<string, number> = Object.fromEntries(STORY.map((s, i) => [s.key, i]));

// ---- motion preference (OS setting, overridable with the on-page toggle) ----
const motionListeners = new Set<() => void>();
let motionOverride: boolean | null = null;
function readMotion() {
  if (motionOverride !== null) return motionOverride;
  try {
    const v = localStorage.getItem("rf-motion");
    if (v) return v === "on";
  } catch {}
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function setMotionPref(on: boolean) {
  motionOverride = on;
  try {
    localStorage.setItem("rf-motion", on ? "on" : "off");
  } catch {}
  motionListeners.forEach((l) => l());
}
const subscribeMotion = (cb: () => void) => {
  motionListeners.add(cb);
  return () => motionListeners.delete(cb);
};

function detectTier(): Tier {
  // Phones and tablets always get the light version: their GPUs throttle
  // quickly under post-processing, even when the CPU core count looks high.
  const cores = navigator.hardwareConcurrency ?? 4;
  const touch = window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(max-width: 1023px)").matches;
  if (touch) return "low";
  return cores >= 8 ? "high" : "mid";
}

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

class CanvasBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

export function BenchStage({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const stepLabel = useRef<HTMLSpanElement>(null);
  const segs = useRef<(HTMLElement | null)[]>([]);
  const lenis = useRef<Lenis | null>(null);

  const [gl, setGl] = useState<{ tier: Tier } | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [sound, setSound] = useState(false);
  const motion = useSyncExternalStore(subscribeMotion, () => readMotion(), () => true);

  // Load the 3D bench once fonts are in (the phone's screen uses them).
  useEffect(() => {
    let alive = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!alive) return;
      if (webglOK()) setGl({ tier: detectTier() });
      else setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Motion on/off: smooth scrolling, transitions and camera easing follow it.
  useEffect(() => {
    bench.motion = motion;
    document.documentElement.dataset.motion = motion ? "on" : "off";
    if (motion && !lenis.current) lenis.current = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: true });
    if (!motion && lenis.current) {
      lenis.current.destroy();
      lenis.current = null;
    }
  }, [motion]);

  useEffect(
    () => () => {
      lenis.current?.destroy();
      lenis.current = null;
    },
    [],
  );

  // Scroll controller: maps the page position to a scene state every frame.
  useEffect(() => {
    bench.wrapper = wrapper.current;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __bench: typeof bench }).__bench = bench;
    type Anchor = { key: string; center: number };
    let anchors: Anchor[] = [];
    const measure = () => {
      anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-anchor]"))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { key: el.dataset.anchor!, center: r.top + window.scrollY + r.height / 2 };
        })
        .sort((a, b) => a.center - b.center);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    document.fonts?.ready.then(measure);

    const tmp = cloneState(scenes.hero);
    const drifters = Array.from(document.querySelectorAll<HTMLElement>("[data-drift]"));
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-counter]"));
    let lastNear = "";
    let lastHud = "";
    let raf = 0;

    const tick = (time: number) => {
      lenis.current?.raf(time);
      const vh = window.innerHeight;
      const c = window.scrollY + vh * 0.5;
      if (anchors.length) {
        let i = 0;
        while (i < anchors.length - 1 && anchors[i + 1].center <= c) i++;
        const a = anchors[i];
        const b = anchors[Math.min(i + 1, anchors.length - 1)];
        const raw = b === a || c <= a.center ? 0 : Math.min(1, (c - a.center) / (b.center - a.center));
        const tt = bench.motion ? smoothstep(0.12, 0.88, raw) : raw < 0.5 ? 0 : 1;
        if (bench.debug) {
          const d = stateFor(bench.debug, bench.focusKey);
          blendInto(tmp, d, d, 0);
        } else blendInto(tmp, stateFor(a.key, bench.focusKey), stateFor(b.key, bench.focusKey), tt);
        bench.target = tmp;

        // Bench clock and procedure progress.
        const si = STORY_INDEX[a.key];
        const sj = STORY_INDEX[b.key];
        let op = 0;
        let pos = 0;
        if (si !== undefined && sj !== undefined) {
          op = 1;
          pos = si + raw * (sj - si);
        } else if (si !== undefined) {
          op = 1 - smoothstep(0.1, 0.45, raw);
          pos = si;
        } else if (sj !== undefined) {
          op = smoothstep(0.55, 0.9, raw);
          pos = sj;
        }
        const i0 = Math.floor(pos);
        const i1 = Math.min(STORY.length - 1, i0 + 1);
        const mins = Math.round(toMinutes(STORY[i0].time) + (toMinutes(STORY[i1].time) - toMinutes(STORY[i0].time)) * (pos - i0));
        const cur = Math.round(pos);
        const sig = `${op.toFixed(2)}|${mins}|${cur}`;
        if (sig !== lastHud) {
          lastHud = sig;
          if (hud.current) hud.current.style.opacity = op.toFixed(2);
          if (clock.current) clock.current.textContent = `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
          if (stepLabel.current) stepLabel.current.textContent = `${pad(cur + 1)}/${STORY.length} · ${STORY[cur].label}`;
          segs.current.forEach((s, k) => {
            if (!s) return;
            s.classList.toggle("on", k < cur);
            s.classList.toggle("cur", k === cur);
          });
        }

        counters.forEach((el) => {
          const n = String(Math.round(32 * Math.min(1, Math.max(0, tmp.scan))));
          if (el.textContent !== n) el.textContent = n;
        });

        const near = raw < 0.5 ? a : b;
        if (near.key !== lastNear) {
          if (lastNear && bench.sound && anchorSound[near.key]) sfx[anchorSound[near.key]]();
          lastNear = near.key;
        }

        // Sleep the canvas once it has faded out at the bottom of the page.
        const asleep = tmp.away > 0.995 && (bench.live?.away ?? 0) > 0.99;
        const want = asleep ? "demand" : "always";
        if (bench.setFrameloop && !bench.capped && bench.frameloop !== want) {
          bench.setFrameloop(want);
          bench.frameloop = want;
        }
      }

      for (const el of drifters) {
        if (!bench.motion) {
          el.style.transform = "";
          continue;
        }
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const p = (vh - r.top) / (vh + r.height);
        el.style.transform = `translate3d(${((p - 0.5) * Number(el.dataset.drift) * 18).toFixed(2)}vw,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Reveal chapters as they arrive.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && ((e.target as HTMLElement).dataset.in = "")),
      { rootMargin: "0px 0px -15% 0px", threshold: 0.15 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    document.documentElement.dataset.reveal = "on";

    const onImpact = () => {
      document.querySelector("[data-crack-title]")?.classList.add("is-cracked");
      if (bench.sound) sfx.crack();
    };
    const onFocus = () => bench.sound && sfx.pop();
    const onMove = (e: PointerEvent) => {
      bench.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      bench.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      bench.pointer.active = e.pointerType === "mouse";
    };
    const onLeave = () => (bench.pointer.active = false);
    window.addEventListener("bench:impact", onImpact);
    window.addEventListener("bench:focus", onFocus);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("bench:impact", onImpact);
      window.removeEventListener("bench:focus", onFocus);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      bench.wrapper = null;
    };
  }, []);

  const toggleSound = () => {
    const on = !sound;
    setSound(on);
    bench.sound = on;
    if (on) {
      soundOn();
      sfx.tick();
    } else soundOff();
  };

  return (
    <>
      <div className={`bench-canvas ${ready ? "is-ready" : ""}`} aria-hidden>
        <div ref={wrapper} className="bench-canvas-inner">
          {gl && !failed && (
            <CanvasBoundary onError={() => setFailed(true)}>
              <BenchCanvas tier={gl.tier} portal={overlay as RefObject<HTMLElement>} onReady={() => setReady(true)} />
            </CanvasBoundary>
          )}
        </div>
      </div>
      {failed && <div className="bench-fallback" aria-hidden />}
      <div ref={overlay} className="bench-overlay" aria-hidden />

      <div ref={hud} className="bench-hud" aria-hidden>
        <p className="hud-row">
          <span>Bench 01</span>
          <span>Velachery</span>
        </p>
        <span ref={clock} className="hud-clock">
          09:02
        </span>
        <div className="hud-steps">
          {STORY.map((s, i) => (
            <i key={s.key} ref={(el) => { segs.current[i] = el; }} />
          ))}
        </div>
        <span ref={stepLabel} className="hud-label">
          01/{STORY.length} · Arrival
        </span>
      </div>

      <div className="bench-toggles">
        <button type="button" onClick={toggleSound} aria-pressed={sound} title={sound ? "Turn sound off" : "Turn sound on"}>
          <span className="dot" aria-hidden />
          <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
            {sound ? <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /> : <path d="m16 9.5 5 5m0-5-5 5" />}
          </svg>
          <span className="lbl">Sound {sound ? "on" : "off"}</span>
        </button>
        <button type="button" onClick={() => setMotionPref(!motion)} aria-pressed={motion} title={motion ? "Turn motion off" : "Turn motion on"}>
          <span className="dot" aria-hidden />
          <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="14" cy="12" r="5" />
            {motion ? <path d="M3 9h4M2 12h5M3 15h4" /> : <path d="m4 4 16 16" />}
          </svg>
          <span className="lbl">Motion {motion ? "on" : "off"}</span>
        </button>
      </div>

      <div className="relative z-10">{children}</div>
    </>
  );
}
