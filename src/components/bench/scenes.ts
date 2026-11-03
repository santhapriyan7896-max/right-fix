import type { SceneState, Vec3 } from "./store";

// Every scroll anchor on the homepage maps to one of these scene states.
// The canvas blends between neighbouring states as the visitor scrolls.
// Units: 1 = 10 mm. The bench surface is y = 0.

const PI = Math.PI;
const flat = (spin: number): Vec3 => [-PI / 2, 0, spin];

const HERO: SceneState = {
  cam: [0, 8.6, 42], look: [0, 7.6, 0], fov: 30,
  pos: [0, 7.6, 0], rot: [0.06, -0.4, 0.04], scale: 1,
  lamp: 0.35, screws: 0, heat: 0, picks: 0, open: 0, batt: 0, explode: 0, fault: 0, fixed: 0,
  swap: 0, seal: 0, scan: 0, diag: 0, glitch: 1, test: 0, boot: 0, labels: 0, hot: 0, certScan: 0,
  focus: 0, away: 0, viewX: 0.2, viewY: -0.035,
};

const st = (over: Partial<SceneState>, base: SceneState = HERO): SceneState => ({ ...base, ...over });

const ON_BENCH = st({ pos: [0, 0.37, 0], rot: flat(0.35), lamp: 1 });
const EXPLODED = st({ pos: [0, 5.6, 0], rot: flat(0.55), screws: 1, open: 1, batt: 1, explode: 1, labels: 1, viewX: 0.07 }, ON_BENCH);
const FIXED = st({ swap: 1, boot: 1, scan: 1, glitch: 0, lamp: 0.7 });

export const scenes: Record<string, SceneState> = {
  hero: HERO,
  arrive: st({ cam: [4, 21, 21], look: [0.3, 0, 0.8] }, ON_BENCH),
  check: st({ cam: [3.5, 20, 18.5], look: [0.4, 0, 0.6], diag: 1, fault: 1 }, ON_BENCH),
  quote: st({ cam: [-9, 19, 17], look: [0, 0, 0.4], fault: 1, viewX: 0.24 }, ON_BENCH),
  screws: st({ cam: [7.2, 3.4, 15.4], look: [2.5, 0.35, 6.85], fov: 27, screws: 1 }, ON_BENCH),
  heat: st({ cam: [6, 21, 19.5], look: [0.4, 0, 0.6], screws: 1, heat: 1, picks: 1 }, ON_BENCH),
  open: st({ cam: [0.5, 27, 21], look: [2.2, 1.2, 0.2], screws: 1, open: 1 }, ON_BENCH),
  battery: st({ cam: [8.2, 13, 8.5], look: [1.4, 0.5, -1.4], screws: 1, open: 1, batt: 1 }, ON_BENCH),
  explode: st({ cam: [-30, 22, 39], look: [1.8, 7.0, 0], fault: 1 }, EXPLODED),
  swap: st({ cam: [-26, 20, 42], look: [1.8, 7.0, 0], swap: 1, fixed: 1 }, EXPLODED),
  test: st({ cam: [4.5, 22, 20], look: [0.2, 0, 0.4], swap: 1, seal: 1, scan: 1, test: 1, fixed: 0.35, glitch: 0 }, ON_BENCH),
  ready: st({ rot: [0.05, -0.3, 0] }, FIXED),
  diagnose: st({ rot: [0.04, -0.62, 0.02], explode: 0.26, focus: 1 }, FIXED),
  renewed: st({ rot: [0.06, PI - 0.45, 0.02], hot: 1, certScan: 1, lamp: 0.6 }, FIXED),
  promises: st({ rot: [0.04, 2 * PI - 0.35, 0], away: 0.62, scale: 0.86, viewX: 0.3 }, FIXED),
  visit: st({ rot: [0.04, 2 * PI - 0.2, 0], away: 1, scale: 0.8 }, FIXED),
};

// The "What's wrong with yours?" chapter: one framing per symptom.
export const diagScenes: Record<string, SceneState> = {
  screen: scenes.diagnose,
  battery: st({ rot: [0.12, -1.0, 0.03], explode: 0.62, focus: 1 }, FIXED),
  charge: st({ rot: [-1.1, -0.15, 0], pos: [0, 8.6, 0], cam: [0, 3.6, 25], look: [0, 6.6, 0], focus: 1 }, FIXED),
  camera: st({ rot: [0.1, PI - 0.6, 0.02], focus: 1 }, FIXED),
  water: st({ rot: [0.12, -1.0, 0.03], explode: 0.62, focus: 1 }, FIXED),
  power: st({ rot: [0.12, -1.0, 0.03], explode: 0.62, focus: 1 }, FIXED),
  back: st({ rot: [0.06, PI - 0.3, 0.02], focus: 1 }, FIXED),
};

export function stateFor(key: string, focusKey: string): SceneState {
  if (key === "diagnose") return diagScenes[focusKey] ?? scenes.diagnose;
  return scenes[key] ?? HERO;
}

// The repair, timestamped. Times drive the bench clock in the corner.
export const STORY = [
  { key: "arrive", time: "09:02", label: "Arrival" },
  { key: "check", time: "09:05", label: "Free check" },
  { key: "quote", time: "09:20", label: "Quote" },
  { key: "screws", time: "09:24", label: "Screws" },
  { key: "heat", time: "09:27", label: "Heat" },
  { key: "open", time: "09:31", label: "Open" },
  { key: "battery", time: "09:33", label: "Battery off" },
  { key: "explode", time: "09:40", label: "Teardown" },
  { key: "swap", time: "10:05", label: "New parts" },
  { key: "test", time: "11:40", label: "32 checks" },
  { key: "ready", time: "12:15", label: "Ready" },
] as const;

export const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
