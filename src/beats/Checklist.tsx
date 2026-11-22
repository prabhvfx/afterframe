import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { lin, sp, SPRINGS } from "../components/anim";

// Tactile UI card: rows pop in on a click track, each struck through, total = 0.
export const Checklist: React.FC<{ heading: string; items: string[]; dur: number }> = ({ heading, items, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = sp(frame, fps, 0, SPRINGS.snappy);
  const step = Math.min(0.2, (dur - 0.5) / items.length);
  const zero = sp(frame, fps, 0.1 + items.length * step, SPRINGS.bouncy);
  return (
    <AbsoluteFill style={{ background: T.bg2, justifyContent: "center", alignItems: "center", paddingBottom: 400 }}>
      <div style={{ width: 860, background: "#1F1C22", border: "2px solid #2E2A31", borderRadius: 28, padding: "44px 48px",
        boxShadow: "0 30px 70px rgba(0,0,0,0.5)", scale: String(0.85 + 0.15 * enter), opacity: enter }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: T.mono, fontSize: 34, letterSpacing: 6, color: T.muted }}>{heading}</div>
          <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 110, color: T.red, lineHeight: 1,
            scale: String(0.4 + 0.6 * zero), opacity: zero }}>0</div>
        </div>
        {items.map((it, i) => {
          const p = sp(frame, fps, 0.1 + i * step, SPRINGS.bouncy);
          const strike = lin(frame, fps, 0.16 + i * step, 0.3 + i * step);
          return (
            <div key={it} style={{ display: "flex", alignItems: "center", gap: 28, padding: "20px 0",
              borderTop: "2px solid #2E2A31", opacity: p, translate: `${(1 - p) * 60}px 0` }}>
              <div style={{ width: 48, height: 48, border: `4px solid ${T.text}55`, borderRadius: 10 }} />
              <div style={{ position: "relative", fontFamily: T.display, fontWeight: 800, fontSize: 54, color: T.text,
                opacity: 1 - strike * 0.55 }}>
                {it}
                <div style={{ position: "absolute", left: -6, top: "54%", height: 7, borderRadius: 4, background: T.red,
                  width: `calc(${strike * 100}% + 12px)` }} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
