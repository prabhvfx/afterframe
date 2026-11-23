import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { clamp, lin, shake, sp, SPRINGS } from "../components/anim";
import { CAST_COLORS, Character, CharacterId, Look } from "../components/Character";
import { Tag } from "./TowerBeats";

type Beat = { beatStart: number; dur: number };

export const NIGHT = "#06070C";
export const DAY = "#12161F";

export const BlueGrid: React.FC<{ opacity?: number }> = ({ opacity = 0.14 }) => (
  <AbsoluteFill style={{ opacity,
    backgroundImage: `linear-gradient(${T.blue}55 2px, transparent 2px), linear-gradient(90deg, ${T.blue}55 2px, transparent 2px)`,
    backgroundSize: "48px 48px" }} />
);

// 1 ─ Real-estate listing promises 7 rooms; a counter finds 6.
export const ListingCount: React.FC<Beat & { rooms: number; roomsAt: number; countAt: number; foundAt: number; found: number }> = ({
  rooms, roomsAt, countAt, foundAt, found, beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r0 = roomsAt - beatStart, c0 = countAt - beatStart, f0 = foundAt - beatStart;
  const enter = sp(frame, fps, 0, SPRINGS.bouncy);
  const chip = sp(frame, fps, r0 - 0.05, SPRINGS.bouncy);
  const lift = sp(frame, fps, c0 - 0.35, SPRINGS.smooth);
  const miss = sp(frame, fps, f0 - 0.02, SPRINGS.slam);
  const s = shake(frame, fps, f0, 14, 0.14);
  return (
    <AbsoluteFill style={{ background: DAY, translate: `${s.x}px ${s.y}px` }}>
      <BlueGrid opacity={0.08} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 330, background: "#F7F4EE", borderRadius: 26, overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)", translate: `0 ${(1 - enter) * 900 - lift * 40}px`,
        scale: String(1 - lift * 0.12), transformOrigin: "50% 0%" }}>
        <svg viewBox="0 0 900 420" style={{ display: "block", width: "100%" }}>
          <defs>
            <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2A3350" /><stop offset="1" stopColor="#C77C5A" />
            </linearGradient>
          </defs>
          <rect width="900" height="420" fill="url(#dusk)" />
          <rect y="350" width="900" height="70" fill="#1B1F26" />
          <path d="M250 350 V190 L450 80 L650 190 V350 Z" fill="#20242C" />
          <path d="M230 200 L450 70 L670 200" stroke="#14171D" strokeWidth="18" fill="none" />
          {[[300, 220], [530, 220], [300, 290], [530, 290]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="70" height="50" fill={i === 1 ? "#E9C46A" : "#3A3F4A"} />
          ))}
          <rect x="415" y="270" width="70" height="80" fill="#14171D" />
          <circle cx="450" cy="160" r="22" fill="#3A3F4A" />
        </svg>
        <div style={{ padding: "26px 36px 34px", color: T.ink }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 64 }}>$89,000</div>
            <div style={{ fontFamily: T.mono, fontSize: 24, color: "#7a7268" }}>FOR SALE · AS-IS</div>
          </div>
          <div style={{ fontFamily: T.body, fontSize: 32, color: "#4c463e", marginTop: 4 }}>14 Alder Lane · Built 1931</div>
          <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
            {[`${rooms} ROOMS`, "2 BATH", "1 FLOOR"].map((c, i) => (
              <div key={c} style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 28, padding: "10px 18px", borderRadius: 10,
                background: i === 0 && chip > 0.5 ? T.yellow : "#ECE6DA",
                scale: String(i === 0 ? 1 + chip * 0.1 : 1) }}>{c}</div>
            ))}
          </div>
        </div>
      </div>
      {/* room counter */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 1000, display: "flex", gap: 14, opacity: lift }}>
        {Array.from({ length: rooms }).map((_, i) => {
          const isMissing = i >= found;
          const on = !isMissing && frame / fps >= c0 + (i / found) * Math.max(0.3, f0 - c0 - 0.1);
          return (
            <div key={i} style={{ flex: 1, height: 110, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.display, fontWeight: 900, fontSize: 50,
              background: isMissing ? "transparent" : on ? T.text : "#ffffff14",
              border: isMissing ? `5px dashed ${T.red}` : "none", color: isMissing ? T.red : T.ink,
              scale: String(isMissing ? 0.6 + 0.4 * miss : on ? 1 : 0.9), opacity: isMissing ? miss : 1 }}>
              {isMissing ? "?" : on ? i + 1 : ""}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 2 ─ Character card: bust slides in, name plate, optional speech bubble.
export const CharacterCard: React.FC<Beat & {
  who: CharacterId; name: string; role: string; side: "left" | "right"; propIcon?: "tape";
  bubble?: string; talkFrom?: number; talkTo?: number; night?: boolean; look?: Partial<Look>;
}> = ({ who, name, role, side, propIcon, bubble, talkFrom, talkTo, night = false, look, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = sp(frame, fps, 0, SPRINGS.bouncy);
  const nameP = sp(frame, fps, 0.15, SPRINGS.snappy);
  const tf = talkFrom !== undefined ? talkFrom - beatStart : -1;
  const tt = talkTo !== undefined ? talkTo - beatStart : -1;
  const bubbleP = sp(frame, fps, tf - 0.15, SPRINGS.bouncy);
  const chars = bubble ? Math.round(bubble.length * lin(frame, fps, tf, Math.max(tf + 0.2, tt))) : 0;
  const color = CAST_COLORS[who];
  const left = side === "left";
  return (
    <AbsoluteFill style={{ background: night ? NIGHT : DAY }}>
      {!night && <BlueGrid opacity={0.1} />}
      {night && <AbsoluteFill style={{ background: `radial-gradient(circle at ${left ? 35 : 65}% 62%, #1C2A4A 0%, transparent 45%)` }} />}
      <div style={{ position: "absolute", [left ? "left" : "right"]: -60, top: 520, width: 760, height: 887,
        translate: `${(1 - enter) * (left ? -500 : 500)}px 0`, scale: String(night ? 1.12 : 1) } as React.CSSProperties}>
        <Character id={who} look={look} talkFrom={tf} talkTo={tt} night={night} worry={night ? 1 : 0} style={{ width: "100%", height: "100%" }} />
      </div>
      {name && (
        <div style={{ position: "absolute", top: 380, [left ? "right" : "left"]: 70, textAlign: left ? "right" : "left",
          opacity: nameP, translate: `${(1 - nameP) * (left ? 60 : -60)}px 0` } as React.CSSProperties}>
          <div style={{ fontFamily: T.mono, fontSize: 28, letterSpacing: 6, color }}>{role}</div>
          <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 92, lineHeight: 1, color: T.text, letterSpacing: -2 }}>{name}</div>
          {propIcon === "tape" && (
            <svg width="120" height="80" viewBox="0 0 120 80" style={{ marginTop: 18, opacity: sp(frame, fps, 0.45, SPRINGS.bouncy) }}>
              <rect x="4" y="8" width="64" height="64" rx="14" fill={T.yellow} />
              <circle cx="36" cy="40" r="14" fill={T.ink} />
              <rect x="66" y="58" width={50 * lin(frame, fps, 0.5, 0.9)} height="12" fill={T.yellow} />
            </svg>
          )}
        </div>
      )}
      {bubble && (
        <div style={{ position: "absolute", top: name ? 640 : 420, [left ? "right" : "left"]: 60, maxWidth: 560,
          background: night ? "#10131C" : "#F7F4EE", color: night ? color : T.ink, border: `4px solid ${color}`,
          borderRadius: 30, padding: "26px 32px", fontFamily: T.display, fontWeight: 800, fontSize: night ? 52 : 54,
          lineHeight: 1.15, fontStyle: night ? "italic" : "normal",
          opacity: bubbleP, scale: String(0.7 + 0.3 * bubbleP), transformOrigin: left ? "0% 100%" : "100% 100%" } as React.CSSProperties}>
          {bubble.slice(0, chars)}
          <span style={{ opacity: 0 }}>{bubble.slice(chars)}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// 3 ─ Plan view of the hallway: inside 4.20 m, outside 5.10 m, a 90 cm gap.
export const MeasureGap: React.FC<Beat & { insideAt: number; outsideAt: number; gapAt: number }> = ({
  insideAt, outsideAt, gapAt, beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i0 = insideAt - beatStart, o0 = outsideAt - beatStart, g0 = gapAt - beatStart;
  const PX = 150; // px per meter
  const X0 = 150, Y0 = 600, H = 260;
  const inside = 4.2, outside = 5.1;
  const ease = { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) };
  const ip = interpolate(frame, [(i0 - 0.1) * fps, (i0 + 0.7) * fps], [0, 1], ease);
  const op = interpolate(frame, [(o0 - 0.1) * fps, (o0 + 0.7) * fps], [0, 1], ease);
  const gp = sp(frame, fps, g0, SPRINGS.slam);
  const draw = lin(frame, fps, 0, 0.6);
  const s = shake(frame, fps, g0, 12, 0.14);
  const W = outside * PX, IW = inside * PX, wall = 14;
  const gx = X0 + wall + IW; // gap start
  return (
    <AbsoluteFill style={{ background: "#0F1420", translate: `${s.x}px ${s.y}px` }}>
      <BlueGrid opacity={0.2} />
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, textAlign: "center", fontFamily: T.mono, fontSize: 32,
        letterSpacing: 8, color: T.muted, opacity: draw }}>HALLWAY · PLAN VIEW</div>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <pattern id="hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="18" height="18" fill={`${T.red}22`} />
            <line x1="0" y1="0" x2="0" y2="18" stroke={T.red} strokeWidth="6" />
          </pattern>
        </defs>
        {/* exterior shell and interior hallway */}
        <rect x={X0} y={Y0} width={W} height={H} fill="none" stroke={T.text} strokeWidth={wall} pathLength={1}
          strokeDasharray={1} strokeDashoffset={1 - draw} />
        <line x1={gx} y1={Y0} x2={gx} y2={Y0 + H} stroke={T.text} strokeWidth={wall} opacity={draw} />
        <path d={`M${X0 + 120} ${Y0 + H} a90 90 0 0 1 90 -90`} stroke={T.muted} strokeWidth={4} fill="none" opacity={draw} />
        <rect x={gx + wall / 2} y={Y0 + wall / 2} width={(W - IW - wall * 1.5) * gp} height={H - wall} fill="url(#hatch)" />
        {/* inside dimension */}
        <g opacity={ip > 0 ? 1 : 0} stroke={T.yellow} strokeWidth={5}>
          <line x1={X0 + wall} y1={Y0 + H / 2} x2={X0 + wall + IW * ip} y2={Y0 + H / 2} />
          <line x1={X0 + wall} y1={Y0 + H / 2 - 22} x2={X0 + wall} y2={Y0 + H / 2 + 22} />
          <line x1={X0 + wall + IW * ip} y1={Y0 + H / 2 - 22} x2={X0 + wall + IW * ip} y2={Y0 + H / 2 + 22} />
        </g>
        {/* outside dimension */}
        <g opacity={op > 0 ? 1 : 0} stroke={T.blue} strokeWidth={5}>
          <line x1={X0} y1={Y0 + H + 90} x2={X0 + W * op} y2={Y0 + H + 90} />
          <line x1={X0} y1={Y0 + H + 68} x2={X0} y2={Y0 + H + 112} />
          <line x1={X0 + W * op} y1={Y0 + H + 68} x2={X0 + W * op} y2={Y0 + H + 112} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: X0 + wall + (IW * ip) / 2 - 110, top: Y0 + H / 2 - 92, width: 220, textAlign: "center",
        fontFamily: T.mono, fontWeight: 700, fontSize: 46, color: T.yellow, opacity: ip > 0 ? 1 : 0 }}>
        {(inside * ip).toFixed(2)} m
      </div>
      <div style={{ position: "absolute", left: X0 + (W * op) / 2 - 110, top: Y0 + H + 110, width: 220, textAlign: "center",
        fontFamily: T.mono, fontWeight: 700, fontSize: 46, color: T.blue, opacity: op > 0 ? 1 : 0 }}>
        {(outside * op).toFixed(2)} m
      </div>
      <Tag text="0.90 m · NO DOOR" p={gp} style={{ left: gx - 150, top: Y0 - 90 }} />
    </AbsoluteFill>
  );
};

// 4 ─ Night: the clock flips to 3:12, three knocks ripple through the wall.
export const KnockNight: React.FC<Beat & { clockAt: number; knocks: number[] }> = ({ clockAt, knocks, beatStart, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const c0 = clockAt - beatStart;
  const ks = knocks.map((k) => k - beatStart);
  const minute = t >= c0 ? "3:12" : "3:11";
  const flip = sp(frame, fps, c0, SPRINGS.snappy);
  const s = ks.reduce((acc, k) => {
    const v = shake(frame, fps, k, 16, 0.1);
    return { x: acc.x + v.x, y: acc.y + v.y };
  }, { x: 0, y: 0 });
  const count = ks.filter((k) => t >= k).length;
  const after = sp(frame, fps, (ks[ks.length - 1] ?? 0) + 0.9, SPRINGS.bouncy);
  const KX = 640, KY = 860;
  return (
    <AbsoluteFill style={{ background: NIGHT, translate: `${s.x}px ${s.y}px` }}>
      {/* wall */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 640, background: "linear-gradient(180deg,#121522,#0B0D16)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1160, height: 40, background: "#1A1E2C" }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 30% 30%, #FF3B2F22, transparent 30%)` }} />
      {/* clock */}
      <div style={{ position: "absolute", top: 340, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#0A0B10", border: "3px solid #22263A", borderRadius: 20, padding: "16px 44px",
          fontFamily: T.mono, fontWeight: 700, fontSize: 150, color: T.red, letterSpacing: 6,
          textShadow: `0 0 40px ${T.red}AA`, scale: String(1 + (t >= c0 ? (1 - flip) * 0.12 : 0)) }}>
          {minute}<span style={{ fontSize: 40, marginLeft: 12 }}>AM</span>
        </div>
      </div>
      {/* knock ripples */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {ks.map((k, i) => {
          const r = lin(frame, fps, k, k + 0.7);
          return t >= k ? (
            <g key={i} opacity={1 - r}>
              <circle cx={KX} cy={KY} r={20 + r * 320} fill="none" stroke={T.red} strokeWidth={8} />
              <circle cx={KX} cy={KY} r={10 + r * 180} fill="none" stroke={T.text} strokeWidth={4} />
            </g>
          ) : null;
        })}
        <circle cx={KX} cy={KY} r={14} fill={T.red} opacity={count > 0 ? 0.8 : 0} />
      </svg>
      {ks.map((k, i) => {
        const p = sp(frame, fps, k, SPRINGS.slam);
        return (
          <div key={i} style={{ position: "absolute", left: 90, top: 640 + i * 90, fontFamily: T.display, fontWeight: 900, fontSize: 70,
            color: i === ks.length - 1 ? T.red : T.text, opacity: p, scale: String(interpolate(p, [0, 1], [1.8, 1])),
            transformOrigin: "0% 50%" }}>
            KNOCK.
          </div>
        );
      })}
      <Tag text="FROM INSIDE THE WALL" p={after} style={{ left: KX - 230, top: KY + 120 }} />
      <AbsoluteFill style={{ background: "#000", opacity: lin(frame, fps, dur - 0.25, dur, 0, 0.6) }} />
    </AbsoluteFill>
  );
};

// 5 ─ Close-up: drill into the wall, cold air, then something knocks back.
export const DrillHole: React.FC<Beat & { drillAt: number; holeAt: number; airAt: number; knockAt: number }> = ({
  drillAt, holeAt, airAt, knockAt, beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const d0 = drillAt - beatStart, h0 = holeAt - beatStart, a0 = airAt - beatStart, k0 = knockAt - beatStart;
  const CX = 540, CY = 760;
  const inP = interpolate(frame, [(d0 - 0.3) * fps, d0 * fps], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const outP = interpolate(frame, [(h0 - 0.15) * fps, (h0 + 0.3) * fps], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const drilling = t >= d0 && t < h0;
  const buzz = drilling ? Math.sin(frame * 3.1) * 4 : 0;
  const hole = lin(frame, fps, d0 + 0.2, h0);
  const air = lin(frame, fps, a0, a0 + 0.6);
  const hit = sp(frame, fps, k0, SPRINGS.slam);
  const s = shake(frame, fps, k0, 34, 0.2);
  const crack = lin(frame, fps, k0, k0 + 0.35);
  const flash = interpolate(frame, [k0 * fps, (k0 + 0.05) * fps, (k0 + 0.3) * fps], [0, 0.55, 0], clamp);
  const drillX = interpolate(inP - outP, [0, 1], [700, 0]);
  const cracks = [
    "M0 0 L60 -40 L110 -30 L170 -90",
    "M0 0 L-50 -70 L-60 -140",
    "M0 0 L-80 30 L-160 20 L-210 70",
    "M0 0 L40 70 L30 150 L80 210",
    "M0 0 L90 20 L150 80",
  ];
  return (
    <AbsoluteFill style={{ background: "#BDB3A3", translate: `${s.x}px ${s.y}px`,
      scale: String(1 + interpolate(frame, [a0 * fps, k0 * fps], [0, 0.35], { ...clamp, easing: Easing.inOut(Easing.sin) })),
      transformOrigin: `${CX}px ${CY}px` }}>
      {/* plaster texture + morning light */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <filter id="plaster"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="9" />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.28  0 0 0 0.35 0" /></filter>
        <rect width="1080" height="1920" filter="url(#plaster)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 40% 35%, #FFF1D633, transparent 55%), linear-gradient(180deg, transparent 60%, #00000066)" }} />
      {/* hole */}
      <div style={{ position: "absolute", left: CX - 34 * hole, top: CY - 34 * hole, width: 68 * hole, height: 68 * hole, borderRadius: "50%",
        background: "radial-gradient(circle, #000 55%, #2A231C 100%)", boxShadow: `0 0 0 ${6 * hole}px #9C9182` }} />
      {/* frost */}
      <div style={{ position: "absolute", left: CX - 160, top: CY - 160, width: 320, height: 320, borderRadius: "50%", opacity: air * 0.6,
        background: "radial-gradient(circle, #DDEBFF88 0%, transparent 70%)" }} />
      {/* cold air wisps */}
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: air }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = CY - 20 + i * 10;
          const d = `M${CX} ${y} C ${CX - 120} ${y - 60 - i * 20}, ${CX - 220} ${y + 40}, ${CX - 360 - i * 30} ${y - 30 - i * 25}`;
          return <path key={i} d={d} stroke="#F2F7FF" strokeOpacity={0.55} strokeWidth={5 - i * 0.6} fill="none" pathLength={1}
            strokeDasharray="0.25 0.2" strokeDashoffset={-t * 0.6 - i * 0.13} strokeLinecap="round" />;
        })}
      </svg>
      {/* cracks on knock-back */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g style={{ translate: `${CX}px ${CY}px` }}>
          {cracks.map((c, i) => (
            <path key={i} d={c} stroke="#2A1A14" strokeWidth={6} fill="none" pathLength={1} strokeDasharray={1}
              strokeDashoffset={1 - crack} strokeLinejoin="round" />
          ))}
          <circle r={60 + hit * 140} fill="none" stroke={T.red} strokeWidth={8} opacity={t >= k0 ? (1 - lin(frame, fps, k0, k0 + 0.6)) : 0} />
        </g>
      </svg>
      {/* drill */}
      <div style={{ position: "absolute", left: CX + drillX, top: CY - 70 + buzz, width: 640, height: 140, opacity: inP > 0 ? 1 : 0 }}>
        <div style={{ position: "absolute", left: 0, top: 62, width: 170, height: 16, background: "linear-gradient(#ddd,#888)", borderRadius: 8 }} />
        <div style={{ position: "absolute", left: 160, top: 22, width: 320, height: 96, background: T.yellow, borderRadius: 26 }} />
        <div style={{ position: "absolute", left: 380, top: 90, width: 90, height: 200, background: "#2A2A2E", borderRadius: 20, rotate: "12deg" }} />
        <div style={{ position: "absolute", left: 175, top: 36, width: 60, height: 68, background: "#2A2A2E", borderRadius: 14 }} />
      </div>
      <Tag text="COLD AIR" p={sp(frame, fps, a0 + 0.3, SPRINGS.bouncy)} color={T.text} style={{ left: 210, top: 590 }} />
      <AbsoluteFill style={{ background: T.red, opacity: flash, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "#000", opacity: hit * 0.25 }} />
    </AbsoluteFill>
  );
};
