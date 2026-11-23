import React from "react";
import { AbsoluteFill } from "remotion";
import { T } from "../theme";
import { Grain } from "../components/Chrome";

// The mark: a paper frame with the next frame (red) waiting behind it.
// Drawn in a 600x600 box, centered, so platforms can crop it to a circle.
export const Mark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 600 600">
    <rect x={190} y={120} width={300} height={380} rx={34} fill={T.red} />
    <rect x={110} y={100} width={300} height={380} rx={34} fill={T.paper} />
    <text
      x={260}
      y={385}
      textAnchor="middle"
      fontFamily={T.display}
      fontWeight={900}
      fontSize={300}
      fill={T.ink}
    >
      A
    </text>
  </svg>
);

const Bg: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${T.bg2} 0%, ${T.bg} 70%)` }} />
);

// 1080x1080 profile picture. Mark sits well inside the circle crop.
export const Avatar: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Mark size={820} />
    </AbsoluteFill>
    <Grain opacity={0.06} />
  </AbsoluteFill>
);

// 2560x1440 YouTube banner. Everything that matters stays in the
// 1546x423 center area that every device shows. Faint frames fill the rest for TV.
export const Banner: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <AbsoluteFill style={{ justifyContent: "center", opacity: 0.07 }}>
      <div style={{ display: "flex", gap: 40, marginLeft: -60 }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} style={{ flex: "0 0 160px", height: 200, border: `6px solid ${T.text}`, borderRadius: 18 }} />
        ))}
      </div>
    </AbsoluteFill>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 36, background: T.bg, padding: "20px 50px", borderRadius: 30 }}>
        <Mark size={300} />
        <div>
          <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 150, color: T.text, letterSpacing: 4, lineHeight: 1 }}>
            AFTERFRAME
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 44, color: T.muted, letterSpacing: 3, marginTop: 22 }}>
            original stories, animated in parts
          </div>
        </div>
      </div>
    </AbsoluteFill>
    <Grain opacity={0.06} />
  </AbsoluteFill>
);
