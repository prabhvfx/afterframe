import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { clamp, lin, sp, SPRINGS } from "../components/anim";

// Vector line drawing that self-draws, tagged with callouts, then the camera
// dives into the door to hand off to the next beat.
const Draw: React.FC<{ d: string; t: number; w?: number; c?: string }> = ({ d, t, w = 4, c = T.text }) => (
  <path d={d} pathLength={1} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray="1" strokeDashoffset={1 - t} />
);

const Tag: React.FC<{ x: number; y: number; text: string; p: number; color: string }> = ({ x, y, text, p, color }) => (
  <div style={{ position: "absolute", left: x, top: y, scale: String(0.7 + 0.3 * p), opacity: p,
    background: color, color: color === T.text ? T.ink : "#fff", fontFamily: T.mono, fontWeight: 700,
    fontSize: 30, letterSpacing: 3, padding: "10px 18px", borderRadius: 8, transformOrigin: "left center" }}>
    {text}
  </div>
);

export const Blueprint: React.FC<{ label: string; sub: string; dur: number }> = ({ label, sub, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = (a: number, b: number) =>
    interpolate(frame, [a * fps, b * fps], [0, 1], { ...clamp, easing: Easing.bezier(0.6, 0, 0.2, 1) });
  const windows: string[] = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 8; c++) {
      if (r === 2 && (c === 3 || c === 4)) continue;
      const x = 120 + c * 84 + (c > 3 ? 40 : 0);
      const y = 300 + r * 92;
      windows.push(`M${x} ${y} h44 v56 h-44 Z M${x + 22} ${y} v56`);
    }
  const dive = interpolate(frame, [(dur - 0.42) * fps, dur * fps], [1, 3.4], { ...clamp, easing: Easing.in(Easing.cubic) });
  const tag1 = sp(frame, fps, 0.35, SPRINGS.bouncy);
  const tag2 = sp(frame, fps, 0.75, SPRINGS.bouncy);
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      {/* grid */}
      <AbsoluteFill style={{ opacity: 0.25 + 0.1 * lin(frame, fps, 0, 1),
        backgroundImage: `linear-gradient(${T.blue}33 2px, transparent 2px), linear-gradient(90deg, ${T.blue}33 2px, transparent 2px)`,
        backgroundSize: "60px 60px", backgroundPosition: `0 ${frame * 0.6}px` }} />
      <AbsoluteFill style={{ scale: String(dive), transformOrigin: "50% 49%", paddingBottom: 300, justifyContent: "center" }}>
        <svg viewBox="0 0 1000 760" style={{ width: 1000, marginLeft: 40 }}>
          <Draw d="M60 700 H940" t={draw(0, 0.4)} w={5} />
          <Draw d="M100 700 V260 H900 V700" t={draw(0.05, 0.6)} />
          <Draw d="M80 260 L500 120 L920 260 Z" t={draw(0.2, 0.7)} />
          <Draw d="M470 175 h60 v-60 h-60 Z M500 125 v40 M480 145 h40" t={draw(0.45, 0.8)} c={T.red} w={5} />
          <Draw d={windows.join(" ")} t={draw(0.25, 0.95)} w={3} c={T.muted} />
          <Draw d="M440 700 V560 Q500 510 560 560 V700 M500 530 V700" t={draw(0.5, 0.9)} w={5} c={T.yellow} />
          <Draw d="M400 700 h200 M410 715 h180" t={draw(0.6, 0.95)} w={3} />
        </svg>
      </AbsoluteFill>
      <div style={{ opacity: interpolate(dive, [1, 1.6], [1, 0], clamp) }}>
        <Tag x={110} y={470} text={label} p={tag1} color={T.text} />
        <Tag x={560} y={1010} text={`→ ${sub}`} p={tag2} color={T.red} />
      </div>
      <AbsoluteFill style={{ background: T.paper, opacity: lin(frame, fps, dur - 0.18, dur) }} />
    </AbsoluteFill>
  );
};
