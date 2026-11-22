import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { clamp, lin, shake, sp, SPRINGS } from "../components/anim";

// One word hits the screen like the sound it names: overshoot scale, flash,
// shockwave rings, decaying camera shake.
export const Slam: React.FC<{ word: string; dur: number }> = ({ word }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(frame, fps, 0, SPRINGS.slam);
  const s = shake(frame, fps, 0.03, 34, 0.16);
  const flash = interpolate(frame, [0, 2, 10], [0, 0.9, 0], clamp);
  return (
    <AbsoluteFill style={{ background: T.bg, translate: `${s.x}px ${s.y}px` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${T.red}55, transparent 60%)`, opacity: lin(frame, fps, 0, 0.1) }} />
      <svg width="1080" height="1920" style={{ position: "absolute" }}>
        {[0, 1, 2].map((i) => {
          const r = lin(frame, fps, 0.02 + i * 0.07, 0.6 + i * 0.1);
          return <circle key={i} cx={540} cy={760} r={40 + r * 900} fill="none"
            stroke={i === 0 ? T.red : T.text} strokeWidth={14 - i * 4} opacity={(1 - r) * 0.7} />;
        })}
      </svg>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 400 }}>
        <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 330, letterSpacing: -14, color: T.text,
          scale: String(interpolate(p, [0, 1], [3.2, 1])), opacity: interpolate(p, [0, 0.15], [0, 1], clamp),
          textShadow: `0 14px 0 ${T.red}, 0 30px 60px rgba(0,0,0,0.7)`,
          rotate: `${interpolate(p, [0, 1], [-8, -3])}deg` }}>
          {word}
        </div>
        <div style={{ marginTop: 40, fontFamily: T.mono, fontSize: 32, letterSpacing: 10, color: T.muted,
          opacity: lin(frame, fps, 0.35, 0.55) }}>
          THE ENTIRE SYMPTOM
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};
