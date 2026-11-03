import * as THREE from "three";

// Phone dimensions in scene units (1 = 10 mm), modelled on a 6.1" iPhone.
export const W = 7.15;
export const H = 14.67;
export const R = 1.0;
export const LAYER = 2.0; // spacing between layers when exploded

export function roundedRectPath<T extends THREE.Path>(p: T, w: number, h: number, r: number, cx = 0, cy = 0): T {
  const x = cx - w / 2;
  const y = cy - h / 2;
  r = Math.min(r, w / 2, h / 2);
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  p.lineTo(x + w, y + h - r);
  p.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  p.lineTo(x + r, y + h);
  p.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  p.lineTo(x, y + r);
  p.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return p;
}

export const rrShape = (w: number, h: number, r: number, cx = 0, cy = 0) =>
  roundedRectPath(new THREE.Shape(), w, h, r, cx, cy);

// A rounded-rect band (outline) of the given width.
export function rrRing(w: number, h: number, r: number, inset: number) {
  const s = rrShape(w, h, r);
  s.holes.push(roundedRectPath(new THREE.Path(), w - 2 * inset, h - 2 * inset, Math.max(0.02, r - inset)));
  return s;
}

// Polygon with individually rounded corners.
export function roundedPoly(pts: [number, number][], radii: number[]) {
  const s = new THREE.Shape();
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const r = radii[i] ?? 0;
    const l1 = Math.hypot(prev[0] - p[0], prev[1] - p[1]);
    const l2 = Math.hypot(next[0] - p[0], next[1] - p[1]);
    const a: [number, number] = [p[0] + ((prev[0] - p[0]) / l1) * r, p[1] + ((prev[1] - p[1]) / l1) * r];
    const b: [number, number] = [p[0] + ((next[0] - p[0]) / l2) * r, p[1] + ((next[1] - p[1]) / l2) * r];
    if (i === 0) s.moveTo(a[0], a[1]);
    else s.lineTo(a[0], a[1]);
    s.quadraticCurveTo(p[0], p[1], b[0], b[1]);
  }
  s.closePath();
  return s;
}

// Extrude centred on z = 0, keeping the outline size despite the bevel.
export function extrude(shape: THREE.Shape, depth: number, bevel = 0.012, segments = 3) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: segments,
    curveSegments: 24,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

// ShapeGeometry UVs are raw coordinates; stretch them to 0..1 for textures.
export function remapUV(g: THREE.BufferGeometry) {
  g.computeBoundingBox();
  const b = g.boundingBox!;
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - b.min.x) / (b.max.x - b.min.x);
    uv[i * 2 + 1] = (pos.getY(i) - b.min.y) / (b.max.y - b.min.y);
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}
