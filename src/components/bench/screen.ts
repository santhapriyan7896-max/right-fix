import * as THREE from "three";
import { checks } from "@/data/phones";
import { fontVar, rng } from "./textures";

// Draws what the phone's own display shows: lock screen, the broken display
// after the drop, the 32-point diagnostics run, and the "ready" screen.

const CW = 640;
const CH = 1340;
const ITEMS = checks.flatMap((g) => g.items);

export type ScreenMode = "lock" | "broken" | "off" | "test" | "ready";

export class ScreenPainter {
  readonly canvas: HTMLCanvasElement;
  readonly texture: THREE.CanvasTexture;
  private x: CanvasRenderingContext2D;
  private wall: HTMLCanvasElement;
  private sig = "";
  private sans = fontVar("--font-funnel-sans", "sans-serif");
  private disp = fontVar("--font-funnel-display", "sans-serif");
  private mono = fontVar("--font-martian", "monospace");
  private date = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  constructor(private tone: "night" | "dawn") {
    this.canvas = document.createElement("canvas");
    this.canvas.width = CW;
    this.canvas.height = CH;
    this.x = this.canvas.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    this.wall = this.makeWall();
  }

  private makeWall() {
    const c = document.createElement("canvas");
    c.width = CW;
    c.height = CH;
    const x = c.getContext("2d")!;
    const g = x.createLinearGradient(0, 0, 0, CH);
    if (this.tone === "night") {
      g.addColorStop(0, "#061a2b");
      g.addColorStop(0.55, "#0c3a4a");
      g.addColorStop(1, "#1c1410");
    } else {
      g.addColorStop(0, "#04150d");
      g.addColorStop(0.6, "#0c3324");
      g.addColorStop(1, "#0a0f0c");
    }
    x.fillStyle = g;
    x.fillRect(0, 0, CW, CH);
    const blob = (bx: number, by: number, br: number, col: string) => {
      const rg = x.createRadialGradient(bx, by, 0, bx, by, br);
      rg.addColorStop(0, col);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = rg;
      x.fillRect(0, 0, CW, CH);
    };
    if (this.tone === "night") {
      blob(520, 920, 540, "rgba(255,140,70,0.55)");
      blob(110, 420, 430, "rgba(40,170,200,0.35)");
    } else {
      blob(320, 760, 540, "rgba(61,220,132,0.32)");
      blob(560, 240, 380, "rgba(120,200,255,0.16)");
    }
    return c;
  }

  paint(mode: ScreenMode, p: number, t: number) {
    const q = mode === "broken" ? Math.floor(t * 12) + Math.round(p * 4) * 1000 : mode === "test" || mode === "ready" ? Math.round(p * 160) : 0;
    const sig = mode + ":" + q;
    if (sig === this.sig) return;
    this.sig = sig;
    const x = this.x;
    x.save();
    x.fillStyle = "#000";
    x.fillRect(0, 0, CW, CH);
    x.beginPath();
    x.roundRect(0, 0, CW, CH, 78);
    x.clip();
    if (mode === "lock") this.lock("8:58");
    else if (mode === "broken") this.broken(t, p);
    else if (mode === "test") this.test(p);
    else if (mode === "ready") this.ready(p);
    x.fillStyle = "#000";
    x.beginPath();
    x.roundRect(CW / 2 - 96, 26, 192, 56, 28);
    x.fill();
    x.restore();
    this.texture.needsUpdate = true;
  }

  private lock(time: string) {
    const x = this.x;
    x.drawImage(this.wall, 0, 0);
    x.fillStyle = "rgba(255,255,255,0.92)";
    x.textAlign = "center";
    x.font = `500 30px ${this.sans}`;
    x.fillText(this.date, CW / 2, 200);
    x.font = `300 196px ${this.disp}`;
    x.fillText(time, CW / 2, 380);
    x.fillStyle = "rgba(255,255,255,0.14)";
    for (const bx of [110, CW - 110]) {
      x.beginPath();
      x.arc(bx, CH - 150, 46, 0, Math.PI * 2);
      x.fill();
    }
    x.fillStyle = "rgba(255,255,255,0.75)";
    x.beginPath();
    x.roundRect(CW / 2 - 72, CH - 36, 144, 9, 5);
    x.fill();
    x.textAlign = "left";
  }

  private broken(t: number, g: number) {
    const x = this.x;
    const r = rng(Math.floor(t * 12) + 1);
    this.lock("8:58");
    x.fillStyle = "rgba(0,0,0,0.38)";
    x.fillRect(0, 0, CW, CH);
    // dead patch where the glass took the hit
    x.fillStyle = "#000";
    x.beginPath();
    x.moveTo(CW, CH * 0.6);
    for (let i = 0; i <= 10; i++) x.lineTo(CW * (0.56 + r() * 0.07) - i * 7, CH * (0.6 + i * 0.042));
    x.lineTo(CW, CH);
    x.closePath();
    x.fill();
    const bg = x.createRadialGradient(CW * 0.7, CH * 0.78, 10, CW * 0.7, CH * 0.78, 380);
    bg.addColorStop(0, "rgba(170,70,255,0.6)");
    bg.addColorStop(0.5, "rgba(60,20,120,0.35)");
    bg.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = bg;
    x.fillRect(0, 0, CW, CH);
    const lines: [number, string, number][] = [
      [0.21, "#18ff6d", 4],
      [0.235, "#ffffff", 2],
      [0.58, "#ff36d8", 5],
      [0.615, "#59b8ff", 3],
      [0.83, "#18ff6d", 2],
    ];
    for (const [fx, col, lw] of lines) {
      if (r() < 0.12 * g) continue;
      x.globalAlpha = 0.6 + r() * 0.4;
      x.fillStyle = col;
      x.fillRect(fx * CW + (r() - 0.5) * 2, 0, lw, CH * (0.55 + r() * 0.45));
    }
    x.globalAlpha = 1;
    for (let i = 0; i < 3; i++) {
      if (r() > 0.6 * g) continue;
      const y = r() * CH;
      const hh = 8 + r() * 40;
      x.drawImage(this.canvas, 0, y, CW, hh, (r() - 0.5) * 60, y, CW, hh);
    }
  }

