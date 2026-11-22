import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { lin, sp, SPRINGS } from "../components/anim";

// Bold masked word reveals with spring overshoot + a marker sweep on the last line.
export const KineticTitle: React.FC<{ kicker: string; lines: string[]; lineAt: number[]; beatStart: number }> = ({
  kicker,
  lines,
  lineAt,
  beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = sp(frame, fps, 0.0, SPRINGS.smooth);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 70px",
        paddingBottom: 380,
        scale: String(1 + lin(frame, fps, 0, 2, 0, 0.06)),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 34, opacity: k, translate: `${(1 - k) * -30}px 0` }}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: T.red, opacity: frame % 30 < 18 ? 1 : 0.3 }} />
        <div style={{ fontFamily: T.mono, fontSize: 34, letterSpacing: 8, color: T.muted }}>{kicker}</div>
      </div>
      {lines.map((line, i) => {
        const at = lineAt[i] - beatStart;
        const p = sp(frame, fps, at, SPRINGS.slam);
        const last = i === lines.length - 1;
        const sweep = lin(frame, fps, at + 0.25, at + 0.5);
        return (
          <div key={i} style={{ overflow: "hidden", padding: "4px 10px", margin: "-4px -10px" }}>
            <div
              style={{
                position: "relative",
                fontFamily: T.display,
                fontWeight: 900,
                fontSize: last ? 118 : 150,
                lineHeight: 1.0,
                letterSpacing: -4,
                color: last ? T.ink : T.text,
                translate: `0 ${(1 - p) * 110}%`,
                rotate: `${(1 - p) * 4}deg`,
              }}
            >
              {last && (
                <div
                  style={{
                    position: "absolute",
                    left: -12,
                    top: "8%",
                    height: "88%",
                    width: `calc(${sweep * 100}% + 24px)`,
                    background: T.yellow,
                    zIndex: -1,
                    borderRadius: 6,
                  }}
                />
              )}
              <span style={{ position: "relative", color: last && sweep < 0.02 ? T.text : undefined }}>{line}</span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
