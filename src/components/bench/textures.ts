import * as THREE from "three";

// Every texture is drawn in code: no image downloads, crisp at any size.

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, x: c.getContext("2d")! };
}

function tex(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Font families come from next/font CSS variables on <html>.
export function fontVar(name: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Anti-static bench mat: 1 cm grid, 5 cm major lines, ruler ticks. One tile = 10 units. */
export function matTexture() {
  const S = 1024;
  const { c, x } = canvas(S, S);
  const r = rng(11);
  x.fillStyle = "#10151a";
  x.fillRect(0, 0, S, S);
  for (let i = 0; i < 16000; i++) {
    x.fillStyle = `rgba(200,220,240,${r() * 0.03})`;
    x.fillRect(r() * S, r() * S, 1.5, 1.5);
  }
  const step = S / 10;
  for (let i = 0; i <= 10; i++) {
    const p = Math.round(i * step) + 0.5;
    const major = i % 5 === 0;
    x.strokeStyle = major ? "rgba(150,185,215,0.2)" : "rgba(150,185,215,0.085)";
    x.lineWidth = major ? 2 : 1;
    x.beginPath();
    x.moveTo(p, 0);
    x.lineTo(p, S);
    x.moveTo(0, p);
    x.lineTo(S, p);
    x.stroke();
  }
  x.strokeStyle = "rgba(150,185,215,0.14)";
  x.lineWidth = 1;
  for (let i = 1; i < 100; i++) {
    if (i % 10 === 0) continue;
    const p = Math.round((i * step) / 10) + 0.5;
    const len = i % 5 === 0 ? 16 : 9;
    x.beginPath();
    x.moveTo(p, 0);
    x.lineTo(p, len);
    x.stroke();
  }
  x.fillStyle = "rgba(150,185,215,0.25)";
  x.font = "500 17px monospace";
  for (let i = 0; i < 10; i++) x.fillText(String(i), i * step + 6, 34);
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Logic board: solder mask, traces, vias, pads and silkscreen. */
export function boardTexture() {
  const S = 1024;
  const { c, x } = canvas(S, S);
  const r = rng(5);
  const g = x.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, "#0c3122");
  g.addColorStop(1, "#08241a");
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
  x.lineCap = "round";
  x.lineJoin = "round";
  for (let i = 0; i < 280; i++) {
    let px = Math.round(r() * 64) * 16;
    let py = Math.round(r() * 64) * 16;
    x.strokeStyle = `rgba(${70 + r() * 30},${150 + r() * 40},${100 + r() * 30},${0.22 + r() * 0.3})`;
    x.lineWidth = 1.5 + r() * 3;
    x.beginPath();
    x.moveTo(px, py);
    const segs = 2 + Math.floor(r() * 5);
    for (let k = 0; k < segs; k++) {
      const dir = Math.floor(r() * 8) * (Math.PI / 4);
      const len = 16 * (2 + Math.floor(r() * 9));
      px += Math.round(Math.cos(dir)) * len;
      py += Math.round(Math.sin(dir)) * len;
      x.lineTo(px, py);
    }
    x.stroke();
    x.fillStyle = "#c9a65e";
    x.beginPath();
    x.arc(px, py, 3 + r() * 2.5, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#0a2219";
    x.beginPath();
    x.arc(px, py, 1.4, 0, Math.PI * 2);
    x.fill();
  }
  for (let i = 0; i < 80; i++) {
    const px = r() * S;
    const py = r() * S;
    const n = 2 + Math.floor(r() * 6);
    x.fillStyle = "#cdb070";
    for (let k = 0; k < n; k++) x.fillRect(px + k * 9, py, 6, 10);
  }
  x.fillStyle = "rgba(235,240,235,0.78)";
  x.font = "600 20px monospace";
  ["U1000", "J4400 BATT", "FL1201", "C3802", "RFX-LB 820-02145", "L2300", "J6300 DISP", "BENCH 01"].forEach((t, i) =>
    x.fillText(t, 40 + (i % 3) * 330 + r() * 40, 90 + Math.floor(i / 3) * 330 + r() * 60),
  );
  for (const [fx, fy] of [[30, 30], [S - 30, S - 30], [S - 30, 30]]) {
    x.strokeStyle = "rgba(220,200,140,0.8)";
    x.lineWidth = 3;
    x.beginPath();
    x.arc(fx, fy, 10, 0, Math.PI * 2);
    x.stroke();
  }
  return tex(c);
}

/** Battery label. "old" is the worn battery that comes out; "new" goes in. */
export function batteryTexture(kind: "old" | "new") {
  const w = 1024;
  const h = 1100;
  const { c, x } = canvas(w, h);
  const sans = fontVar("--font-funnel-sans", "sans-serif");
  const mono = fontVar("--font-martian", "monospace");
  const bad = kind === "old";
  x.fillStyle = "#0e1013";
  x.fillRect(0, 0, w, h);
  x.strokeStyle = "rgba(255,255,255,0.07)";
  x.lineWidth = 4;
  x.strokeRect(26, 26, w - 52, h - 52);
  x.fillStyle = "#e9edf1";
  x.font = `600 56px ${sans}`;
  x.fillText("Li-ion Polymer Battery", 70, 150);
  x.fillStyle = "#8b949e";
  x.font = `500 32px ${mono}`;
  x.fillText("3.83V  2815mAh  10.78Wh", 70, 212);
  x.fillStyle = bad ? "#ff8a3d" : "#3ddc84";
  x.font = `700 270px ${sans}`;
  x.fillText(bad ? "71%" : "100%", 58, 530);
  x.fillStyle = "#c9d1d9";
  x.font = `500 36px ${mono}`;
  x.fillText(bad ? "HEALTH · 812 CYCLES" : "HEALTH · 0 CYCLES", 70, 610);
  x.fillStyle = "#6e7781";
  x.font = `400 27px ${sans}`;
  x.fillText("Do not puncture, crush or heat above 60°C.", 70, 700);
  x.fillText("Dispose of through an authorised recycler.", 70, 742);
  const r = rng(bad ? 3 : 4);
  let bx = 70;
  while (bx < 640) {
    const bw = 2 + Math.floor(r() * 6);
    x.fillStyle = "#d9dee3";
    x.fillRect(bx, 840, bw, 150);
    bx += bw + 2 + Math.floor(r() * 6);
  }
  x.fillStyle = bad ? "#6e7781" : "#3ddc84";
  x.font = `500 28px ${mono}`;
  x.fillText(bad ? "A2479 · WORN" : "RIGHTFIX · TESTED NEW", 70, 1046);
  return tex(c);
}

/** The impact point of the crack, in UV space (0..1, y up). */
export const CRACK_IMPACT: [number, number] = [0.74, 0.21];

type Pt = [number, number];
function pointAt(pts: Pt[], dist: number): Pt | null {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    const l = Math.hypot(dx, dy);
    if (acc + l >= dist) {
      const k = (dist - acc) / l;
      return [pts[i - 1][0] + dx * k, pts[i - 1][1] + dy * k];
    }
    acc += l;
  }
  return null;
}

/** Shattered glass: radial cracks with branches and ring fractures, clipped to the phone outline. */
export function crackTexture() {
  const w = 1024;
  const h = 2100;
  const { c, x } = canvas(w, h);
  const r = rng(42);
  x.save();
  x.beginPath();
  x.roundRect(0, 0, w, h, (1.0 / 7.15) * w);
  x.clip();
  const ix = CRACK_IMPACT[0] * w;
  const iy = (1 - CRACK_IMPACT[1]) * h;
  const rays: Pt[][] = [];
  const path = (pts: Pt[]) => {
    x.beginPath();
    x.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
  };
  const stroke = (pts: Pt[], width: number, alpha = 0.78) => {
    x.lineJoin = "miter";
    x.lineCap = "round";
    x.strokeStyle = "rgba(255,255,255,0.05)";
    x.lineWidth = width + 4;
    path(pts);
    x.stroke();
    x.strokeStyle = `rgba(255,255,255,${alpha})`;
    x.lineWidth = width;
    path(pts);
    x.stroke();
  };
  const walk = (sx: number, sy: number, ang: number, len: number, width: number, depth: number) => {
    const pts: Pt[] = [[sx, sy]];
    let px = sx;
    let py = sy;
    let a = ang;
    let d = 0;
    while (d < len) {
      // Glass fractures run in fairly straight segments with sharp kinks.
      const st = 22 + r() * 40;
      a += (r() - 0.5) * (r() < 0.2 ? 0.7 : 0.18);
      px += Math.cos(a) * st;
      py += Math.sin(a) * st;
      d += st;
      pts.push([px, py]);
      if (depth < 2 && r() < 0.045) walk(px, py, a + (r() < 0.5 ? -1 : 1) * (0.45 + r() * 0.5), len * (0.2 + r() * 0.25), width * 0.7, depth + 1);
      if (px < -60 || py < -60 || px > w + 60 || py > h + 60) break;
    }
    stroke(pts, width, depth ? 0.55 : 0.8);
    if (depth === 0) rays.push(pts);
  };
  const N = 11;
  for (let i = 0; i < N; i++) walk(ix, iy, (i / N) * Math.PI * 2 + (r() - 0.5) * 0.45, 380 + r() * 1300, 0.9 + r() * 0.9, 0);
  for (const R0 of [45, 95, 170]) {
    for (let i = 0; i < rays.length; i++) {
      if (r() > 0.6) continue;
      const a = pointAt(rays[i], R0);
      const b = pointAt(rays[(i + 1) % rays.length], R0 * (0.9 + r() * 0.2));
      if (!a || !b) continue;
      stroke([a, [(a[0] + b[0]) / 2 + (r() - 0.5) * 14, (a[1] + b[1]) / 2 + (r() - 0.5) * 14], b], 0.8 + r() * 0.5, 0.5);
    }
  }
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2;
    const d0 = r() * 26;
    const d1 = d0 + 6 + r() * 18;
    stroke([[ix + Math.cos(a) * d0, iy + Math.sin(a) * d0], [ix + Math.cos(a + 0.3) * d1, iy + Math.sin(a + 0.3) * d1]], 0.8 + r() * 0.6, 0.7);
  }
  const glint = x.createRadialGradient(ix, iy, 0, ix, iy, 26);
  glint.addColorStop(0, "rgba(255,255,255,0.55)");
  glint.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = glint;
  x.beginPath();
  x.arc(ix, iy, 26, 0, Math.PI * 2);
  x.fill();
  x.restore();
  return tex(c, false);
}

/** MagSafe charging coil: copper windings on a transparent background. */
export function coilTexture() {
  const S = 512;
  const { c, x } = canvas(S, S);
  const r = rng(9);
  const cx = S / 2;
  for (let rr = 0.4; rr < 0.97; rr += 0.0125) {
    x.strokeStyle = `rgb(${(190 + r() * 30) | 0},${(108 + r() * 25) | 0},${(52 + r() * 20) | 0})`;
    x.lineWidth = 3.2;
    x.beginPath();
    x.arc(cx, cx, rr * cx, 0, Math.PI * 2);
    x.stroke();
  }
  return tex(c);
}

/** Soft round sprite for dust in the lamp light. */
export function dotTexture() {
  const S = 64;
  const { c, x } = canvas(S, S);
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
  return tex(c);
}