  private test(p: number) {
    const x = this.x;
    x.fillStyle = "#020403";
    x.fillRect(0, 0, CW, CH);
    x.fillStyle = "#3ddc84";
    x.font = `600 24px ${this.mono}`;
    x.fillText("DIAGNOSTICS", 48, 150);
    x.fillStyle = "rgba(255,255,255,0.45)";
    x.font = `500 18px ${this.mono}`;
    x.fillText("RIGHTFIX · BENCH 01", 48, 184);
    const done = Math.min(32, Math.floor(p * 32.5));
    x.font = `500 18px ${this.sans}`;
    ITEMS.forEach((it, i) => {
      const col = i < 16 ? 0 : 1;
      const bx = 48 + col * 290;
      const by = 252 + (i % 16) * 56;
      const ok = i < done;
      const cur = i === done;
      const c = ok ? "#3ddc84" : cur ? "#ffffff" : "rgba(255,255,255,0.2)";
      x.fillStyle = c;
      x.strokeStyle = c;
      x.lineWidth = 2;
      x.beginPath();
      x.arc(bx + 9, by - 6, 8, 0, Math.PI * 2);
      if (ok) x.fill();
      else x.stroke();
      x.fillStyle = ok ? "rgba(255,255,255,0.86)" : cur ? "#fff" : "rgba(255,255,255,0.32)";
      x.fillText(it.length > 23 ? it.slice(0, 22) + "…" : it, bx + 28, by);
    });
    x.fillStyle = "rgba(255,255,255,0.12)";
    x.fillRect(48, CH - 150, CW - 96, 8);
    x.fillStyle = "#3ddc84";
    x.fillRect(48, CH - 150, (CW - 96) * Math.min(1, p), 8);
    x.fillStyle = "#fff";
    x.font = `600 46px ${this.disp}`;
    x.fillText(`${done}/32`, 48, CH - 182);
  }

  private ready(p: number) {
    const x = this.x;
    if (p < 0.4) {
      x.globalAlpha = Math.sin((p / 0.4) * Math.PI);
      this.logo();
      x.globalAlpha = 1;
      return;
    }
    x.globalAlpha = Math.min(1, (p - 0.4) / 0.4);
    x.drawImage(this.wall, 0, 0);
    x.textAlign = "center";
    x.fillStyle = "#fff";
    x.font = `500 30px ${this.sans}`;
    x.fillText(this.date, CW / 2, 200);
    x.font = `300 196px ${this.disp}`;
    x.fillText("12:15", CW / 2, 380);
    x.textAlign = "left";
    x.fillStyle = "rgba(8,22,14,0.62)";
    x.beginPath();
    x.roundRect(44, 830, CW - 88, 214, 40);
    x.fill();
    x.fillStyle = "#3ddc84";
    x.beginPath();
    x.arc(116, 908, 34, 0, Math.PI * 2);
    x.fill();
    x.strokeStyle = "#04140b";
    x.lineWidth = 7;
    x.lineCap = "round";
    x.lineJoin = "round";
    x.beginPath();
    x.moveTo(100, 908);
    x.lineTo(112, 921);
    x.lineTo(134, 895);
    x.stroke();
    x.fillStyle = "#fff";
    x.font = `600 34px ${this.sans}`;
    x.fillText("Ready for pickup", 172, 900);
    x.fillStyle = "rgba(255,255,255,0.72)";
    x.font = `500 25px ${this.sans}`;
    x.fillText("32 of 32 checks passed", 172, 940);
    x.fillStyle = "rgba(255,255,255,0.45)";
    x.font = `500 18px ${this.mono}`;
    x.fillText("RIGHTFIX LABS · VELACHERY", 72, 1010);
    x.globalAlpha = 1;
  }

  private logo() {
    const x = this.x;
    x.fillStyle = "#3ddc84";
    x.beginPath();
    x.roundRect(CW / 2 - 70, CH / 2 - 70, 140, 140, 36);
    x.fill();
    x.strokeStyle = "#04140b";
    x.lineWidth = 14;
    x.lineCap = "round";
    x.lineJoin = "round";
    x.beginPath();
    x.moveTo(CW / 2 - 34, CH / 2 + 2);
    x.lineTo(CW / 2 - 8, CH / 2 + 28);
    x.lineTo(CW / 2 + 38, CH / 2 - 26);
    x.stroke();
  }
}
