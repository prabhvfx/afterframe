import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { clamp, lin, shake, sp, SPRINGS } from "../components/anim";
import { IntakeCard } from "./ArchivalCard";

// The intake card returns and an ink stamp slams onto it, then the cliffhanger line.
export const Stamp: React.FC<{
  word: string;
  stampAt: number;
  teaser: string;
  teaserAt: number;
  heading: string;
  complaint: string;
  beatStart: number;
  dur: number;
}> = ({ word, stampAt, teaser, teaserAt, heading, complaint, beatStart, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sAt = stampAt - beatStart;
  const tAt = teaserAt - beatStart;
  const enter = sp(frame, fps, 0, SPRINGS.snappy);
  const st = sp(frame, fps, sAt - 0.08, SPRINGS.slam);
  const s = shake(frame, fps, sAt, 18, 0.12);
  const teaserP = sp(frame, fps, tAt, SPRINGS.smooth);
  const chars = Math.round(teaser.length * lin(frame, fps, tAt, tAt + 0.55));
  const dim = lin(frame, fps, tAt - 0.1, tAt + 0.3, 0, 0.55);
  return (
    <AbsoluteFill style={{ background: T.bg2, translate: `${s.x}px ${s.y}px` }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 400,
        scale: String(0.82 + 0.06 * enter + lin(frame, fps, 0, dur, 0, 0.08)) }}>
        <div style={{ rotate: "-1.5deg", position: "relative" }}>
          <IntakeCard heading={heading} complaint={complaint} typed={1} highlight={1} />
          <div style={{ position: "absolute", left: "50%", top: "48%", translate: "-50% -50%",
            rotate: `${interpolate(st, [0, 1], [-30, -14])}deg`, scale: String(interpolate(st, [0, 1], [2.6, 1])),
            opacity: interpolate(st, [0, 0.1], [0, 1], clamp),
            border: `14px solid ${T.red}`, borderRadius: 22, padding: "10px 40px",
            fontFamily: T.display, fontWeight: 900, fontSize: 128, letterSpacing: 4, color: T.red,
            mixBlendMode: "multiply", filter: "url(#ink)" }}>
            {word}
          </div>
        </div>
      </AbsoluteFill>
      <svg width="0" height="0">
        <filter id="ink">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.3" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </svg>
      <AbsoluteFill style={{ background: "#000", opacity: dim }} />
      <div style={{ position: "absolute", top: 1270, left: 64, right: 140, textAlign: "center", opacity: teaserP,
        translate: `0 ${(1 - teaserP) * 30}px` }}>
        <div style={{ display: "inline-block", fontFamily: T.display, fontWeight: 900, fontSize: 84, color: T.text,
          letterSpacing: -1, lineHeight: 1.1, borderBottom: `8px solid ${T.red}`, paddingBottom: 10 }}>
          {teaser.slice(0, chars)}
          <span style={{ opacity: 0 }}>{teaser.slice(chars)}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
