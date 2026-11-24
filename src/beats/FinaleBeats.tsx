import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { clamp, lin, shake, sp, SPRINGS } from "../components/anim";
import { CAST_COLORS, Character } from "../components/Character";
import { Tag } from "./TowerBeats";
import { NIGHT } from "./HorrorBeats";
import { Figure, PENCIL, ROOMS } from "./CameraBeats";

// Seventh Room Part 4 beats: Theo at the wall, the sledge, the empty room, the updated plan.
type Beat = { beatStart: number; dur: number };

const HOODIE = { top: "#3F6FB5", topShade: "#2E568F" };
const ease = { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) };

const Typed: React.FC<{ text: string; p: number }> = ({ text, p }) => {
  const n = Math.round(text.length * p);
  return <>{text.slice(0, n)}<span style={{ opacity: 0 }}>{text.slice(n)}</span></>;
};

// 1 ─ Theo asleep on his feet, cheek on the wall, whispering. Push in, then his line.
export const TheoWall: React.FC<Beat & { asleepAt: number; zoomAt: number; quote: string; quoteFrom: number; quoteTo: number }> = ({
  asleepAt, zoomAt, quote, quoteFrom, quoteTo, beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const a0 = asleepAt - beatStart, z0 = zoomAt - beatStart, q0 = quoteFrom - beatStart, q1 = quoteTo - beatStart;
  const enter = sp(frame, fps, 0, SPRINGS.smooth);
  const zoom = interpolate(frame, [(z0 - 0.2) * fps, (z0 + 1.2) * fps], [0, 1], ease);
  const bubble = sp(frame, fps, q0 - 0.15, SPRINGS.bouncy);
  const typed = lin(frame, fps, q0, Math.max(q0 + 0.2, q1));
  const sway = Math.sin(t * 0.9) * 1.5;
  const MX = 600, MY = 900; // his mouth, where the push-in lands
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      <AbsoluteFill style={{ scale: String(1 + zoom * 0.45), transformOrigin: `${MX}px ${MY}px` }}>
        {/* hallway end wall with the red seam */}
        <div style={{ position: "absolute", left: 670, top: 0, bottom: 0, right: 0, background: "linear-gradient(90deg,#1B2032,#121522)" }} />
        <div style={{ position: "absolute", left: 840, top: 0, bottom: 0, width: 6, background: T.red, opacity: 0.55,
          boxShadow: `0 0 30px ${T.red}` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1250, bottom: 0, background: "#1A1610" }} />
        {/* Theo leaning into the wall */}
        <div style={{ position: "absolute", left: 150, top: 470, width: 640, height: 747, opacity: enter,
          rotate: `${19 + sway}deg`, transformOrigin: "50% 100%", filter: "brightness(0.8) saturate(0.8)" }}>
          <Character id="theo" asleep look={HOODIE} style={{ width: "100%", height: "100%" }} />
        </div>
        {/* whisper marks between his mouth and the wall */}
        {[0, 1, 2].map((i) => {
          const w = (t * 0.8 + i / 3) % 1;
          return <div key={i} style={{ position: "absolute", left: 640 + w * 50, top: 880 - w * 40, fontFamily: T.display, fontWeight: 900,
            fontSize: 30, color: CAST_COLORS.theo, opacity: zoom * Math.sin(w * Math.PI) * 0.8 }}>~</div>;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 560px 860px, transparent 0%, transparent 26%, #000000D0 62%)" }} />
      <Tag text="ASLEEP" p={sp(frame, fps, a0, SPRINGS.bouncy)} color={T.text} style={{ left: 64, top: 1110 }} />
      <Tag text="WHISPERING" p={zoom > 0.5 && t < q0 - 0.2 ? sp(frame, fps, z0 + 0.3, SPRINGS.bouncy) : 0} style={{ left: 64, top: 1110 }} />
      <div style={{ position: "absolute", top: 300, left: 64, right: 140, background: "#F7F4EE", color: T.ink,
        border: `4px solid ${CAST_COLORS.theo}`, borderRadius: 30, padding: "24px 32px", fontFamily: T.display, fontWeight: 700,
        fontStyle: "italic", fontSize: 54, lineHeight: 1.15, opacity: bubble, scale: String(0.7 + 0.3 * bubble), transformOrigin: "60% 100%" }}>
        <Typed text={quote} p={typed} />
      </div>
    </AbsoluteFill>
  );
};

// Cracks radiating from the strike point. One set per hit.
const CRACKS = [
  "M540 780 L470 700 L430 640 L360 610 M470 700 L420 720",
  "M540 780 L620 840 L700 860 L760 930 M620 840 L640 900",
  "M540 780 L560 680 L620 600 L640 520 M560 680 L500 620 M540 780 L450 860 L390 960 L330 1000",
];

// 2 ─ The wall, the drill hole from Part 1, a sledge. Three hits crack it. Three hits answer from inside.
export const SledgeWall: React.FC<Beat & { toolAt: number; hits: number[]; backs: number[] }> = ({ toolAt, hits, backs, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const h = hits.map((x) => x - beatStart), b = backs.map((x) => x - beatStart);
  const nh = h.filter((x) => t >= x).length, nb = b.filter((x) => t >= x).length;
  const last = [...h, ...b].filter((x) => t >= x).pop();
  const s = last === undefined ? { x: 0, y: 0 } : shake(frame, fps, last, nb > 0 ? 26 : 18, 0.18);
  const tool = sp(frame, fps, toolAt - beatStart, SPRINGS.bouncy);
  // the sledge swings in for each hit, and lies still once the wall answers
  const swing = nb > 0 ? 0 : h.reduce((acc, x) => Math.max(acc, 1 - Math.min(1, Math.abs(t - x) / 0.18)), 0);
  const glow = nb > 0 ? sp(frame, fps, b[nb - 1], SPRINGS.slam) : 0;
  return (
    <AbsoluteFill style={{ background: NIGHT, translate: `${s.x}px ${s.y}px` }}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 330, height: 920, background: "#B9AF9F", borderRadius: 6,
        boxShadow: "inset 0 0 120px #00000066" }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <circle cx={540} cy={780} r={18} fill="#050505" stroke="#8F8574" strokeWidth={5} />
        {CRACKS.slice(0, nh).map((d, i) => (
          <path key={i} d={d} stroke={nb > 0 ? T.red : "#3A342C"} strokeWidth={7 + (nb > 0 ? glow * 4 : 0)} fill="none"
            strokeLinejoin="round" style={{ filter: nb > 0 ? `drop-shadow(0 0 ${12 * glow}px ${T.red})` : undefined }} />
        ))}
        {b.map((x, i) => {
          const r = lin(frame, fps, x, x + 0.7);
          return t >= x ? <circle key={i} cx={540} cy={780} r={30 + r * 420} fill="none" stroke={T.red} strokeWidth={10} opacity={1 - r} /> : null;
        })}
      </svg>
      {/* sledgehammer */}
      <svg width={520} height={520} viewBox="0 0 520 520" style={{ position: "absolute", left: 560, top: 820, opacity: tool,
        translate: `${(1 - tool) * 400}px 0`, rotate: `${-30 + swing * 38}deg`, transformOrigin: "90% 90%" }}>
        <rect x={150} y={250} width={340} height={30} rx={12} fill="#7A5A3A" transform="rotate(-35 320 265)" />
        <rect x={60} y={60} width={170} height={110} rx={14} fill="#3A3D46" transform="rotate(-35 145 115)" />
      </svg>
      <div style={{ position: "absolute", top: 1110, left: 64, display: "flex", gap: 14 }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 30, padding: "8px 18px", borderRadius: 8,
            background: k < nb ? T.red : k < nh ? T.text : "#ffffff14", color: k < nb ? "#fff" : k < nh ? T.ink : T.muted }}>
            {k < nb ? "BACK" : `HIT ${k + 1}`}
          </div>
        ))}
      </div>
      <Tag text="FROM INSIDE" p={nb > 0 ? sp(frame, fps, b[0], SPRINGS.slam) : 0} style={{ left: 64, top: 300 }} />
    </AbsoluteFill>
  );
};

