import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { lin, sp, SPRINGS } from "../components/anim";

// Static document visual, reused by the intake beat and the stamp beat.
export const IntakeCard: React.FC<{
  heading: string;
  complaint: string;
  typed: number; // 0..1 of complaint revealed
  highlight: number; // 0..1 marker sweep over the last two words
  cursor?: boolean;
}> = ({ heading, complaint, typed, highlight, cursor }) => {
  const shown = complaint.slice(0, Math.round(complaint.length * typed));
  const split = complaint.lastIndexOf("one word");
  const pre = shown.slice(0, Math.min(shown.length, split));
  const hl = shown.slice(split);
  const Field: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => (
    <div style={{ display: "flex", gap: 20, alignItems: "center", borderBottom: `2px dashed ${T.ink}33`, padding: "16px 0" }}>
      <div style={{ fontFamily: T.mono, fontSize: 26, color: "#6d6457", width: 170, letterSpacing: 2 }}>{k}</div>
      {children}
    </div>
  );
  const Redact: React.FC<{ w: number }> = ({ w }) => (
    <div style={{ width: w, height: 34, background: T.ink, borderRadius: 3 }} />
  );
  return (
    <div style={{ width: 880, background: T.paper, borderRadius: 14, padding: "48px 56px 56px",
      boxShadow: "0 40px 80px rgba(0,0,0,0.55), inset 0 0 120px rgba(120,90,40,0.18)", color: T.ink, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 58, letterSpacing: -1 }}>{heading}</div>
        <div style={{ fontFamily: T.mono, fontSize: 24, color: "#6d6457" }}>FORM 7-A</div>
      </div>
      <div style={{ height: 6, background: T.ink, margin: "16px 0 10px" }} />
      <Field k="NAME"><Redact w={360} /></Field>
      <Field k="OCCUPATION"><div style={{ fontFamily: T.mono, fontSize: 32 }}>Psychologist</div></Field>
      <Field k="ADMITTED"><Redact w={120} /><Redact w={90} /></Field>
      <div style={{ fontFamily: T.mono, fontSize: 26, color: "#6d6457", letterSpacing: 2, marginTop: 28 }}>CHIEF COMPLAINT</div>
      <div style={{ fontFamily: T.mono, fontSize: 46, lineHeight: 1.35, marginTop: 12, minHeight: 130 }}>
        {pre}
        <span style={{ backgroundImage: `linear-gradient(${T.yellow}, ${T.yellow})`, backgroundRepeat: "no-repeat",
          backgroundSize: `${highlight * 100}% 82%`, backgroundPosition: "0 70%", WebkitBoxDecorationBreak: "clone",
          boxDecorationBreak: "clone", padding: "0 4px" }}>{hl}</span>
        {cursor && <span style={{ display: "inline-block", width: 24, height: 46, background: T.red, marginLeft: 4, translate: "0 8px" }} />}
      </div>
    </div>
  );
};

export const ArchivalCard: React.FC<{ heading: string; complaint: string; dur: number }> = ({ dur, ...props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = sp(frame, fps, 0, SPRINGS.bouncy);
  const typed = lin(frame, fps, 0.3, dur - 0.35);
  const hl = lin(frame, fps, dur - 0.5, dur - 0.25);
  return (
    <AbsoluteFill style={{ background: T.bg2, justifyContent: "center", alignItems: "center", paddingBottom: 380 }}>
      <AbsoluteFill style={{ background: T.paper, opacity: 1 - lin(frame, fps, 0, 0.2) }} />
      <div style={{ translate: `0 ${(1 - enter) * 900}px`, rotate: `${-6 + enter * 4.5}deg`,
        scale: String(1.0 + lin(frame, fps, 0.3, dur, 0, 0.07)) }}>
        <IntakeCard {...props} typed={typed} highlight={hl} cursor={frame % 20 < 12} />
      </div>
    </AbsoluteFill>
  );
};
