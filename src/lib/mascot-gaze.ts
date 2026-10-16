import { MASCOT_INNER_ELLIPSE, type MascotFeature } from "@/lib/mascot-shapes";

export type Point = { x: number; y: number };

// Where the mascot looks: the direction on screen (x to the right, y down)
// and how far the face is turned, as the length of the vector — from 0
// (straight ahead) to 1 (as far as it turns).
export type Gaze = Point;

// How far the face turns away from straight ahead at most.
const MAX_TURN_DEG = 50;
// From this distance (in px) between the pointer and the mascot on, the face
// is turned as far as it goes; closer, it turns less.
const FULL_TURN_DISTANCE_PX = 180;
// The face is drawn on a sphere this fraction of the ring's inside, so it
// never touches the outline, even when turned.
const SURFACE_RATIO = 0.9;
// Step used to measure how the surface bends around a feature.
const DERIVATIVE_STEP = 0.01;
// A feature fades out as it turns away behind the sphere's edge: fully visible
// once its depth is FADE_END, gone at FADE_START.
const FADE_START = 0.05;
const FADE_END = 0.3;

type Vector3 = { x: number; y: number; z: number };

// A rotation of the sphere around an axis lying in the screen plane (Rodrigues'
// formula), or null when the face looks straight ahead.
type Turn = { cos: number; sin: number; axis: Point } | null;

export type FeaturePose = {
  // An SVG matrix(...) that moves and squashes the feature to where it ends up
  // on the turned sphere.
  transform: string;
  opacity: number;
};

export function getStraightAheadGaze(): Gaze {
  return { x: 0, y: 0 };
}

// The gaze that points at the pointer: the farther the pointer, the more the
// face turns, easing off so it doesn't snap to the maximum right beside it.
export function getGazeTowards(pointer: Point, mascotCenter: Point): Gaze {
  const dx = pointer.x - mascotCenter.x;
  const dy = pointer.y - mascotCenter.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) return getStraightAheadGaze();

  const strength = Math.sin(
    Math.min(1, distance / FULL_TURN_DISTANCE_PX) * (Math.PI / 2)
  );
  return { x: (dx / distance) * strength, y: (dy / distance) * strength };
}

function createTurn(gaze: Gaze): Turn {
  const strength = Math.min(1, Math.hypot(gaze.x, gaze.y));
  if (strength < 1e-4) return null;

  const angle = strength * ((MAX_TURN_DEG * Math.PI) / 180);
  // The math below has y pointing up, the screen has it pointing down.
  const directionX = gaze.x / Math.hypot(gaze.x, gaze.y);
  const directionY = -gaze.y / Math.hypot(gaze.x, gaze.y);

  return {
    cos: Math.cos(angle),
    sin: Math.sin(angle),
    axis: { x: -directionY, y: directionX },
  };
}

function turnPoint(turn: Turn, point: Vector3): Vector3 {
  if (!turn) return point;

  const { cos, sin, axis } = turn;
  const dot = axis.x * point.x + axis.y * point.y;
  const rest = 1 - cos;

  return {
    x: point.x * cos + axis.y * point.z * sin + axis.x * dot * rest,
    y: point.y * cos - axis.x * point.z * sin + axis.y * dot * rest,
    z: point.z * cos + (axis.x * point.y - axis.y * point.x) * sin,
  };
}

// The point of the sphere that sits at (u, v) when looking straight at it
// (u to the right, v up, both as a fraction of the sphere's radius).
function getSurfacePoint(u: number, v: number): Vector3 {
  return { x: u, y: v, z: Math.sqrt(Math.max(0, 1 - u * u - v * v)) };
}

function formatNumber(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

// Where one feature of the face ends up, and how it is deformed, when the
// sphere it sits on turns to look in `gaze`. The deformation is the local
// effect of the sphere's curvature — a feature near the edge gets thin along
// the direction it moves, the way a face looks when it turns away.
export function getFeaturePose(feature: MascotFeature, gaze: Gaze): FeaturePose {
  const { cx, cy } = MASCOT_INNER_ELLIPSE;
  const rx = MASCOT_INNER_ELLIPSE.rx * SURFACE_RATIO;
  const ry = MASCOT_INNER_ELLIPSE.ry * SURFACE_RATIO;
  const turn = createTurn(gaze);
  const project = (u: number, v: number) =>
    turnPoint(turn, getSurfacePoint(u, v));

  const u = (feature.center.x - cx) / rx;
  const v = (cy - feature.center.y) / ry;
  const center = project(u, v);

  const width = 2 * DERIVATIVE_STEP;
  const right = project(u + DERIVATIVE_STEP, v);
  const left = project(u - DERIVATIVE_STEP, v);
  const up = project(u, v + DERIVATIVE_STEP);
  const down = project(u, v - DERIVATIVE_STEP);
  // How the projected position changes with u (first column) and with v.
  const dxDu = (right.x - left.x) / width;
  const dyDu = (right.y - left.y) / width;
  const dxDv = (up.x - down.x) / width;
  const dyDv = (up.y - down.y) / width;

  // Back from "x right, y up, in sphere radii" to SVG units (y down).
  const a = dxDu;
  const b = (-dyDu * ry) / rx;
  const c = (-dxDv * rx) / ry;
  const d = dyDv;
  const e = cx + rx * center.x - a * feature.center.x - c * feature.center.y;
  const f = cy - ry * center.y - b * feature.center.x - d * feature.center.y;

  const visibility = (center.z - FADE_START) / (FADE_END - FADE_START);

  return {
    transform: `matrix(${formatNumber(a, 4)} ${formatNumber(b, 4)} ${formatNumber(c, 4)} ${formatNumber(d, 4)} ${formatNumber(e, 2)} ${formatNumber(f, 2)})`,
    opacity: Math.min(1, Math.max(0, visibility)),
  };
}
