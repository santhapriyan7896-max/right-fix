// Bench sounds, synthesised in the browser (no audio files). Off by default;
// the visitor turns them on with the Sound toggle.

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;

export function soundOn() {
  if (!ctx) {
    ctx = new AudioContext();
    out = ctx.createGain();
    out.gain.value = 0.3;
    const comp = ctx.createDynamicsCompressor();
    out.connect(comp).connect(ctx.destination);
    const len = Math.floor(ctx.sampleRate * 1.2);
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  void ctx.resume();
}

export function soundOff() {
  void ctx?.suspend();
}

function envelope(g: GainNode, t0: number, attack: number, peak: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
}

function tone(freq: number, peak: number, attack: number, decay: number, type: OscillatorType = "sine", delay = 0, glideTo?: number) {
  if (!ctx || !out) return;
  const t0 = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + attack + decay);
  envelope(g, t0, attack, peak, decay);
  o.connect(g).connect(out);
  o.start(t0);
  o.stop(t0 + attack + decay + 0.05);
}

function hiss(freq: number, q: number, peak: number, attack: number, decay: number, type: BiquadFilterType = "bandpass", delay = 0, sweepTo?: number) {
  if (!ctx || !out || !noise) return;
  const t0 = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t0);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t0 + attack + decay);
  f.Q.value = q;
  const g = ctx.createGain();
  envelope(g, t0, attack, peak, decay);
  src.connect(f).connect(g).connect(out);
  src.start(t0);
  src.stop(t0 + attack + decay + 0.05);
}

export const sfx = {
  crack() {
    hiss(3400, 0.7, 0.9, 0.002, 0.22, "highpass");
    hiss(160, 0.7, 0.6, 0.004, 0.28, "lowpass");
    for (let i = 0; i < 7; i++) tone(2200 + Math.random() * 3200, 0.06, 0.001, 0.05, "square", 0.01 + i * 0.022);
  },
  screws() {
    for (let i = 0; i < 4; i++) tone(1500 + i * 140, 0.07, 0.001, 0.035, "square", i * 0.085);
  },
  whoosh() {
    hiss(500, 0.8, 0.22, 0.16, 0.45, "bandpass", 0, 2400);
  },
  pop() {
    tone(760, 0.16, 0.004, 0.12, "sine", 0, 1240);
  },
  message() {
    tone(1320, 0.11, 0.004, 0.12);
    tone(1760, 0.09, 0.004, 0.16, "sine", 0.09);
  },
  tick() {
    tone(1800, 0.1, 0.001, 0.04, "square");
    tone(2600, 0.05, 0.001, 0.03, "square", 0.07);
  },
  scan() {
    tone(420, 0.07, 0.06, 0.7, "sine", 0, 1260);
  },
  chime() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.12, 0.02, 1.7, "sine", i * 0.07));
  },
};

export type Sfx = keyof typeof sfx;

// Which sound plays as each chapter comes into view.
export const anchorSound: Record<string, Sfx> = {
  check: "scan",
  quote: "message",
  screws: "screws",
  heat: "whoosh",
  open: "whoosh",
  battery: "pop",
  explode: "whoosh",
  swap: "tick",
  test: "scan",
  ready: "chime",
  renewed: "scan",
};