// 3 ─ The wall gives way. Chunks fall, dust hangs, a dark opening behind.
const CHUNKS = Array.from({ length: 24 }, (_, i) => {
  const c = i % 6, r = Math.floor(i / 6);
  return { x: 124 + c * 138, y: 480 + r * 150, w: 146 + ((i * 37) % 12), h: 158 + ((i * 53) % 10), spin: ((i * 71) % 60) - 30, d: 0.6 + ((i * 29) % 40) / 100 };
});
export const BreakThrough: React.FC<Beat & { breakAt: number }> = ({ breakAt, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k0 = breakAt - beatStart;
  const fall = Math.max(0, t - k0);
  const flash = interpolate(frame, [k0 * fps, (k0 + 0.25) * fps], [1, 0], clamp) * (t >= k0 ? 1 : 0);
  const s = shake(frame, fps, k0, 34, 0.3);
  const pre = shake(frame, fps, 0, 6, 10); // the wall trembles before it goes
  const sh = t < k0 ? pre : s;
  return (
    <AbsoluteFill style={{ background: NIGHT, translate: `${sh.x}px ${sh.y}px` }}>
      {/* the opening */}
      <div style={{ position: "absolute", left: 140, top: 480, width: 810, height: 600, background: "radial-gradient(ellipse at 50% 50%, #2A0A0C 0%, #020203 70%)" }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 330, height: 920, border: "60px solid #B9AF9F", borderTopWidth: 150,
        borderBottomWidth: 170, boxSizing: "border-box" }} />
      {CHUNKS.map((c, i) => {
        const y = fall > 0 ? 0.5 * 2600 * fall * fall * c.d : 0;
        const x = fall > 0 ? (c.x - 540) * fall * 0.6 : 0;
        return (
          <div key={i} style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h, background: t < k0 || i % 3 ? "#B9AF9F" : "#A89E8E",
            translate: `${x}px ${y}px`, rotate: `${c.spin * fall * 3}deg`, opacity: y > 1500 ? 0 : 1 }} />
        );
      })}
      {/* the red cracks from the last shot, until it gives */}
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: t < k0 ? 1 : 0 }}>
        {CRACKS.map((d, i) => (
          <path key={i} d={d} stroke={T.red} strokeWidth={11} fill="none" strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 ${10 + Math.sin(t * 8) * 4}px ${T.red})` }} />
        ))}
      </svg>
      {/* dust */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 70%, #CFC6B6 0%, transparent 60%)",
        opacity: t >= k0 ? interpolate(fall, [0, 0.3, 2], [0, 0.45, 0.1], clamp) : 0 }} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.5 }} />
      <Tag text="OPEN" p={sp(frame, fps, k0 + 0.5, SPRINGS.slam)} style={{ left: 64, top: 1110, fontSize: 52 }} />
    </AbsoluteFill>
  );
};

// 4 ─ Inside: flashlight on a chair and a desk. Nobody. Heat still rising off the seat.
export const WarmChair: React.FC<Beat & { emptyAt: number; warmAt: number }> = ({ emptyAt, warmAt, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const e0 = emptyAt - beatStart, w0 = warmAt - beatStart;
  const pan = interpolate(frame, [0, (e0 + 0.3) * fps], [0, 1], ease);
  const warm = interpolate(frame, [(w0 - 0.4) * fps, (w0 + 0.6) * fps], [0, 1], ease);
  const bx = interpolate(pan, [0, 1], [820, 470]), by = interpolate(pan, [0, 1], [600, 860]);
  return (
    <AbsoluteFill style={{ background: "#050508" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={1150} width={1080} height={770} fill="#0E0D0B" />
        {/* desk with the plan on it */}
        <rect x={560} y={820} width={420} height={36} fill="#3B2C20" />
        <rect x={590} y={856} width={26} height={300} fill="#2E2219" />
        <rect x={930} y={856} width={26} height={300} fill="#2E2219" />
        <rect x={640} y={804} width={240} height={18} fill="#EDE7DA" />
        {/* chair, facing the wall */}
        <rect x={300} y={640} width={34} height={420} rx={8} fill="#4A3A2C" />
        <rect x={300} y={900} width={300} height={36} rx={8} fill="#5A4634" />
        <rect x={560} y={936} width={30} height={220} fill="#4A3A2C" />
        <rect x={310} y={936} width={30} height={220} fill="#4A3A2C" />
        {/* heat off the seat */}
        {[0, 1, 2, 3].map((i) => {
          const y = ((t * 0.6 + i / 4) % 1);
          const x0 = 360 + i * 55;
          return <path key={i} d={`M${x0} ${890 - y * 260} q 18 -30 0 -60 q -18 -30 0 -60`} stroke="#FF8A3D" strokeWidth={8}
            fill="none" strokeLinecap="round" opacity={warm * Math.sin(y * Math.PI) * 0.85} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${bx}px ${by}px, transparent 0%, transparent 20%, #000000F0 46%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 440px 860px, #FF8A3D 0%, transparent 30%)", opacity: warm * 0.18,
        mixBlendMode: "screen" }} />
      <Tag text="EMPTY" p={sp(frame, fps, e0, SPRINGS.slam)} color={T.text} style={{ left: 64, top: 330 }} />
      <Tag text="STILL WARM" p={sp(frame, fps, w0, SPRINGS.slam)} style={{ left: 64, top: 1110, fontSize: 52 }} />
    </AbsoluteFill>
  );
};

// The pencil route from the seventh room to Nadia's door, in plan units.
const ROUTE: [number, number][] = [[820, 390], [330, 390], [215, 455], [175, 560]];
const SEGS = ROUTE.slice(1).map(([x, y], i) => Math.hypot(x - ROUTE[i][0], y - ROUTE[i][1]));
const TOTAL = SEGS.reduce((a, b) => a + b, 0);
const pointAt = (p: number): [number, number] => {
  let d = p * TOTAL;
  for (let i = 0; i < SEGS.length; i++) {
    if (d <= SEGS[i]) {
      const k = d / SEGS[i];
      return [ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * k, ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * k];
    }
    d -= SEGS[i];
  }
  return ROUTE[ROUTE.length - 1];
};

// 5 ─ The plan, updated: seven rooms, six figures, a line still being drawn toward Nadia.
export const PlanUpdate: React.FC<Beat & {
  updatedAt: number; seventhAt: number; figuresAt: number; countAt: number; lineAt: number; nadiaAt: number;
}> = ({ updatedAt, seventhAt, figuresAt, countAt, lineAt, nadiaAt, beatStart, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const u0 = updatedAt - beatStart, s0 = seventhAt - beatStart, f0 = figuresAt - beatStart, c0 = countAt - beatStart;
  const l0 = lineAt - beatStart, n0 = nadiaAt - beatStart;
  const enter = sp(frame, fps, 0, SPRINGS.smooth);
  const seventh = interpolate(frame, [s0 * fps, (s0 + 0.6) * fps], [0, 1], ease);
  const figP = (i: number) => interpolate(frame, [(f0 + i * 0.22) * fps, (f0 + i * 0.22 + 0.5) * fps], [0, 1], ease);
  // turns toward her room on "Nadia's", then crawls and never reaches the door
  const line = interpolate(frame, [l0 * fps, (n0 + 0.3) * fps, dur * fps], [0, 0.78, 0.93], clamp);
  const zoom = sp(frame, fps, n0 - 0.1, SPRINGS.smooth) * 0.6;
  const ring = interpolate(frame, [n0 * fps, (n0 + 0.45) * fps], [0, 1], ease);
  const s = shake(frame, fps, n0, 14, 0.14);
  const K = 0.88, OX = 42, OY = 40;
  const NADIA = { x: 165, y: 690 };
  const [tx, ty] = pointAt(line);
  const fx = OX + 175 * K, fy = OY + 560 * K;
  // the four that aren't them, and the one already in the hall
  const OTHERS: [number, number, number][] = [[250, 190, 1], [700, 190, 1], [770, 600, 1], [820, 385, 0.42]];
  return (
    <AbsoluteFill style={{ background: "#0F0E0D", translate: `${s.x}px ${s.y}px` }}>
      <div style={{ position: "absolute", left: 64, top: 370, width: 876, height: 880, borderRadius: 18, overflow: "hidden",
        background: "#EDE7DA", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", translate: `0 ${(1 - enter) * 120}px`, opacity: enter }}>
        <div style={{ position: "absolute", inset: 0, scale: String(1 + zoom * 0.9), transformOrigin: `${fx}px ${fy}px` }}>
          <svg width={876} height={880} style={{ position: "absolute" }}>
            <defs>
              <filter id="paperTex4"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3" />
                <feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.36  0 0 0 0 0.3  0 0 0 0.12 0" /></filter>
              <filter id="hand4"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="5" />
                <feDisplacementMap in="SourceGraphic" scale="5" /></filter>
            </defs>
            <rect width={876} height={880} filter="url(#paperTex4)" />
            <g transform={`translate(${OX} ${OY}) scale(${K})`} filter="url(#hand4)">
              {ROOMS.map(([x, y, w, h, name]) => (
                <g key={name}>
                  <rect x={x} y={y} width={w} height={h} fill="none" stroke={PENCIL} strokeWidth={6} />
                  <text x={x + w / 2} y={y + (name === "HALL" ? h / 2 + 12 : 50)} textAnchor="middle" fontFamily={T.body}
                    fontStyle="italic" fontWeight={500} fontSize={32} fill={PENCIL}>{name}</text>
                </g>
              ))}
              {/* the seventh room, now drawn like any other */}
              <rect x={740} y={330} width={160} height={120} fill="none" stroke={PENCIL} strokeWidth={6} pathLength={1}
                strokeDasharray={1} strokeDashoffset={1 - seventh} />
              <text x={820} y={438} textAnchor="middle" fontFamily={T.body} fontStyle="italic" fontWeight={500} fontSize={24}
                fill={PENCIL} opacity={seventh}>ROOM 7</text>
              <Figure x={NADIA.x} y={NADIA.y} p={figP(0)} />
              <Figure x={485} y={690} p={figP(1)} hoodie />
              {OTHERS.map(([x, y, k], i) => (
                <g key={i} transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
                  <Figure x={x} y={y} p={figP(i + 2)} />
                </g>
              ))}
              {/* the line still being drawn */}
              <polyline points={ROUTE.map((p) => p.join(" ")).join(" ")} fill="none" stroke={T.red} strokeWidth={7}
                strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
              {line > 0 && (
                <g transform={`translate(${tx} ${ty}) rotate(${-40 + Math.sin(t * 9) * 6})`}>
                  <rect x={-6} y={-90} width={12} height={70} fill={T.yellow} />
                  <path d="M-6 -20 L6 -20 L0 0 Z" fill={PENCIL} />
                </g>
              )}
              <circle cx={NADIA.x} cy={NADIA.y - 10} r={95} fill="none" stroke={T.yellow} strokeWidth={8} pathLength={1}
                strokeDasharray={1} strokeDashoffset={1 - ring} />
            </g>
          </svg>
        </div>
      </div>
      {/* one tag at a time in the top slot */}
      <Tag text="UPDATED" p={t < s0 - 0.1 ? sp(frame, fps, u0, SPRINGS.slam) : 0} style={{ left: 64, top: 300 }} />
      <Tag text="7 ROOMS" p={t >= s0 - 0.1 && t < c0 - 0.1 ? sp(frame, fps, s0, SPRINGS.slam) : 0} style={{ left: 64, top: 300 }} />
      <Tag text="6 FIGURES · 2 PEOPLE" p={t >= c0 - 0.1 && t < n0 - 0.1 ? sp(frame, fps, c0, SPRINGS.slam) : 0} style={{ left: 64, top: 300 }} />
      <Tag text="NADIA'S ROOM" p={t >= n0 - 0.1 ? sp(frame, fps, n0, SPRINGS.slam) : 0} style={{ left: 64, top: 300 }} />
    </AbsoluteFill>
  );
};
