"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode, type Ref, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { bench, type Tier } from "./store";
import { W, H, R, LAYER, rrShape, rrRing, extrude, roundedPoly, remapUV } from "./geo";
import { batteryTexture, boardTexture, coilTexture, crackTexture, CRACK_IMPACT, rng } from "./textures";
import { ScreenPainter } from "./screen";

// A phone built part by part, so it can be opened, taken apart and repaired.
// Local axes: x across, y up the phone, z out of the screen. 1 unit = 10 mm.

const AMBER = new THREE.Color("#ff8a3d");
const GREEN = new THREE.Color("#3ddc84");
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const LENSES: [number, number][] = [[2.42, 6.16], [2.42, 4.92]];
const BUMP: [number, number] = [1.82, 5.54];
const BOARD_PARTS: { shield?: boolean; p: [number, number]; s: [number, number, number] }[] = [
  { p: [-1.75, 5.3], s: [1.45, 1.45, 0.1] },
  { p: [-0.35, 5.35], s: [0.95, 1.35, 0.09] },
  { shield: true, p: [-1.85, 2.55], s: [2.3, 2.3, 0.12] },
  { shield: true, p: [1.85, 2.65], s: [2.4, 1.6, 0.12] },
  { p: [-0.3, 3.4], s: [0.8, 0.8, 0.08] },
  { p: [-2.6, 4.3], s: [0.6, 0.9, 0.07] },
  { p: [2.85, 3.62], s: [0.36, 0.5, 0.08] },
  { p: [-0.9, 6.55], s: [1.2, 0.3, 0.06] },
];
const PICKS = [
  { edge: [-W / 2, 2.0] as const, dir: [1, 0] as const, rot: 0 },
  { edge: [1.6, -H / 2] as const, dir: [0, 1] as const, rot: Math.PI / 2 },
  { edge: [-1.2, H / 2] as const, dir: [0, -1] as const, rot: -Math.PI / 2 },
];
const HOTSPOTS: { p: [number, number, number]; tip: string }[] = [
  { p: [2.42, 6.9, -0.62], tip: "Cameras, focus and flash" },
  { p: [0, -0.3, -0.42], tip: "MagSafe and wireless charging" },
  { p: [-1.3, -3.8, -0.42], tip: "Battery health, measured" },
  { p: [-W / 2 - 0.1, -1.6, 0], tip: "SIM, network, IMEI clean" },
  { p: [W / 2 + 0.12, 2.6, 0], tip: "Buttons and sensors" },
  { p: [-1.6, -H / 2 - 0.12, 0], tip: "Speakers and microphones" },
  { p: [0.5, -H / 2 - 0.12, 0], tip: "Charging port" },
];

// DOM labels drawn by <Html>. One phone per page, so a module registry is enough.
const labelEls: Record<string, HTMLDivElement | null> = {};
const hotEls: (HTMLSpanElement | null)[] = [];
const lbl = (k: string) => (el: HTMLDivElement | null) => {
  labelEls[k] = el;
};

function glow(c: string, k = 2.4) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(c).multiplyScalar(k),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
}

