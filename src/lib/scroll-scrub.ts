/**
 * Shared scroll-scrub math for the cinematic dorm landing (dependency-free).
 * Same rules as the cinematic-scroll skills: 10%/90% progress buffers,
 * lerp inertia, narrative phases, DPR cap at 2.
 */

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

/** Map scroll progress [0..1] to a 1-based frame index over totalFrames. */
export function frameFor(progress: number, totalFrames: number): number {
  const total = Math.max(1, Math.floor(totalFrames));
  const p = clamp(progress, 0, 1);
  if (total === 1) return 1;
  if (p < 0.1) return 1;
  if (p >= 0.9) return total;
  const normalized = (p - 0.1) / 0.8;
  return clamp(Math.round(normalized * (total - 1)) + 1, 1, total);
}

/** One inertia integration step toward the target frame. */
export function lerpStep(current: number, target: number, factor: number): number {
  const f = clamp(factor, 0, 1);
  return current + f * (target - current);
}

/** Converged when rounding is stable. */
export function hasConverged(current: number, target: number): boolean {
  return Math.abs(target - current) <= 0.05;
}

export type ScrubPhase = "entry" | "scrub" | "morph";

/** Narrative phase for a progress value. */
export function phaseFor(progress: number): ScrubPhase {
  const p = clamp(progress, 0, 1);
  if (p < 0.1) return "entry";
  if (p < 0.8) return "scrub";
  return "morph";
}

/** Cap device pixel ratio for canvas backing stores. */
export function dprCap(dpr: number): number {
  if (!Number.isFinite(dpr) || dpr <= 0) return 1;
  return Math.min(dpr, 2);
}
