import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { clamp, lin, shake, sp, SPRINGS } from "../components/anim";
import { Tower } from "../components/Tower";
import { Tag } from "./TowerBeats";

type Beat = { beatStart: number; dur: number };

// 6 ─ Horizontal timeline scrubs to a year, then a person card lands.
export const TimelineScrubber: React.FC<Beat & {
  from: number; to: number; target: number; landAt: number; cardAt: number;
  card: { kicker: string; title: string; sub: string };
}> = ({ from, to, target, landAt, cardAt, card, beatStart, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const land = Math.max(0.5, landAt - beatStart + 0.3);
  const year = interpolate(frame, [0, land * fps], [from, target], { ...clamp, easing: Easing.bezier(0.2, 0.9, 0.2, 1) });
  const STEP = 300; // px per year
  const landed = sp(frame, fps, land - 0.05, SPRINGS.bouncy);
  const cardP = sp(frame, fps, cardAt - beatStart - 0.05, SPRINGS.bouncy);
  const push = lin(frame, fps, cardAt - beatStart, dur, 0, 0.06);
  const years = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  return (
    <AbsoluteFill style={{ background: T.bg, scale: String(1 + push) }}>
      <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", fontFamily: T.display, fontWeight: 900,
        fontSize: 230, letterSpacing: -8, color: landed > 0.5 ? T.red : T.text, fontVariantNumeric: "tabular-nums",
        scale: String(1 + landed * 0.06 - (landed > 0 ? 0 : 0)) }}>
        {Math.round(year)}
      </div>
      {/* ruler */}
      <div style={{ position: "absolute", top: 720, left: 0, right: 0, height: 140 }}>
        <div style={{ position: "absolute", top: 60, left: 0, right: 0, height: 4, background: "#ffffff30" }} />
        {years.map((y) => {
          const x = 540 + (y - year) * STEP;
          const near = Math.max(0, 1 - Math.abs(y - year));
          return (
            <div key={y} style={{ position: "absolute", left: x, top: 0, translate: "-50% 0", textAlign: "center" }}>
              <div style={{ width: 4, height: 50 + near * 30, background: y === target && landed > 0.5 ? T.red : "#ffffff88",
                margin: "0 auto", translate: `0 ${10 - near * 15}px` }} />
              <div style={{ fontFamily: T.mono, fontSize: 32, color: T.muted, marginTop: 30 }}>{y}</div>
            </div>
          );
        })}
        {Array.from({ length: (to - from) * 4 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 540 + (from + i / 4 - year) * STEP, top: 46, width: 2, height: 30,
            background: "#ffffff30" }} />
        ))}
        <div style={{ position: "absolute", left: 538, top: -30, width: 4, height: 150, background: T.yellow }} />
      </div>
      {/* card */}
      <div style={{ position: "absolute", left: 120, right: 120, top: 920, opacity: cardP, translate: `0 ${(1 - cardP) * 160}px`,
        background: T.paper, borderRadius: 18, padding: "34px 40px", color: T.ink, display: "flex", gap: 30, alignItems: "center",
        boxShadow: "0 30px 70px rgba(0,0,0,0.5)" }}>
        <div style={{ width: 120, height: 120, borderRadius: 60, background: T.ink, flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 35, top: 22, width: 50, height: 50, borderRadius: 25, background: T.paper }} />
          <div style={{ position: "absolute", left: 15, top: 80, width: 90, height: 80, borderRadius: 45, background: T.paper }} />
        </div>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 24, letterSpacing: 3, color: "#6d6457" }}>{card.kicker}</div>
          <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 64, lineHeight: 1.05 }}>{card.title}</div>
          <div style={{ fontFamily: T.body, fontSize: 30, color: "#4c463e" }}>{card.sub}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 7 ─ Plan view: wind hits a face, then swings 45° to hit a corner.