function crackMaterial(map: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      uProgress: { value: 0 },
      uImpact: { value: new THREE.Vector2(CRACK_IMPACT[0], CRACK_IMPACT[1]) },
      uAspect: { value: H / W },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D map; uniform float uProgress; uniform vec2 uImpact; uniform float uAspect;
      varying vec2 vUv;
      void main() {
        vec4 t = texture2D(map, vUv);
        float d = length((vUv - uImpact) * vec2(1.0, uAspect));
        float r = uProgress * 2.4;
        float a = t.a * (1.0 - smoothstep(r - 0.12, r, d));
        if (a < 0.01) discard;
        gl_FragColor = vec4(vec3(1.3), a * 0.9);
      }`,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
}

function useKit(tier: Tier) {
  return useMemo(() => {
    const glassBase = {
      color: "#000000",
      roughness: 0.035,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    } as const;
    const foilBase = { color: "#15171a", roughness: 0.32, metalness: 0.6, clearcoat: 0.6 } as const;
    const m = {
      frame: new THREE.MeshPhysicalMaterial({ color: "#7193b0", metalness: 1, roughness: 0.24, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
      button: new THREE.MeshPhysicalMaterial({ color: "#86a6c0", metalness: 1, roughness: 0.2 }),
      backGlass: new THREE.MeshPhysicalMaterial({ color: "#3a6286", roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.28, sheen: 0.4, sheenColor: new THREE.Color("#9cc4e6"), sheenRoughness: 0.5 }),
      bumpGlass: new THREE.MeshPhysicalMaterial({ color: "#2f5574", roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }),
      lensRing: new THREE.MeshPhysicalMaterial({ color: "#7896b0", metalness: 1, roughness: 0.18 }),
      lensGlass: new THREE.MeshPhysicalMaterial({
        color: "#030406",
        roughness: 0.03,
        metalness: 0.1,
        clearcoat: 1,
        iridescence: 1,
        iridescenceIOR: 1.35,
        iridescenceThicknessRange: [180, 520],
      }),
      flash: new THREE.MeshStandardMaterial({ color: "#efe3c7", roughness: 0.35 }),
      midplate: new THREE.MeshStandardMaterial({ color: "#272c33", metalness: 0.85, roughness: 0.5 }),
      dark: new THREE.MeshStandardMaterial({ color: "#0d0f12", roughness: 0.6, metalness: 0.15 }),
      antenna: new THREE.MeshStandardMaterial({ color: "#56636e", roughness: 0.45 }),
      screw: new THREE.MeshStandardMaterial({ color: "#aab0b8", metalness: 1, roughness: 0.25 }),
      board: new THREE.MeshStandardMaterial({ map: boardTexture(), roughness: 0.5, metalness: 0.1 }),
      boardEdge: new THREE.MeshStandardMaterial({ color: "#0b2a1d", roughness: 0.6 }),
      chip: new THREE.MeshStandardMaterial({ color: "#15181c", roughness: 0.32, metalness: 0.35 }),
      shield: new THREE.MeshPhysicalMaterial({ color: "#c3c8cf", metalness: 1, roughness: 0.3, anisotropy: 0.8 }),
      smd: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5, metalness: 0.2 }),
      flex: new THREE.MeshPhysicalMaterial({ color: "#c47a2c", roughness: 0.42, metalness: 0.15, sheen: 0.6, sheenColor: new THREE.Color("#ffb36b") }),
      foilOld: new THREE.MeshPhysicalMaterial(foilBase),
      foilNew: new THREE.MeshPhysicalMaterial(foilBase),
      labelOld: new THREE.MeshStandardMaterial({ map: batteryTexture("old"), roughness: 0.55 }),
      labelNew: new THREE.MeshStandardMaterial({ map: batteryTexture("new"), roughness: 0.55 }),
      tab: new THREE.MeshStandardMaterial({ color: "#050506", roughness: 0.7 }),
      oled: new THREE.MeshStandardMaterial({ color: "#07080a", roughness: 0.55, metalness: 0.3 }),
      bezel: new THREE.MeshBasicMaterial({ color: "#020203" }),
      glassOld: new THREE.MeshPhysicalMaterial(glassBase),
      glassNew: new THREE.MeshPhysicalMaterial(glassBase),
      coil: new THREE.MeshStandardMaterial({ map: coilTexture(), alphaTest: 0.35, metalness: 0.85, roughness: 0.32 }),
      magnet: new THREE.MeshStandardMaterial({ color: "#2c2f34", metalness: 0.7, roughness: 0.45 }),
      film: new THREE.MeshStandardMaterial({ color: "#0a0b0d", roughness: 0.45, transparent: true, opacity: 0.9 }),
      taptic: new THREE.MeshStandardMaterial({ color: "#8d949c", metalness: 1, roughness: 0.38 }),
      pick: new THREE.MeshPhysicalMaterial({ color: "#5aa8ff", roughness: 0.25, transparent: true, opacity: 0.88 }),
      heat: glow("#ff6a1a", 2.6),
      seal: glow("#d8f3ff", 1.8),
      fault: glow("#ff8a3d", 2.6),
      fixed: glow("#3ddc84", 2.4),
      focus: glow("#ff8a3d", 2.6),
      port: glow("#ff8a3d", 3),
      scan: glow("#3ddc84", 3),
      scanBand: glow("#3ddc84", 1.2),
      diag: glow("#9fdcff", 2.4),
      cert: glow("#3ddc84", 2.6),
    };

    const boardShape = roundedPoly(
      [[-3.25, 0.95], [3.25, 0.95], [3.25, 3.95], [0.45, 3.95], [0.45, 6.95], [-3.25, 6.95]],
      [0.25, 0.25, 0.25, 0.2, 0.25, 0.75],
    );
    const pickShape = new THREE.Shape();
    pickShape.moveTo(0, 0);
    pickShape.lineTo(-1.25, 0.62);
    pickShape.quadraticCurveTo(-1.6, 0, -1.25, -0.62);
    pickShape.lineTo(0, 0);

    const g = {
      band: extrude(rrRing(W, H, R, 0.11), 0.62, 0.02, 4),
      back: extrude(rrShape(W - 0.02, H - 0.02, R - 0.01), 0.05, 0.012),
      bump: extrude(rrShape(2.9, 2.9, 0.78), 0.1, 0.03, 4),
      mid: extrude(rrShape(W - 0.24, H - 0.24, R - 0.12), 0.04, 0),
      oled: extrude(rrShape(W - 0.06, H - 0.06, R - 0.03), 0.035, 0.008),
      glass: extrude(rrShape(W - 0.02, H - 0.02, R - 0.01), 0.03, 0.012, 4),
      bezel: new THREE.ShapeGeometry(rrRing(W - 0.05, H - 0.05, R - 0.025, 0.21), 24),
      screen: new THREE.PlaneGeometry(W - 0.42, H - 0.42),
      crack: new THREE.PlaneGeometry(W - 0.04, H - 0.04),
      rim: new THREE.ShapeGeometry(rrRing(W + 0.2, H + 0.2, R + 0.1, 0.09), 32),
      board: extrude(boardShape, 0.07, 0.008),
      boardTop: remapUV(new THREE.ShapeGeometry(boardShape, 16)),
      battery: new RoundedBoxGeometry(6.0, 6.45, 0.34, 4, 0.12),
      label: new THREE.PlaneGeometry(5.5, 5.95),
      box: new THREE.BoxGeometry(1, 1, 1),
      lensRing: new THREE.CylinderGeometry(0.5, 0.5, 0.12, 48),
      lensBarrel: new THREE.CylinderGeometry(0.42, 0.42, 0.36, 40),
      disc: new THREE.CircleGeometry(1, 48),
      screwShaft: new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16),
      screwHead: new THREE.CylinderGeometry(0.085, 0.085, 0.05, 20),
      pick: extrude(pickShape, 0.03, 0.006),
      scan: new THREE.PlaneGeometry(W + 0.6, 0.07),
      scanBand: new THREE.PlaneGeometry(W + 0.6, 1.4),
      portRim: new THREE.ShapeGeometry(rrRing(1.3, 0.62, 0.3, 0.08), 16),
      magnet: new THREE.BoxGeometry(0.46, 0.12, 0.05),
    };

    // Hundreds of tiny surface-mount parts scattered across the logic board.
    const smdCount = tier === "low" ? 90 : 260;
    const smd = new THREE.InstancedMesh(g.box, m.smd, smdCount);
    const avoid = BOARD_PARTS.map((p) => [p.p[0], p.p[1], p.s[0] / 2 + 0.08, p.s[1] / 2 + 0.08]).concat([[2.3, 1.3, 0.62, 0.45]]);
    const inBoard = (x: number, y: number) => (x > -3.05 && x < 0.3 && y > 1.1 && y < 6.75) || (x > 0.3 && x < 3.05 && y > 1.1 && y < 3.8);
    const r = rng(21);
    const M = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const zAxis = new THREE.Vector3(0, 0, 1);
    const col = new THREE.Color();
    let placed = 0;
    for (let tries = 0; placed < smdCount && tries < 6000; tries++) {
      const x = -3.05 + r() * 6.1;
      const y = 1.1 + r() * 5.65;
      if (!inBoard(x, y) || avoid.some(([ax, ay, hw, hh]) => Math.abs(x - ax) < hw && Math.abs(y - ay) < hh)) continue;
      const big = r() < 0.15;
      const sx = big ? 0.22 : 0.08 + r() * 0.08;
      const sy = big ? 0.14 : 0.04 + r() * 0.04;
      const sz = 0.035 + r() * 0.02;
      q.setFromAxisAngle(zAxis, r() < 0.5 ? 0 : Math.PI / 2);
      M.compose(new THREE.Vector3(x, y, 0.024 + sz / 2), q, new THREE.Vector3(sx, sy, sz));
      smd.setMatrixAt(placed, M);
      smd.setColorAt(placed, col.set(r() < 0.55 ? "#c8b48a" : r() < 0.7 ? "#202226" : "#9aa1aa"));
      placed++;
    }
    smd.count = placed;
    smd.instanceMatrix.needsUpdate = true;
    if (smd.instanceColor) smd.instanceColor.needsUpdate = true;

    // MagSafe magnet ring.
    const magnets = new THREE.InstancedMesh(g.magnet, m.magnet, 18);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      q.setFromAxisAngle(zAxis, a + Math.PI / 2);
      M.compose(new THREE.Vector3(Math.cos(a) * 2.32, Math.sin(a) * 2.32, 0.01), q, new THREE.Vector3(1, 1, 1));
      magnets.setMatrixAt(i, M);
    }
    magnets.instanceMatrix.needsUpdate = true;

    return { m, g, smd, magnets };
  }, [tier]);
}

type Kit = ReturnType<typeof useKit>;

function Label({ portal, n, name, status, tone, labelRef, y = -4.6 }: {
  portal: RefObject<HTMLElement>;
  n: string;
  name: string;
  status: string;
  tone: "bad" | "ok" | "fine";
  labelRef: (el: HTMLDivElement | null) => void;
  y?: number;
}) {
  return (
    <Html position={[W / 2 - 1.1, y, 0]} portal={portal} zIndexRange={[24, 21]} style={{ pointerEvents: "none" }}>
      <div ref={labelRef} className="bench-label" style={{ opacity: 0 }}>
        <span className="n">{n}</span>
        <b>{name}</b>
        <span className={`st ${tone}`}>{status}</span>
      </div>
    </Html>
  );
}

function Display({ kit, screen, glass, children }: { kit: Kit; screen: THREE.Material; glass: THREE.Material; children?: ReactNode }) {
  const { g, m } = kit;
  return (
    <>
      <mesh geometry={g.oled} material={m.oled} position-z={0.0085} />
      <mesh geometry={g.screen} material={screen} position-z={0.0362} />
      <mesh geometry={g.bezel} material={m.bezel} position-z={0.0368} />
      <mesh geometry={g.glass} material={glass} position-z={0.052} renderOrder={2} />
      {[2.0, 3.0].map((y) => (
        <mesh key={y} geometry={g.box} material={m.flex} position={[W / 2 - 0.42, y, -0.012]} scale={[0.5, 0.75, 0.02]} />
      ))}
      {children}
    </>
  );
}

function Battery({ kit, foil, label, groupRef, connRef, children }: {
  kit: Kit;
  foil: THREE.Material;
  label: THREE.Material;
  groupRef: Ref<THREE.Group>;
  connRef: Ref<THREE.Group>;
  children?: ReactNode;
}) {
  const { g, m } = kit;
  return (
    <group ref={groupRef}>
      <mesh geometry={g.battery} material={foil} position={[-0.05, -2.475, -0.03]} />
      <mesh geometry={g.label} material={label} position={[-0.05, -2.475, 0.1415]} />
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} geometry={g.box} material={m.tab} position={[x, -5.95, 0.1]} scale={[0.7, 0.55, 0.012]} />
      ))}
      <mesh geometry={g.box} material={m.flex} position={[2.3, 0.92, 0.125]} scale={[0.55, 0.6, 0.02]} />
      <group ref={connRef} position={[2.3, 1.12, 0.135]}>
        <mesh geometry={g.box} material={m.chip} position={[0, 0.17, 0.035]} scale={[0.62, 0.34, 0.07]} />
      </group>
      {children}
    </group>
  );
}

export function Phone({ tier, portal }: { tier: Tier; portal: RefObject<HTMLElement> }) {
  const kit = useKit(tier);
  const { g, m } = kit;
  const painterOld = useMemo(() => new ScreenPainter("night"), []);
  const painterNew = useMemo(() => new ScreenPainter("dawn"), []);
  const screenOld = useMemo(
    () => new THREE.MeshBasicMaterial({ map: painterOld.texture, toneMapped: false, color: new THREE.Color(1.25, 1.25, 1.25) }),
    [painterOld],
  );
  const screenNew = useMemo(
    () => new THREE.MeshBasicMaterial({ map: painterNew.texture, toneMapped: false, color: new THREE.Color(1.3, 1.3, 1.3) }),
    [painterNew],
  );
  const crack = useMemo(() => crackMaterial(crackTexture()), []);

  const root = useRef<THREE.Group>(null!);
  const back = useRef<THREE.Group>(null!);
  const mag = useRef<THREE.Group>(null!);
  const frame = useRef<THREE.Group>(null!);
  const cams = useRef<THREE.Group>(null!);
  const board = useRef<THREE.Group>(null!);
  const batOld = useRef<THREE.Group>(null!);
  const batNew = useRef<THREE.Group>(null!);
  const connOld = useRef<THREE.Group>(null!);
  const connNew = useRef<THREE.Group>(null!);
  const bracket = useRef<THREE.Group>(null!);
  const bScrews = useRef<(THREE.Group | null)[]>([]);
  const screws = useRef<(THREE.Group | null)[]>([]);
  const hinge = useRef<THREE.Group>(null!);
  const dispOld = useRef<THREE.Group>(null!);
  const dispNew = useRef<THREE.Group>(null!);
  const picks = useRef<(THREE.Group | null)[]>([]);
  const scan = useRef<THREE.Group>(null!);
  const diag = useRef<THREE.Mesh>(null!);
  const cert = useRef<THREE.Mesh>(null!);
  useEffect(() => {
    root.current.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.Material;
      mesh.castShadow = tier === "high" && !mat.transparent && mat.blending !== THREE.AdditiveBlending;
    });
  }, [tier]);

  useFrame((state) => {
    const s = bench.live;
    if (!s) return;
    const t = state.clock.elapsedTime;
    const E = s.explode;
    const sw = ease(clamp01(s.swap));

    root.current.position.set(s.pos[0], s.pos[1], s.pos[2]);
    root.current.rotation.set(s.rot[0], s.rot[1] + bench.fx.rotY, s.rot[2] + bench.fx.rotZ);
    root.current.scale.setScalar(s.scale);

    // Layers spread along the phone's depth when exploded.
    back.current.position.z = -2 * LAYER * E;
    mag.current.position.z = -1 * LAYER * E;
    cams.current.position.z = 1.35 * LAYER * E;
    board.current.position.z = 2 * LAYER * E;
    batOld.current.position.set(18 * sw, 0, LAYER * E);
    batNew.current.position.set(-18 * (1 - sw), 0, LAYER * E);
    batOld.current.visible = sw < 0.995;
    batNew.current.visible = sw > 0.005;

    // Display assembly opens like a book on its right edge, then lifts away.
    hinge.current.position.z = 0.31 + 3 * LAYER * E;
    hinge.current.rotation.y = s.open * (1 - E) * 1.68;
    dispOld.current.position.x = -W / 2 + 18 * sw;
    dispNew.current.position.x = -W / 2 - 18 * (1 - sw);
    dispOld.current.visible = sw < 0.995;
    dispNew.current.visible = sw > 0.005;

    // Battery connector: bracket off, connector flipped up.
    const b = s.batt;
    bracket.current.position.set(2.3 + 0.6 * b, 1.3, 0.225 + 0.9 * b);
    bracket.current.rotation.z = -0.35 * b;
    bScrews.current.forEach((sc) => {
      if (!sc) return;
      sc.position.z = 0.02 + 0.45 * b;
      sc.rotation.z = 10 * b;
    });
    connOld.current.rotation.x = 1.15 * b;
    connNew.current.rotation.x = 1.15 * b;

    // Pentalobe screws back out of the bottom edge.
    screws.current.forEach((sc) => {
      if (!sc) return;
      sc.position.y = -H / 2 + 0.17 - 0.95 * s.screws;
      sc.rotation.y = 9 * s.screws;
    });

    // Opening picks slide in 3 mm.
    const pk = s.picks;
    picks.current.forEach((p, i) => {
      if (!p) return;
      const d = PICKS[i];
      const off = -1.7 + 2.0 * pk;
      p.visible = pk > 0.01;
      p.position.set(d.edge[0] + d.dir[0] * off, d.edge[1] + d.dir[1] * off, 0.31);
    });

    // Glows.
    m.heat.opacity = s.heat * (0.55 + 0.45 * Math.sin(t * 4));
    m.seal.opacity = s.seal * (0.45 + 0.4 * Math.sin(t * 3));
    m.fault.opacity = s.fault * (0.6 + 0.4 * Math.sin(t * 5));
    m.fixed.opacity = s.fixed * (0.55 + 0.35 * Math.sin(t * 3));
    m.foilOld.emissive.copy(AMBER).multiplyScalar(s.fault * 0.35 * (0.6 + 0.4 * Math.sin(t * 5)));
    m.foilNew.emissive.copy(GREEN).multiplyScalar(s.fixed * 0.22);

    // Diagnose: highlight whatever part the visitor asked about.
    const fk = bench.focusKey;
    const fv = s.focus * (0.55 + 0.45 * Math.sin(t * 4.5));
    m.focus.opacity = fk === "screen" ? fv : 0;
    if (fk === "battery") m.foilNew.emissive.copy(AMBER).multiplyScalar(fv * 0.5);
    m.port.opacity = fk === "charge" ? fv : 0;
    m.lensRing.emissive.copy(AMBER).multiplyScalar(fk === "camera" ? fv * 0.6 : 0);
    m.board.emissive.copy(AMBER).multiplyScalar(fk === "water" || fk === "power" ? fv * 0.2 : 0);
    m.backGlass.emissive.copy(AMBER).multiplyScalar(fk === "back" ? fv * 0.25 : 0);

    // Scan lines: the 32-point test, the free check, and the renewed certification.
    scan.current.visible = s.scan > 0.01 && s.scan < 0.99;
    scan.current.position.y = -H / 2 + s.scan * H;
    m.scanBand.opacity = 0.22;
    m.scan.opacity = 1;
    diag.current.visible = s.diag > 0.03;
    diag.current.position.y = -H / 2 + ((t * 0.42) % 1) * H;
    m.diag.opacity = s.diag;
    cert.current.visible = s.certScan > 0.03;
    cert.current.position.y = H / 2 - ((t * 0.32) % 1) * H;
    m.cert.opacity = s.certScan;

    crack.uniforms.uProgress.value = bench.crack;

    if (dispOld.current.visible) painterOld.paint(bench.crack < 0.02 ? "lock" : "broken", s.glitch, t);
    if (dispNew.current.visible) {
      const mode = s.boot > 0.02 ? "ready" : s.test > 0.02 ? "test" : "off";
      painterNew.paint(mode, mode === "ready" ? s.boot : s.scan, t);
    }

    const lo = s.labels;
    const setO = (k: string, v: number) => {
      const el = labelEls[k];
      if (el) el.style.opacity = v.toFixed(3);
    };
    setO("dispOld", lo * (1 - sw));
    setO("dispNew", lo * sw);
    setO("batOld", lo * (1 - sw));
    setO("batNew", lo * sw);
    for (const k of ["board", "cams", "frame", "mag", "back"]) setO(k, lo);

    hotEls.forEach((h) => {
      if (!h) return;
      h.style.opacity = s.hot.toFixed(3);
      h.style.pointerEvents = s.hot > 0.5 ? "auto" : "none";
    });
  });

  return (
    <group ref={root}>
      {/* 07 back glass, camera bump and lenses */}
      <group ref={back}>
        <mesh geometry={g.back} material={m.backGlass} position={[0, 0, -0.345]} />
        <mesh geometry={g.bump} material={m.bumpGlass} position={[BUMP[0], BUMP[1], -0.42]} />
        {LENSES.map(([x, y]) => (
          <group key={`r${y}`} position={[x, y, -0.5]}>
            <mesh geometry={g.lensRing} material={m.lensRing} rotation-x={Math.PI / 2} />
            <mesh geometry={g.disc} material={m.lensGlass} position-z={-0.062} rotation-y={Math.PI} scale={0.4} />
          </group>
        ))}
        <mesh geometry={g.disc} material={m.flash} position={[1.2, 6.16, -0.474]} rotation-y={Math.PI} scale={0.17} />
        <mesh geometry={g.disc} material={m.dark} position={[1.2, 5.54, -0.474]} rotation-y={Math.PI} scale={0.05} />
        <Label portal={portal} n="07" name="Back glass" status="OK" tone="fine" labelRef={lbl("back")} />
      </group>

      {/* 06 MagSafe coil and magnets */}
      <group ref={mag}>
        <group position={[0, -0.3, -0.295]}>
          <mesh geometry={g.disc} material={m.film} scale={2.62} />
          <mesh geometry={g.disc} material={m.coil} scale={2.05} position-z={0.004} />
          <primitive object={kit.magnets} />
          <mesh geometry={g.box} material={m.magnet} position={[0, -2.95, 0.01]} scale={[1.0, 0.13, 0.05]} />
        </group>
        <Label portal={portal} n="06" name="MagSafe coil" status="OK" tone="fine" labelRef={lbl("mag")} />
      </group>

      {/* 05 frame, midplate, buttons, port and fixed internals */}
      <group ref={frame}>
        <mesh geometry={g.band} material={m.frame} />
        <mesh geometry={g.mid} material={m.midplate} position-z={-0.24} />
        <mesh geometry={g.box} material={m.button} position={[W / 2 + 0.03, 2.6, 0]} scale={[0.07, 1.15, 0.27]} />
        <mesh geometry={g.box} material={m.button} position={[-W / 2 - 0.03, 4.05, 0]} scale={[0.07, 0.45, 0.25]} />
        <mesh geometry={g.box} material={m.button} position={[-W / 2 - 0.03, 2.95, 0]} scale={[0.07, 0.8, 0.27]} />
        <mesh geometry={g.box} material={m.button} position={[-W / 2 - 0.03, 1.95, 0]} scale={[0.07, 0.8, 0.27]} />
        {[[-2.45, H / 2], [2.45, H / 2], [-2.6, -H / 2], [2.6, -H / 2]].map(([x, y]) => (
          <mesh key={`a${x}${y}`} geometry={g.box} material={m.antenna} position={[x, y, 0]} scale={[0.05, 0.03, 0.6]} />
        ))}
        {[[W / 2, 5.9], [-W / 2, 5.9], [W / 2, -5.9], [-W / 2, -5.9]].map(([x, y]) => (
          <mesh key={`s${x}${y}`} geometry={g.box} material={m.antenna} position={[x, y, 0]} scale={[0.03, 0.05, 0.6]} />
        ))}
        <mesh geometry={g.box} material={m.antenna} position={[-W / 2 - 0.004, -1.6, 0]} scale={[0.01, 1.55, 0.3]} />
        <mesh geometry={g.box} material={m.dark} position={[0, -H / 2, 0]} scale={[0.86, 0.02, 0.26]} />
        {[-1, 1].flatMap((side) =>
          [0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={`h${side}${i}`} geometry={g.box} material={m.dark} position={[side * (1.0 + i * 0.2), -H / 2, 0]} scale={[0.08, 0.02, 0.08]} />
          )),
        )}
        <mesh geometry={g.box} material={m.taptic} position={[1.9, -6.3, -0.06]} scale={[2.0, 0.95, 0.3]} />
        <mesh geometry={g.box} material={m.dark} position={[-1.9, -6.3, -0.06]} scale={[2.0, 0.95, 0.3]} />
        <mesh geometry={g.box} material={m.dark} position={[0, -6.78, -0.06]} scale={[1.2, 0.7, 0.3]} />
        <mesh geometry={g.box} material={m.flex} position={[0, -6.05, 0.11]} scale={[1.5, 0.62, 0.02]} />
        {[-0.62, 0.62].map((x, i) => (
          <group key={`p${x}`} ref={(el) => { screws.current[i] = el; }} position={[x, -H / 2 + 0.17, 0]}>
            <mesh geometry={g.screwShaft} material={m.screw} />
            <mesh geometry={g.screwHead} material={m.screw} position-y={-0.17} />
          </group>
        ))}
        <mesh geometry={g.portRim} material={m.port} position={[0, -H / 2 - 0.03, 0]} rotation-x={Math.PI / 2} />
        <Label portal={portal} n="05" name="Frame and midplate" status="OK" tone="fine" labelRef={lbl("frame")} />
      </group>

      {/* 04 battery: worn one out, new one in */}
      <Battery kit={kit} foil={m.foilOld} label={m.labelOld} groupRef={batOld} connRef={connOld}>
        <Label portal={portal} n="04" name="Battery" status="71% · worn" tone="bad" labelRef={lbl("batOld")} />
      </Battery>
      <Battery kit={kit} foil={m.foilNew} label={m.labelNew} groupRef={batNew} connRef={connNew}>
        <Label portal={portal} n="04" name="Battery" status="New · 100%" tone="ok" labelRef={lbl("batNew")} />
      </Battery>

      {/* 03 camera module */}
      <group ref={cams}>
        {LENSES.map(([x, y]) => (
          <group key={`c${y}`} position={[x, y, 0]}>
            <mesh geometry={g.box} material={m.chip} position-z={-0.02} scale={[1.12, 1.12, 0.36]} />
            <mesh geometry={g.lensBarrel} material={m.lensRing} position-z={-0.26} rotation-x={Math.PI / 2} />
            <mesh geometry={g.disc} material={m.lensGlass} position-z={0.162} scale={0.3} />
          </group>
        ))}
        <mesh geometry={g.box} material={m.flex} position={[1.4, 5.5, 0.05]} scale={[0.9, 0.35, 0.02]} />
        <Label portal={portal} n="03" name="Camera module" status="OK" tone="fine" labelRef={lbl("cams")} y={5.2} />
      </group>

      {/* 02 logic board */}
      <group ref={board}>
        <mesh geometry={g.board} material={m.boardEdge} position-z={-0.02} />
        <mesh geometry={g.boardTop} material={m.board} position-z={0.0245} />
        {BOARD_PARTS.map((p, i) => (
          <mesh key={i} geometry={g.box} material={p.shield ? m.shield : m.chip} position={[p.p[0], p.p[1], 0.024 + p.s[2] / 2]} scale={p.s} />
        ))}
        <primitive object={kit.smd} />
        <group ref={bracket} position={[2.3, 1.3, 0.225]}>
          <mesh geometry={g.box} material={m.shield} scale={[0.95, 0.62, 0.025]} />
          {[-0.33, 0.33].map((x, i) => (
            <group key={x} ref={(el) => { bScrews.current[i] = el; }} position={[x, 0, 0.02]}>
              <mesh geometry={g.screwHead} material={m.screw} rotation-x={Math.PI / 2} scale={[0.8, 1, 0.8]} />
            </group>
          ))}
        </group>
        <Label portal={portal} n="02" name="Logic board" status="OK" tone="fine" labelRef={lbl("board")} />
      </group>

      {/* 01 display assembly, hinged on its right edge */}
      <group ref={hinge} position={[W / 2, 0, 0.31]}>
        <group ref={dispOld} position={[-W / 2, 0, 0]}>
          <Display kit={kit} screen={screenOld} glass={m.glassOld}>
            <mesh geometry={g.crack} material={crack} position-z={0.0685} renderOrder={3} />
            <mesh geometry={g.rim} material={m.fault} position-z={0.072} renderOrder={4} />
          </Display>
          <Label portal={portal} n="01" name="Display assembly" status="Cracked" tone="bad" labelRef={lbl("dispOld")} />
        </group>
        <group ref={dispNew} position={[-W / 2, 0, 0]} visible={false}>
          <Display kit={kit} screen={screenNew} glass={m.glassNew}>
            <mesh geometry={g.rim} material={m.fixed} position-z={0.072} renderOrder={4} />
            <mesh geometry={g.rim} material={m.focus} position-z={0.074} renderOrder={5} />
          </Display>
          <Label portal={portal} n="01" name="Display assembly" status="New" tone="ok" labelRef={lbl("dispNew")} />
        </group>
      </group>

      {/* glows and scan lines */}
      <mesh geometry={g.rim} material={m.heat} position-z={0.318} />
      <mesh geometry={g.rim} material={m.seal} position-z={0.314} />
      <group ref={scan} position-z={0.46} visible={false}>
        <mesh geometry={g.scan} material={m.scan} />
        <mesh geometry={g.scanBand} material={m.scanBand} position-y={-0.7} />
      </group>
      <mesh ref={diag} geometry={g.scan} material={m.diag} position-z={0.46} visible={false} />
      <mesh ref={cert} geometry={g.scan} material={m.cert} position-z={-0.66} visible={false} />

      {/* opening picks */}
      {PICKS.map((p, i) => (
        <group key={i} ref={(el) => { picks.current[i] = el; }} rotation-z={p.rot} visible={false}>
          <mesh geometry={g.pick} material={m.pick} />
        </group>
      ))}

      {/* certification hotspots for renewed phones */}
      {HOTSPOTS.map((h, i) => (
        <Html key={i} position={h.p} portal={portal} zIndexRange={[26, 22]} center>
          <span ref={(el) => { hotEls[i] = el; }} className="hotspot" data-tip={h.tip} role="img" aria-label={h.tip} style={{ opacity: 0 }}>
            {i + 1}
          </span>
        </Html>
      ))}
    </group>
  );
}
