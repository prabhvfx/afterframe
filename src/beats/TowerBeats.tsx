import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { clamp, lin, shake, sp, SPRINGS } from "../components/anim";
import { Tower } from "../components/Tower";

type Beat = { beatStart: number; dur: number };

const Grid: React.FC<{ color?: string; size?: number; drift?: number; opacity?: number }> = ({
  color = T.blue, size = 60, drift = 0, opacity = 0.18,
}) => (
  <AbsoluteFill style={{ opacity,
    backgroundImage: `linear-gradient(${color}55 2px, transparent 2px), linear-gradient(90deg, ${color}55 2px, transparent 2px)`,
    backgroundSize: `${size}px ${size}px`, backgroundPosition: `0 ${drift}px` }} />
);

export const Tag: React.FC<{ text: string; p: number; color?: string; style?: React.CSSProperties }> = ({
  text, p, color = T.red, style,
}) => (
  <div style={{ position: "absolute", scale: String(0.7 + 0.3 * p), opacity: Math.min(1, p * 1.5), background: color,
    color: color === T.text || color === T.yellow ? T.ink : "#fff", fontFamily: T.mono, fontWeight: 700, fontSize: 30,
    letterSpacing: 3, padding: "10px 18px", borderRadius: 8, whiteSpace: "nowrap", ...style }}>
    {text}
  </div>
);