export const WindDiagram: React.FC<Beat & { faceAt: number; cornerAt: number }> = ({ faceAt, cornerAt, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f0 = faceAt - beatStart, c0 = cornerAt - beatStart;
  const show = sp(frame, fps, 0, SPRINGS.snappy);
  const swing = sp(frame, fps, c0 - 0.1, SPRINGS.bouncy);
  const hit = lin(frame, fps, c0 + 0.2, c0 + 0.5);
  const s = shake(frame, fps, c0 + 0.25, 10, 0.25);
  const CX = 600, CY = 760, S = 340;
  const flow = -frame * 0.04;
  return (
    <AbsoluteFill style={{ background: "#0F1420", translate: `${s.x}px ${s.y}px` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <marker id="ah" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L8 4 L0 8 Z" fill={swing > 0.5 ? T.red : T.blue} />
          </marker>
        </defs>
        <rect x={CX - S / 2} y={CY - S / 2} width={S} height={S} fill={`${T.text}10`} stroke={T.text} strokeWidth={5}
          style={{ scale: String(show), transformOrigin: `${CX}px ${CY}px`, transformBox: "view-box" }} />
        {[[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dx, dy], i) => (
          <rect key={i} x={CX + (dx * S) / 2 - 22} y={CY + (dy * S) / 2 - 22} width={44} height={44} rx={6} fill={T.yellow} opacity={show} />
        ))}
        <circle cx={CX - S / 2} cy={CY - S / 2} r={30 + hit * 60} fill={T.red} opacity={hit * 0.45} />
        <g style={{ rotate: `${swing * 45}deg`, transformOrigin: `${CX}px ${CY}px`, transformBox: "view-box" }}>
          {[-2, -1, 0, 1, 2].map((i) => {
            const p = lin(frame, fps, f0 - 0.3 + Math.abs(i) * 0.05, f0 + Math.abs(i) * 0.05);
            const y = CY + i * 80;
            return (
              <line key={i} x1={CX - 640} y1={y} x2={CX - S / 2 - 30 - (1 - p) * 300} y2={y}
                stroke={swing > 0.5 ? T.red : T.blue} strokeWidth={8} strokeLinecap="round" opacity={p}
                pathLength={1} strokeDasharray="0.12 0.06" strokeDashoffset={flow} markerEnd="url(#ah)" />
            );
          })}
        </g>
      </svg>
      <Tag text="WIND HITS A FACE" p={sp(frame, fps, f0, SPRINGS.bouncy) * (1 - swing)} color={T.blue}
        style={{ left: 80, top: 1000 }} />
      <Tag text="QUARTERING WIND · 45°" p={swing} style={{ left: 80, top: 1000 }} />
      <Tag text="+40% LOAD ON 4 OF 8 TIERS" p={sp(frame, fps, c0 + 1.1, SPRINGS.bouncy)} color={T.text}
        style={{ left: 80, top: 1080 }} />
    </AbsoluteFill>
  );
};

// 8 ─ Graph-paper calculation sheet that types itself out.
export const CalcSheet: React.FC<Beat & { who: string; whoAt: number; rows: string[] }> = ({ who, whoAt, rows, beatStart, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = sp(frame, fps, 0, SPRINGS.bouncy);
  const whoP = sp(frame, fps, whoAt - beatStart, SPRINGS.snappy);
  const per = (dur - 0.6) / rows.length;
  const ring = lin(frame, fps, dur - 0.55, dur - 0.2);
  return (
    <AbsoluteFill style={{ background: T.bg2, justifyContent: "center", alignItems: "center", paddingBottom: 400 }}>
      <div style={{ width: 860, padding: "46px 50px", borderRadius: 12, color: T.ink, position: "relative",
        background: "linear-gradient(#9DB7D633 2px, transparent 2px) 0 0 / 40px 40px, linear-gradient(90deg, #9DB7D633 2px, transparent 2px) 0 0 / 40px 40px, #F4F1E8",
        boxShadow: "0 40px 80px rgba(0,0,0,0.55)", translate: `0 ${(1 - enter) * 800}px`, rotate: `${3 - enter * 4}deg`,
        scale: String(1 + lin(frame, fps, 0, dur, 0, 0.05)) }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.mono, fontSize: 26, color: "#5d6b7c" }}>
          <span>STRUCTURAL CALCS</span><span>JULY 1978</span>
        </div>
        <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 54, margin: "16px 0 20px" }}>Citicorp Center</div>
        {rows.map((r, i) => {
          const t = lin(frame, fps, 0.2 + i * per, 0.2 + (i + 0.8) * per);
          const last = i === rows.length - 1;
          return (
            <div key={i} style={{ position: "relative", fontFamily: T.mono, fontSize: 40, padding: "14px 0", display: "inline-block",
              width: "100%" }}>
              {r.slice(0, Math.round(r.length * t))}
              {last && (
                <svg width="600" height="110" style={{ position: "absolute", left: -36, top: -12, overflow: "visible" }}>
                  <ellipse cx="300" cy="50" rx="290" ry="46" fill="none" stroke={T.red} strokeWidth="6"
                    pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} />
                </svg>
              )}
            </div>
          );
        })}
        <div style={{ marginTop: 26, display: "flex", justifyContent: "flex-end", opacity: whoP, translate: `${(1 - whoP) * 30}px 0` }}>
          <div style={{ fontFamily: T.body, fontStyle: "italic", fontSize: 38, borderTop: `3px solid ${T.ink}`, paddingTop: 8 }}>{who}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 9 ─ Big count-up with before/after load bars.
export const BigCounter: React.FC<Beat & { value: number; suffix: string; label: string; countAt: number; countEnd: number }> = ({
  value, suffix, label, countAt, countEnd, beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = countAt - beatStart, b = Math.max(a + 0.3, countEnd - beatStart);
  const k = interpolate(frame, [a * fps, b * fps], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const done = sp(frame, fps, b, SPRINGS.slam);
  const s = shake(frame, fps, b, 20, 0.18);
  const enter = sp(frame, fps, 0, SPRINGS.snappy);
  const unit = 250;
  return (
    <AbsoluteFill style={{ background: T.bg, translate: `${s.x}px ${s.y}px` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${T.red}44, transparent 55%)`, opacity: done }} />
      <div style={{ position: "absolute", top: 360, width: "100%", textAlign: "center", fontFamily: T.mono, fontSize: 34,
        letterSpacing: 8, color: T.muted, opacity: enter }}>{label}</div>
      <div style={{ position: "absolute", top: 420, width: "100%", textAlign: "center", fontFamily: T.display, fontWeight: 900,
        fontSize: 300, letterSpacing: -10, color: k > 0 ? T.red : T.text, fontVariantNumeric: "tabular-nums",
        scale: String(1 + done * 0.05 - (1 - enter) * 0.2), opacity: enter }}>
        +{Math.round(value * k)}{suffix}
      </div>
      <div style={{ position: "absolute", left: 90, top: 820, opacity: enter }}>
        {[{ l: "BEFORE", w: unit, c: T.text }, { l: "QUARTERING WIND", w: unit * (1 + (value / 100) * k), c: T.red }].map((r) => (
          <div key={r.l} style={{ marginBottom: 34 }}>
            <div style={{ fontFamily: T.mono, fontSize: 28, letterSpacing: 4, color: T.muted, marginBottom: 10 }}>{r.l}</div>
            <div style={{ width: r.w, height: 56, background: r.c, borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 10 ─ X-ray zoom into a chevron joint; fasteners appear, then a question mark.
export const JointZoom: React.FC<Beat & { revealAt: number }> = ({ revealAt, beatStart, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r0 = revealAt - beatStart;
  const zoom = interpolate(frame, [0.2 * fps, Math.max(0.4, r0 - 0.15) * fps], [1, 6], { ...clamp, easing: Easing.in(Easing.cubic) });
  const swap = lin(frame, fps, r0 - 0.25, r0);
  const q = sp(frame, fps, dur - 1.0, SPRINGS.bouncy);
  const bolts = [[-60, -40], [0, -40], [60, -40], [-60, 30], [0, 30], [60, 30]];
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <AbsoluteFill style={{ opacity: 1 - swap }}>
        <div style={{ position: "absolute", left: 340, top: 300, width: 400, height: 1000, scale: String(zoom),
          transformOrigin: "50% 33.5%" }}>
          <Tower draw={1} xray={1} jointGlow={lin(frame, fps, 0, 0.4)} style={{ width: "100%", height: "100%" }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: swap, justifyContent: "center", alignItems: "center", paddingBottom: 380 }}>
        <svg width="900" height="760" viewBox="-450 -380 900 760" style={{ scale: String(0.9 + 0.1 * swap) }}>
          <rect x={-470} y={-30} width={520} height={110} fill="#3A3F4A" stroke={T.text} strokeWidth={4}
            style={{ rotate: "35deg", transformOrigin: "0 0", transformBox: "view-box" }} />
          <rect x={-50} y={-30} width={520} height={110} fill="#3A3F4A" stroke={T.text} strokeWidth={4}
            style={{ rotate: "-35deg", transformOrigin: "0 0", transformBox: "view-box" }} />
          <rect x={-360} y={-180} width={720} height={90} fill="#2C3038" stroke={T.text} strokeWidth={4} />
          <path d="M-130 -100 L130 -100 L170 90 L-170 90 Z" fill={T.yellow} stroke={T.ink} strokeWidth={5} />
          {bolts.map(([x, y], i) => {
            const p = sp(frame, fps, r0 + 0.1 + i * 0.09, SPRINGS.bouncy);
            return (
              <g key={i} style={{ scale: String(p), transformOrigin: `${x}px ${y}px`, transformBox: "view-box" }}>
                <circle cx={x} cy={y} r={22} fill={T.ink} />
                <circle cx={x} cy={y} r={22} fill="none" stroke={T.red} strokeWidth={4} opacity={0.6 + 0.4 * Math.sin(frame / 4 + i)} />
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 330, right: 110, fontFamily: T.display, fontWeight: 900, fontSize: 260, color: T.red,
        opacity: q, scale: String(0.4 + 0.6 * q), rotate: "8deg" }}>?</div>
    </AbsoluteFill>
  );
};

// 11 ─ Series end card: next part, teaser line, CTA.
export const NextPart: React.FC<Beat & { next: number; line: string; cta: string; badge?: string }> = ({ next, line, cta, badge }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(frame, fps, 0, SPRINGS.slam);
  const chars = Math.round(line.length * lin(frame, fps, 0.45, 0.9));
  const ctaP = sp(frame, fps, 1.0, SPRINGS.bouncy);
  const arrow = (frame / fps) % 0.8;
  return (
    <AbsoluteFill style={{ background: T.bg, justifyContent: "center", alignItems: "center", paddingBottom: 420 }}>
      <div style={{ background: T.red, color: "#fff", fontFamily: T.display, fontWeight: 900, fontSize: badge ? 120 : 170, letterSpacing: -4,
        padding: "10px 50px", borderRadius: 26, scale: String(interpolate(p, [0, 1], [2.2, 1])), opacity: Math.min(1, p * 2),
        rotate: `${interpolate(p, [0, 1], [-6, -2])}deg` }}>
        {badge ?? `PART ${next}`}
      </div>
      <div style={{ marginTop: 50, fontFamily: T.display, fontWeight: 900, fontSize: 96, color: T.text, letterSpacing: -2 }}>
        {line.slice(0, chars)}<span style={{ opacity: 0 }}>{line.slice(chars)}</span>
      </div>
      <div style={{ marginTop: 50, display: "flex", alignItems: "center", gap: 18, opacity: ctaP, translate: `0 ${(1 - ctaP) * 30}px` }}>
        <div style={{ fontFamily: T.mono, fontSize: 32, letterSpacing: 5, color: T.muted }}>{cta}</div>
        <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 48, color: T.yellow, translate: `${arrow * 30}px 0` }}>→</div>
      </div>
    </AbsoluteFill>
  );
};
