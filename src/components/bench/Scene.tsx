"use client";

import * as THREE from "three";
import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { bench, cloneState, NUM_FIELDS, VEC_FIELDS, type Tier } from "./store";
import { scenes } from "./scenes";
import { Phone } from "./Phone";
import { dotTexture, matTexture, rng } from "./textures";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Eases the live scene toward the scroll target and drives the camera. */
function Rig() {
  const { camera, size } = useThree();
  const light = useRef<THREE.PointLight>(null!);
  const v = useMemo(
    () => ({ look: new THREE.Vector3(), cam: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), fwd: new THREE.Vector3() }),
    [],
  );

  useFrame((state, delta) => {
    const T = bench.target ?? scenes.hero;
    if (!bench.live) bench.live = cloneState(T);
    const L = bench.live;
    const dt = Math.min(delta, 0.05);
    const k = bench.motion ? 1 - Math.exp(-4.2 * dt) : 1;
    for (const f of NUM_FIELDS) L[f] += (T[f] - L[f]) * k;
    for (const f of VEC_FIELDS) for (let i = 0; i < 3; i++) L[f][i] += (T[f][i] - L[f][i]) * k;

    // Opening moment: the phone takes a hit and the glass cracks.
    const fx = bench.fx;
    if (!bench.introDone) {
      if (!bench.motion || window.scrollY > 60) {
        bench.crack = 1;
        bench.introDone = true;
        if (!bench.impacted) {
          bench.impacted = true;
          window.dispatchEvent(new Event("bench:impact"));
        }
      } else {
        bench.introT += dt;
        const t = bench.introT;
        fx.rotY = -0.75 * (1 - easeOutCubic(Math.min(1, t / 1.1)));
        if (t >= 1.1) {
          if (!bench.impacted) {
            bench.impacted = true;
            window.dispatchEvent(new Event("bench:impact"));
          }
          const u = t - 1.1;
          fx.rotZ = 0.11 * Math.exp(-u * 6) * Math.cos(u * 24);
          fx.shake = 0.28 * Math.exp(-u * 8);
          bench.crack = Math.min(1, u / 0.5);
        }
        if (t > 2.6) {
          bench.introDone = true;
          fx.rotZ = 0;
          fx.shake = 0;
          bench.crack = 1;
        }
      }
    }

    // Camera: narrow screens pull back so the phone still fits.
    const aspect = size.width / size.height;
    const pull = aspect < 1 ? 1 + (1 - aspect) * 1.25 : 1;
    v.look.set(L.look[0], L.look[1], L.look[2]);
    v.cam.set(L.cam[0], L.cam[1], L.cam[2]).sub(v.look).multiplyScalar(pull).add(v.look);
    const t = state.clock.elapsedTime;
    if (fx.shake > 0.001) v.cam.add(new THREE.Vector3(Math.sin(t * 91) * fx.shake, Math.cos(t * 73) * fx.shake * 0.6, 0));
    camera.position.copy(v.cam);
    camera.lookAt(v.look);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = L.fov;
    // Shift the framing so the phone sits beside the text (desktop) or above it (mobile).
    const mobile = size.width < 768;
    const vx = mobile ? 0 : L.viewX;
    const vy = mobile ? 0.17 : L.viewY;
    cam.setViewOffset(size.width, size.height, -vx * size.width, vy * size.height, size.width, size.height);
    cam.updateProjectionMatrix();

    // A soft light follows the pointer, so metal and glass respond to the visitor.
    v.fwd.copy(v.cam).sub(v.look).normalize();
    v.right.crossVectors(camera.up, v.fwd).normalize();
    v.up.crossVectors(v.fwd, v.right).normalize();
    const p = bench.pointer;
    const want = p.active && !mobile && bench.motion ? 70 : 0;
    light.current.intensity += (want - light.current.intensity) * 0.08;
    light.current.position
      .copy(v.look)
      .addScaledVector(v.right, (p.x - vx * 2) * 9)
      .addScaledVector(v.up, p.y * 7)
      .addScaledVector(v.fwd, 7);

    if (bench.wrapper) bench.wrapper.style.opacity = (1 - L.away).toFixed(3);
  });

  return <pointLight ref={light} intensity={0} distance={40} decay={2} color="#fff0dc" />;
}

