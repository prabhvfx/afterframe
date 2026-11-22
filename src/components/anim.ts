import { interpolate, spring, SpringConfig } from "remotion";

// Shared spring presets so every component moves with the same physics.
export const SPRINGS = {
  snappy: { damping: 14, stiffness: 220, mass: 0.6 } as Partial<SpringConfig>,
  bouncy: { damping: 9, stiffness: 180, mass: 0.7 } as Partial<SpringConfig>,
  smooth: { damping: 200, stiffness: 120 } as Partial<SpringConfig>,
  slam: { damping: 11, stiffness: 420, mass: 0.9 } as Partial<SpringConfig>,
};

export const sp = (
  frame: number,
  fps: number,
  delaySec: number,
  config: Partial<SpringConfig> = SPRINGS.snappy,
) => spring({ frame: frame - Math.round(delaySec * fps), fps, config });

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const lin = (frame: number, fps: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a * fps, b * fps], [from, to], clamp);

// Decaying camera shake, deterministic per frame.
export const shake = (frame: number, fps: number, atSec: number, amp = 28, decay = 0.18) => {
  const t = frame / fps - atSec;
  if (t < 0) return { x: 0, y: 0 };
  const k = amp * Math.exp(-t / decay);
  return { x: Math.sin(frame * 2.7) * k, y: Math.cos(frame * 3.9) * k * 0.8 };
};