// 1 ─ Hook: the tower draws itself, words slam in, it tilts on "FELL".
export const TowerHero: React.FC<Beat & { words: string[]; wordAt: number[]; tiltAt: number }> = ({
  words, wordAt, tiltAt, beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tLocal = tiltAt - beatStart;
  const tilt = sp(frame, fps, tLocal, SPRINGS.bouncy);
  const s = shake(frame, fps, tLocal, 22, 0.2);
  const glow = lin(frame, fps, tLocal, tLocal + 0.3);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #121826 0%, ${T.bg} 70%)`, translate: `${s.x}px ${s.y}px` }}>
      <Grid drift={frame * 0.4} opacity={0.12} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 72% 55%, ${T.red}66, transparent 45%)`, opacity: glow }} />
      <div style={{ position: "absolute", right: 60, top: 260, width: 400, height: 1000,
        rotate: `${tilt * 6}deg`, transformOrigin: "50% 96%" }}>
        <Tower draw={lin(frame, fps, 0, 0.9)} xray={glow * 0.8} jointGlow={glow}
          style={{ width: "100%", height: "100%" }} />
      </div>
      <div style={{ position: "absolute", left: 70, top: 420, width: 760 }}>
        {words.map((w, i) => {
          const p = sp(frame, fps, wordAt[i] - beatStart - 0.04, SPRINGS.slam);
          const last = i === words.length - 1;
          return (
            <div key={i} style={{ overflow: "hidden" }}>
              <div style={{ fontFamily: T.display, fontWeight: 900, letterSpacing: -4, lineHeight: 0.98,
                fontSize: last ? 230 : i === 1 ? 98 : 88, color: last ? T.red : T.text,
                translate: `0 ${(1 - p) * 105}%`, textShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>
                {w}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 2 ─ A document with redactions and an ink stamp.
export const DocStamp: React.FC<Beat & { heading: string; lines: string[]; stamp: string; stampAt: number }> = ({
  heading, lines, stamp, stampAt, beatStart, dur,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = sp(frame, fps, 0, SPRINGS.bouncy);
  const st = sp(frame, fps, stampAt - beatStart - 0.06, SPRINGS.slam);
  const s = shake(frame, fps, stampAt - beatStart, 16, 0.12);
  return (
    <AbsoluteFill style={{ background: T.bg2, justifyContent: "center", alignItems: "center", paddingBottom: 400,
      translate: `${s.x}px ${s.y}px` }}>
      <div style={{ position: "relative", width: 840, background: T.paper, borderRadius: 12, padding: "52px 56px 60px",
        color: T.ink, boxShadow: "0 40px 80px rgba(0,0,0,0.55), inset 0 0 120px rgba(120,90,40,0.18)",
        translate: `0 ${(1 - enter) * 900}px`, rotate: `${-5 + enter * 3.5}deg`, scale: String(1 + lin(frame, fps, 0, dur, 0, 0.06)) }}>
        <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 62, letterSpacing: -1 }}>{heading}</div>
        <div style={{ height: 6, background: T.ink, margin: "14px 0 26px" }} />
        {lines.map((l, i) => {
          const p = lin(frame, fps, 0.15 + i * 0.12, 0.3 + i * 0.12);
          return (
            <div key={i} style={{ fontFamily: T.mono, fontSize: 38, padding: "12px 0", opacity: p,
              borderBottom: `2px dashed ${T.ink}33`, letterSpacing: 1 }}>
              {l.split("█").map((part, j, arr) => (
                <React.Fragment key={j}>
                  {part}
                  {j < arr.length - 1 && <span style={{ background: T.ink, color: T.ink }}>█</span>}
                </React.Fragment>
              ))}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: "50%", top: "52%", translate: "-50% -50%",
          rotate: `${interpolate(st, [0, 1], [-28, -12])}deg`, scale: String(interpolate(st, [0, 1], [2.6, 1])),
          opacity: interpolate(st, [0, 0.1], [0, 1], clamp), border: `12px solid ${T.red}`, borderRadius: 18,
          padding: "8px 30px", fontFamily: T.display, fontWeight: 900, fontSize: 104, letterSpacing: 4, color: T.red,
          mixBlendMode: "multiply", filter: "url(#ink2)", whiteSpace: "nowrap" }}>
          {stamp}
        </div>
      </div>
      <svg width="0" height="0">
        <filter id="ink2">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.3" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </svg>
    </AbsoluteFill>
  );
};

// 3 ─ Name + count-up stats beside a height ruler.
export const TowerStats: React.FC<Beat & { name: string; nameAt: number; stats: { value: number; label: string; at: number }[] }> = ({
  name, nameAt, stats, beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = (x: number) => x - beatStart;
  const nameP = sp(frame, fps, t0(nameAt) - 0.05, SPRINGS.snappy);
  const ruler = stats.length ? lin(frame, fps, t0(stats[stats.length - 1].at), t0(stats[stats.length - 1].at) + 0.8) : 1;
  const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
  const towerTop = 340, towerH = 860; // px
  const crown = towerTop + towerH * 0.04, ground = towerTop + towerH * 0.96;
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Grid opacity={0.1} />
      <div style={{ position: "absolute", left: 40, top: towerTop, width: towerH * 0.4, height: towerH,
        scale: String(0.94 + 0.06 * sp(frame, fps, 0, SPRINGS.smooth)) }}>
        <Tower draw={1} style={{ width: "100%", height: "100%" }} />
      </div>
      {/* height ruler */}
      <div style={{ position: "absolute", left: 420, top: crown, width: 4, height: ground - crown, background: "#ffffff22" }}>
        <div style={{ position: "absolute", bottom: 0, width: 4, height: `${ruler * 100}%`, background: T.yellow }} />
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: -10, top: `${i * 10}%`, width: i % 5 === 0 ? 24 : 14, height: 3,
            background: "#ffffff55" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 480, top: 360, opacity: nameP, translate: `${(1 - nameP) * 40}px 0` }}>
        <div style={{ fontFamily: T.mono, fontSize: 30, letterSpacing: 6, color: T.muted }}>MIDTOWN MANHATTAN</div>
        <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 64, color: T.text, lineHeight: 1.05, width: 540 }}>{name}</div>
      </div>
      {stats.map((s, i) => {
        const p = sp(frame, fps, t0(s.at) - 0.05, SPRINGS.bouncy);
        const v = Math.round(interpolate(frame, [t0(s.at) * fps, (t0(s.at) + 0.6) * fps], [0, s.value], { ...clamp, easing: ease }));
        return (
          <div key={i} style={{ position: "absolute", left: 480, top: 620 + i * 270, opacity: Math.min(1, p * 1.5),
            translate: `${(1 - p) * 60}px 0` }}>
            <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 190, lineHeight: 0.9, letterSpacing: -6,
              color: i === stats.length - 1 ? T.yellow : T.text, fontVariantNumeric: "tabular-nums" }}>{v}</div>
            <div style={{ fontFamily: T.mono, fontSize: 34, letterSpacing: 8, color: T.muted, marginTop: 10 }}>{s.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 4 ─ Camera pans down the tower to the base: stilts, open corners.
export const TowerBase: React.FC<Beat> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pan = interpolate(frame, [0, Math.max(0.5, dur - 0.55) * fps], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.25, 1) });
  const W = 1000, H = 2500;
  const ty = interpolate(pan, [0, 1], [-60, -1250]);
  const lab = sp(frame, fps, dur - 0.5, SPRINGS.bouncy);
  // corner x in px: (100/400)*W + offset
  const ox = 40;
  return (
    <AbsoluteFill style={{ background: T.bg, overflow: "hidden" }}>
      <Grid drift={-ty * 0.3} opacity={0.1} />
      <div style={{ position: "absolute", left: ox, top: 0, width: W, height: H, translate: `0 ${ty}px` }}>
        <Tower draw={1} style={{ width: "100%", height: "100%" }} />
      </div>
      {[0.25, 0.75].map((fx, i) => (
        <div key={i} style={{ position: "absolute", left: ox + fx * W - 70, top: 2050 + ty - 10 + 140, width: 140, height: 140,
          borderRadius: "50%", border: `6px dashed ${T.red}`, opacity: lab, scale: String(0.5 + 0.5 * lab) }} />
      ))}
      <Tag text="EMPTY CORNERS" p={lab} style={{ left: 70, top: 2050 + ty - 90 }} />
      <Tag text="STILT ↓" p={sp(frame, fps, dur - 0.35, SPRINGS.bouncy)} color={T.yellow}
        style={{ left: ox + 0.5 * W - 70, top: 2050 + ty + 180 }} />
    </AbsoluteFill>
  );
};

// 5 ─ Top-down plan: mid-side columns, open corners, the church, the ban.
export const FootprintPlan: React.FC<Beat & { columnsAt: number; churchAt: number; banAt: number }> = ({
  columnsAt, churchAt, banAt, beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c0 = columnsAt - beatStart, ch = churchAt - beatStart, bn = banAt - beatStart;
  const S = 560, X = 260, Y = 500; // plan square in px
  const outline = lin(frame, fps, 0, 0.5);
  const cols = [
    { x: X + S / 2, y: Y }, { x: X + S, y: Y + S / 2 }, { x: X + S / 2, y: Y + S }, { x: X, y: Y + S / 2 },
  ];
  const corners = [{ x: X, y: Y }, { x: X + S, y: Y }, { x: X + S, y: Y + S }, { x: X, y: Y + S }];
  const churchP = sp(frame, fps, ch - 0.05, SPRINGS.bouncy);
  const banP = sp(frame, fps, bn - 0.05, SPRINGS.slam);
  const zoom = interpolate(frame, [(ch - 0.1) * fps, (ch + 0.6) * fps], [1, 1.12], { ...clamp, easing: Easing.bezier(0.4, 0, 0.2, 1) });
  const s = shake(frame, fps, bn, 14, 0.12);
  return (
    <AbsoluteFill style={{ background: "#0F1420", translate: `${s.x}px ${s.y}px` }}>
      <Grid opacity={0.22} size={40} />
      <AbsoluteFill style={{ scale: String(zoom), transformOrigin: `${X + S / 2}px ${Y + S / 2}px` }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={X} y={Y} width={S} height={S} fill={`${T.blue}14`} stroke={T.text} strokeWidth={5}
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - outline} />
          <rect x={X + S / 2 - 80} y={Y + S / 2 - 80} width={160} height={160} fill="none" stroke={T.muted}
            strokeWidth={3} strokeDasharray="10 8" opacity={outline} />
          <text x={X + S / 2} y={Y + S / 2 + 10} fill={T.muted} fontFamily="JetBrains Mono" fontSize={26}
            textAnchor="middle" opacity={outline}>CORE</text>
          {corners.map((c, i) => {
            const p = sp(frame, fps, c0 + 1.0 + i * 0.08, SPRINGS.bouncy);
            return (
              <g key={i} opacity={p}>
                <circle cx={c.x} cy={c.y} r={46 * p} fill="none" stroke={T.red} strokeWidth={5} strokeDasharray="12 8" />
                <path d={`M${c.x - 16} ${c.y - 16} L${c.x + 16} ${c.y + 16} M${c.x + 16} ${c.y - 16} L${c.x - 16} ${c.y + 16}`}
                  stroke={T.red} strokeWidth={6} strokeLinecap="round" />
              </g>
            );
          })}
          {cols.map((c, i) => {
            const p = sp(frame, fps, c0 + i * 0.12, SPRINGS.bouncy);
            return <rect key={i} x={c.x - 38} y={c.y - 38} width={76} height={76} rx={8} fill={T.yellow}
              style={{ scale: String(p), transformOrigin: `${c.x}px ${c.y}px`, transformBox: "view-box" }} />;
          })}
          {/* church at the north-west corner */}
          <g opacity={churchP} style={{ translate: `0 ${(1 - churchP) * -40}px` }}>
            <rect x={X - 150} y={Y - 150} width={230} height={190} fill={T.paper} stroke={T.ink} strokeWidth={4} rx={6} />
            <path d={`M${X - 95} ${Y - 70} l40 -40 l40 40 v60 h-80 Z`} fill="none" stroke={T.ink} strokeWidth={5} />
            <path d={`M${X - 55} ${Y - 140} v30 M${X - 66} ${Y - 128} h22`} stroke={T.ink} strokeWidth={5} />
          </g>
          {/* ban: no column through the church */}
          <g opacity={banP} style={{ scale: String(interpolate(banP, [0, 1], [2, 1])), transformOrigin: `${X - 35}px ${Y - 55}px`, transformBox: "view-box" }}>
            <circle cx={X - 35} cy={Y - 55} r={92} fill="none" stroke={T.red} strokeWidth={14} />
            <path d={`M${X - 100} ${Y + 10} L${X + 30} ${Y - 120}`} stroke={T.red} strokeWidth={14} />
          </g>
        </svg>
        <Tag text="4 STILTS · MID-SIDE" p={sp(frame, fps, c0 + 0.5, SPRINGS.bouncy) * (1 - banP)} color={T.yellow}
          style={{ left: X + S / 2 - 170, top: Y + S + 50 }} />
        <Tag text="CHURCH" p={churchP} color={T.text} style={{ left: X - 160, top: Y + 70 }} />
        <Tag text="NO COLUMNS THROUGH IT" p={banP} style={{ left: X + S / 2 - 200, top: Y + S + 50 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
