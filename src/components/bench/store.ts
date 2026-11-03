// Shared, mutable state for the 3D bench. The DOM scroll controller writes the
// target scene state; the canvas eases toward it every frame. Kept outside React
// so 60fps updates never trigger re-renders.

export type Vec3 = [number, number, number];
export type Tier = "high" | "mid" | "low";

export const NUM_FIELDS = [
  "fov", "scale", "lamp", "screws", "heat", "picks", "open", "batt", "explode", "fault", "fixed",
  "swap", "seal", "scan", "diag", "glitch", "test", "boot", "labels", "hot", "certScan", "focus",
  "away", "viewX", "viewY",
] as const;
export const VEC_FIELDS = ["cam", "look", "pos", "rot"] as const;

export type NumField = (typeof NUM_FIELDS)[number];
export type VecField = (typeof VEC_FIELDS)[number];
export type SceneState = Record<NumField, number> & Record<VecField, Vec3>;

export function cloneState(s: SceneState): SceneState {
  const o = { ...s } as SceneState;
  for (const k of VEC_FIELDS) o[k] = [s[k][0], s[k][1], s[k][2]];
  return o;
}

export function blendInto(out: SceneState, a: SceneState, b: SceneState, t: number) {
  for (const k of NUM_FIELDS) out[k] = a[k] + (b[k] - a[k]) * t;
  for (const k of VEC_FIELDS) for (let i = 0; i < 3; i++) out[k][i] = a[k][i] + (b[k][i] - a[k][i]) * t;
  return out;
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Point the 3D phone at a part (used by the "What's wrong with yours?" chapter). */
export function setFocus(key: string) {
  bench.focusKey = key;
  window.dispatchEvent(new CustomEvent("bench:focus", { detail: key }));
}

export const bench = {
  target: null as SceneState | null,
  live: null as SceneState | null,
  focusKey: "screen",
  motion: true,
  sound: false,
  pointer: { x: 0, y: 0, active: false },
  // intro: the drop that cracks the glass
  crack: 0,
  introT: 0,
  impacted: false,
  introDone: false,
  fx: { rotY: 0, rotZ: 0, shake: 0 },
  wrapper: null as HTMLElement | null,
  setFrameloop: null as null | ((mode: "always" | "demand" | "never") => void),
  frameloop: "always" as "always" | "demand" | "never",
  /** Development only: force a scene key instead of following scroll. */
  debug: null as string | null,
};