function Lights({ tier }: { tier: Tier }) {
  const spot = useRef<THREE.SpotLight>(null!);
  const target = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const L = bench.live;
    if (!L) return;
    spot.current.intensity = 500 + L.lamp * 4200;
    target.position.set(L.look[0], 0, L.look[2]);
  });
  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={spot}
        position={[7, 26, 12]}
        angle={0.4}
        penumbra={0.75}
        decay={2}
        color="#ffcf9f"
        target={target}
        castShadow={tier === "high"}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-12, 9, -14]} intensity={1.1} color="#8fb6ff" />
      <hemisphereLight args={["#9ab8ff", "#16110c", 0.25]} />
    </>
  );
}

function Bench() {
  const map = useMemo(() => {
    const t = matTexture();
    t.repeat.set(40, 40);
    return t;
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial map={map} roughness={0.92} metalness={0.05} />
    </mesh>
  );
}

/** Dust drifting through the lamp light. */
function Dust({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null!);
  const { geo, mat } = useMemo(() => {
    const r = rng(77);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * 26;
      pos[i * 3 + 1] = r() * 20;
      pos[i * 3 + 2] = (r() - 0.5) * 22;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.075,
      map: dotTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: new THREE.Color("#ffd9ae").multiplyScalar(1.4),
      opacity: 0.4,
      toneMapped: false,
    });
    return { geo, mat };
  }, [count]);
  useFrame((_, delta) => {
    const L = bench.live;
    if (!L) return;
    const a = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = a.getY(i) + delta * 0.18;
      if (y > 20) y = 0;
      a.setY(i, y);
    }
    a.needsUpdate = true;
    points.current.rotation.y += delta * 0.01;
    mat.opacity = 0.12 + 0.5 * L.lamp;
  });
  return <points ref={points} geometry={geo} material={mat} />;
}

function Effects({ tier }: { tier: Tier }) {
  return (
    <EffectComposer multisampling={tier === "high" ? 4 : 0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.82} luminanceSmoothing={0.3} radius={0.72} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette offset={0.3} darkness={0.72} />
      <Noise premultiply opacity={0.55} blendFunction={BlendFunction.SOFT_LIGHT} />
    </EffectComposer>
  );
}

function Scene({ tier, portal }: { tier: Tier; portal: RefObject<HTMLElement> }) {
  const setDpr = useThree((s) => s.setDpr);
  return (
    <>
      <color attach="background" args={["#06080b"]} />
      <fog attach="fog" args={["#06080b", 48, 100]} />
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Rig />
      <Lights tier={tier} />
      {/* Product-studio lighting: warm key softbox, cool rim strips, soft top fill. */}
      <Environment resolution={256} frames={1} environmentIntensity={1.15}>
        <Lightformer form="rect" intensity={7} color="#ffd6a8" position={[8, 9, 10]} scale={[10, 7, 1]} target={[0, 6, 0]} />
        <Lightformer form="rect" intensity={5} color="#a9cbff" position={[-12, 7, -4]} scale={[2.5, 16, 1]} target={[0, 6, 0]} />
        <Lightformer form="rect" intensity={3} color="#9fc2ff" position={[12, 5, -8]} scale={[2, 12, 1]} target={[0, 6, 0]} />
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 20, 0]} scale={[18, 18, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.6} color="#fff3e6" position={[-15, 11, 20]} scale={[8, 5, 1]} target={[0, 6, 0]} />
        <Lightformer form="ring" intensity={2.5} color="#ffe2c4" position={[-6, 9, 14]} scale={3} target={[0, 6, 0]} />
      </Environment>
      <Bench />
      <Phone tier={tier} portal={portal} />
      {tier !== "low" && <Dust count={tier === "high" ? 320 : 140} />}
      {tier !== "low" && <Effects tier={tier} />}
    </>
  );
}

export default function BenchCanvas({ tier, portal, onReady }: { tier: Tier; portal: RefObject<HTMLElement>; onReady?: () => void }) {
  const dpr: [number, number] = tier === "high" ? [1, 1.75] : tier === "mid" ? [1, 1.5] : [1, 1.25];
  return (
    <Canvas
      dpr={dpr}
      shadows={tier === "high"}
      gl={{ antialias: tier === "low", powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 30, near: 0.5, far: 260, position: [0, 8.4, 38] }}
      onCreated={({ gl, setFrameloop }) => {
        gl.toneMapping = tier === "low" ? THREE.AgXToneMapping : THREE.NoToneMapping;
        bench.setFrameloop = setFrameloop;
        // Fade the canvas in once the first frames are on screen.
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
    >
      <Scene tier={tier} portal={portal} />
    </Canvas>
  );
}
