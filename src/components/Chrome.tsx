import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { T, SAFE } from "../theme";
import { sp, SPRINGS } from "./anim";

// Film grain + vignette. Seed steps every 2 frames for a tactile flicker.
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 50;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ opacity, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 42%, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Persistent "PART X" badge + series progress, inside the top safe zone.
export const PartBadge: React.FC<{ part: number; total: number; title: string }> = ({
  part,
  total,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = sp(frame, fps, 0.15, SPRINGS.bouncy);
  const progress = frame / durationInFrames;
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top + 20,
        left: SAFE.left,
        right: SAFE.right,
        translate: `0 ${(1 - enter) * -40}px`,
        opacity: enter,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            background: T.red,
            color: "#fff",
            fontFamily: T.display,
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: 2,
            padding: "8px 18px",
            borderRadius: 10,
          }}
        >
          PART {part}
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 28, color: T.text, opacity: 0.8, letterSpacing: 3 }}>
          {title.toUpperCase()}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                background: i < part - 1 ? T.text : T.red,
                width: i < part - 1 ? "100%" : i === part - 1 ? `${progress * 100}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
