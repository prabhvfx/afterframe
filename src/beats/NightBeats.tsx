import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { clamp, lin, shake, sp, SPRINGS } from "../components/anim";
import { CAST_COLORS, Character } from "../components/Character";
import { Tag } from "./TowerBeats";
import { BlueGrid, DAY, NIGHT } from "./HorrorBeats";

// Seventh Room Part 3 beats: the call, 1974, the records, the growing gap, the empty bed.
type Beat = { beatStart: number; dur: number };

const LILAC = CAST_COLORS.albrecht;
const ease = { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) };

// Typewriter text that reserves its full size so the layout never jumps.
const Typed: React.FC<{ text: string; p: number }> = ({ text, p }) => {
  const n = Math.round(text.length * p);
  return <>{text.slice(0, n)}<span style={{ opacity: 0 }}>{text.slice(n)}</span></>;
};

// 1 ─ Phone call to Mrs. Albrecht: calling, then connected with a timer.
export const CallScreen: React.FC<Beat & { connectAt: number }> = ({ connectAt, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const c0 = connectAt - beatStart;
  const enter = sp(frame, fps, 0, SPRINGS.bouncy);
  const live = t >= c0;
  const pop = sp(frame, fps, c0, SPRINGS.slam);
  const dots = ".".repeat(1 + (Math.floor(t * 3) % 3));
  const secs = Math.max(0, Math.floor(t - c0));
  return (
    <AbsoluteFill style={{ background: DAY }}>
      <BlueGrid opacity={0.08} />
      <div style={{ position: "absolute", left: 230, top: 330, width: 620, height: 900, borderRadius: 70, background: "#0B0C10",
        border: "4px solid #2A2D36", translate: `0 ${(1 - enter) * 900}px` }}>
        <div style={{ position: "absolute", inset: 18, borderRadius: 54, overflow: "hidden",
          background: "linear-gradient(180deg,#2A2338,#12111A)" }}>
          <svg width={584} height={864} style={{ position: "absolute" }}>
            {!live && [0, 1, 2].map((i) => {
              const r = ((t * 0.9 + i / 3) % 1);
              return <circle key={i} cx={292} cy={250} r={90 + r * 140} fill="none" stroke={LILAC} strokeWidth={4} opacity={(1 - r) * 0.6} />;
            })}
            <circle cx={292} cy={250} r={96} fill={LILAC} />
            <text x={292} y={278} textAnchor="middle" fontFamily={T.display} fontWeight={900} fontSize={80} fill="#2A2338">MA</text>
          </svg>
          <div style={{ position: "absolute", top: 400, left: 0, right: 0, textAlign: "center" }}>
            <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 64, color: T.text, letterSpacing: -1 }}>Mrs. Albrecht</div>
            <div style={{ fontFamily: T.mono, fontSize: 22, letterSpacing: 4, color: T.muted, marginTop: 10 }}>OWNER'S DAUGHTER · 1974</div>
            <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 36, marginTop: 40, color: live ? "#6BE38A" : T.text,
              scale: String(live ? 0.8 + 0.2 * pop : 1) }}>
              {live ? `00:${String(secs).padStart(2, "0")}` : `CALLING${dots}`}
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 70 }}>
            {["#3A3A46", T.red, "#3A3A46"].map((c, i) => (
              <div key={i} style={{ width: 110, height: 110, borderRadius: "50%", background: c }} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 2 ─ 1974: an old photo of the doorway, bricked up row by row. Her line in a bubble.
export const BrickUp: React.FC<Beat & { quote: string; quoteFrom: number; quoteTo: number }> = ({
  quote, quoteFrom, quoteTo, beatStart, dur,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q0 = quoteFrom - beatStart, q1 = quoteTo - beatStart;
  const enter = sp(frame, fps, 0, SPRINGS.snappy);
  const bubble = sp(frame, fps, q0 - 0.15, SPRINGS.bouncy);
  const typed = lin(frame, fps, q0, Math.max(q0 + 0.2, q1));
  const DX = 240, DY = 140, DW = 340, DH = 520, BW = 68, BH = 34; // doorway and brick size, panel px
  const rows = Math.ceil(DH / BH);
  const laid = lin(frame, fps, 0.1, dur - 0.5) * rows;
  return (
    <AbsoluteFill style={{ background: "#0F0D0B" }}>
      {/* old photo */}
      <div style={{ position: "absolute", left: 80, top: 500, width: 820, height: 740, background: "#E9DFC9", padding: 22,
        rotate: "-2deg", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", opacity: enter, scale: String(0.94 + 0.06 * enter) }}>
        <svg width={776} height={696} style={{ display: "block", filter: "sepia(0.9) contrast(0.95)" }}>
          <rect width={776} height={696} fill="#8C7A62" />
          <rect y={600} width={776} height={96} fill="#5E5040" />
          <rect x={DX - 18} y={DY - 18} width={DW + 36} height={DH + 18} fill="#6E5F4A" />
          <rect x={DX} y={DY} width={DW} height={DH} fill="#1A140E" />
          <g>
            {Array.from({ length: rows }).map((_, r) => {
              const p = Math.max(0, Math.min(1, laid - r));
              const y = DY + DH - (r + 1) * BH;
              const off = r % 2 ? BW / 2 : 0;
              return Array.from({ length: Math.ceil(DW / BW) + 1 }).map((_, c) => {
                const x = DX - off + c * BW;
                const w = Math.min(x + BW, DX + DW) - Math.max(x, DX);
                return w > 0 ? (
                  <rect key={`${r}-${c}`} x={Math.max(x, DX) + 2} y={y + 2 - (1 - p) * 30} width={w - 4} height={BH - 4}
                    fill="#9C6B4E" opacity={p} />
                ) : null;
              });
            })}
          </g>
        </svg>
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, transparent 40%, #000000AA 90%)" }} />
      <Tag text="1974" p={sp(frame, fps, 0.2, SPRINGS.slam)} style={{ left: 110, top: 470, fontSize: 44 }} />
      {/* her line */}
      <div style={{ position: "absolute", top: 300, left: 64, right: 140, background: "#F7F4EE", color: T.ink, border: `4px solid ${LILAC}`,
        borderRadius: 30, padding: "24px 32px", fontFamily: T.display, fontWeight: 800, fontSize: 54, lineHeight: 1.15,
        opacity: bubble, scale: String(0.7 + 0.3 * bubble), transformOrigin: "100% 100%" }}>
        <Typed text={quote} p={typed} />
      </div>
    </AbsoluteFill>
  );
};

// 3 ─ Rental records by decade: zero leases every time. Stamp: no tenant, ever.
const DECADES = ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];
export const RecordsSearch: React.FC<Beat & { rowsAt: number; stampAt: number }> = ({ rowsAt, stampAt, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r0 = rowsAt - beatStart, s0 = stampAt - beatStart;
  const head = sp(frame, fps, 0, SPRINGS.snappy);
  const st = sp(frame, fps, s0, SPRINGS.slam);
  const s = shake(frame, fps, s0, 18, 0.14);
  return (
    <AbsoluteFill style={{ background: DAY, translate: `${s.x}px ${s.y}px` }}>
      <BlueGrid opacity={0.08} />
      <div style={{ position: "absolute", left: 64, right: 140, top: 330, borderRadius: 24, background: "#161B27", padding: "30px 40px",
        opacity: head, translate: `0 ${(1 - head) * 60}px` }}>
        <div style={{ fontFamily: T.mono, fontSize: 26, letterSpacing: 5, color: T.muted }}>RENTAL RECORDS · 14 ALDER LANE</div>
        {DECADES.map((d, i) => {
          const p = sp(frame, fps, r0 + i * 0.2, SPRINGS.snappy);
          return (
            <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 26,
              paddingBottom: 18, borderBottom: "2px solid #ffffff14", opacity: p, translate: `${(1 - p) * 80}px 0` }}>
              <span style={{ fontFamily: T.display, fontWeight: 800, fontSize: 56, color: T.text }}>{d}</span>
              <span style={{ fontFamily: T.mono, fontSize: 34, color: T.muted }}>LEASES <b style={{ color: T.red, fontSize: 48 }}>0</b></span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 64, right: 140, top: 760, textAlign: "center", opacity: Math.min(1, st * 2) }}>
        <div style={{ display: "inline-block", border: `10px solid ${T.red}`, color: T.red, borderRadius: 18, padding: "10px 36px",
          fontFamily: T.display, fontWeight: 900, fontSize: 96, lineHeight: 1, background: "#0D0C0EDD",
          rotate: "-7deg", scale: String(interpolate(st, [0, 1], [2.4, 1])) }}>
          NO TENANT.<br />EVER.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 4 ─ The gap grows a centimeter a night. Plan view, widening hatch, big counter.
export const GapGrow: React.FC<Beat & { steps: number[]; rateAt: number }> = ({ steps, rateAt, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const ss = steps.map((x) => x - beatStart);
  const r0 = rateAt - beatStart;
  const n = ss.filter((x) => t >= x - 0.1).length; // nights passed
  const grow = ss.reduce((acc, x) => acc + interpolate(frame, [(x - 0.1) * fps, (x + 0.5) * fps], [0, 1], ease), 0);
  const last = ss[Math.max(0, n - 1)] ?? 0;
  const flip = n > 0 ? sp(frame, fps, last - 0.1, SPRINGS.slam) : 1;
  const s = n > 0 ? shake(frame, fps, last - 0.1, 10, 0.12) : { x: 0, y: 0 };
  const draw = lin(frame, fps, 0, 0.5);
  const X0 = 110, Y0 = 820, H = 230, W = 780, wall = 14;
  const gap = 120 + grow * 34; // exaggerated so a centimeter reads on a phone
  const gx = X0 + W - gap; // interior wall moves in as the gap grows
  return (
    <AbsoluteFill style={{ background: "#0F1420", translate: `${s.x}px ${s.y}px` }}>
      <BlueGrid opacity={0.16} />
      <div style={{ position: "absolute", top: 330, left: 64, display: "flex", gap: 14 }}>
        {[1, 2, 3].map((k) => (
          <div key={k} style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 28, padding: "8px 16px", borderRadius: 8,
            background: k <= n ? T.text : "#ffffff14", color: k <= n ? T.ink : T.muted }}>NIGHT {k}</div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 430, left: 0, right: 0, textAlign: "center", fontFamily: T.mono, fontWeight: 700,
        fontSize: 200, color: T.red, textShadow: `0 0 40px ${T.red}66`, scale: String(1 + (1 - flip) * 0.15) }}>
        {(0.9 + n * 0.01).toFixed(2)}<span style={{ fontSize: 80 }}> M</span>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <pattern id="hatchGrow" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="18" height="18" fill={`${T.red}22`} />
            <line x1="0" y1="0" x2="0" y2="18" stroke={T.red} strokeWidth="6" />
          </pattern>
        </defs>
        <rect x={X0} y={Y0} width={W} height={H} fill="none" stroke={T.text} strokeWidth={wall} pathLength={1}
          strokeDasharray={1} strokeDashoffset={1 - draw} />
        <rect x={gx + wall / 2} y={Y0 + wall / 2} width={X0 + W - gx - wall} height={H - wall} fill="url(#hatchGrow)" />
        <line x1={gx} y1={Y0} x2={gx} y2={Y0 + H} stroke={T.text} strokeWidth={wall} opacity={draw} />
        <text x={X0 + (gx - X0) / 2} y={Y0 + H / 2 + 14} textAnchor="middle" fontFamily={T.mono} fontSize={34} fill={T.muted}>HALLWAY</text>
        <g stroke={T.yellow} strokeWidth={5} opacity={draw}>
          <line x1={gx} y1={Y0 - 50} x2={X0 + W} y2={Y0 - 50} />
          <line x1={gx} y1={Y0 - 70} x2={gx} y2={Y0 - 30} />
          <line x1={X0 + W} y1={Y0 - 70} x2={X0 + W} y2={Y0 - 30} />
        </g>
      </svg>
      <Tag text="+1 CM EVERY NIGHT" p={sp(frame, fps, r0, SPRINGS.slam)} style={{ left: 64, top: 1110 }} />
    </AbsoluteFill>
  );
};

// 5 ─ Theo asleep at 3:12. Three knocks ripple through the wall. He doesn't move.
export const SleepThrough: React.FC<Beat & { knocks: number[] }> = ({ knocks, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const ks = knocks.map((k) => k - beatStart);
  const enter = sp(frame, fps, 0, SPRINGS.smooth);
  const after = sp(frame, fps, (ks[ks.length - 1] ?? 0) + 0.5, SPRINGS.bouncy);
  const KX = 870, KY = 560;
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      {/* moonlit window */}
      <div style={{ position: "absolute", left: 110, top: 360, width: 220, height: 300, background: "linear-gradient(180deg,#1C2A4A,#0F1830)",
        border: "10px solid #1A1E2C" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 25% 40%, #1C2A4A88 0%, transparent 45%)" }} />
      <div style={{ position: "absolute", top: 360, right: 160, fontFamily: T.mono, fontWeight: 700, fontSize: 64, color: T.red,
        textShadow: `0 0 24px ${T.red}AA` }}>3:12</div>
      {/* Theo asleep, blanket over him */}
      <div style={{ position: "absolute", left: 160, top: 640, width: 680, height: 793, opacity: enter, filter: "brightness(0.72) saturate(0.7) hue-rotate(-10deg)" }}>
        <Character id="theo" asleep style={{ width: "100%", height: "100%" }} />
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 1080, bottom: 0, borderRadius: "40px 40px 0 0",
        background: "linear-gradient(180deg,#2A3354,#151A2C)" }} />
      {/* Zs */}
      {[0, 1, 2].map((i) => {
        const z = ((t * 0.5 + i / 3) % 1);
        return <div key={i} style={{ position: "absolute", left: 640 + z * 120, top: 700 - z * 260, fontFamily: T.display, fontWeight: 900,
          fontSize: 40 + z * 40, color: "#8EC8FF", opacity: Math.sin(z * Math.PI) * 0.8 }}>z</div>;
      })}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {ks.map((k, i) => {
          const r = lin(frame, fps, k, k + 0.7);
          return t >= k ? <circle key={i} cx={KX} cy={KY} r={20 + r * 260} fill="none" stroke={T.red} strokeWidth={7} opacity={1 - r} /> : null;
        })}
      </svg>
      <Tag text="STILL ASLEEP" p={after} color={T.text} style={{ left: 110, top: 700 }} />
    </AbsoluteFill>
  );
};

// 6 ─ Theo's door swings open on a flashlight. The bed is empty.
export const EmptyBed: React.FC<Beat & { doorAt: number; emptyAt: number }> = ({ doorAt, emptyAt, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d0 = doorAt - beatStart, e0 = emptyAt - beatStart;
  const open = interpolate(frame, [d0 * fps, (d0 + 0.9) * fps], [0, 1], ease);
  const beam = interpolate(frame, [d0 * fps, e0 * fps], [0, 1], ease);
  const hit = sp(frame, fps, e0, SPRINGS.slam);
  const s = shake(frame, fps, e0, 20, 0.16);
  const FX = 240, FY = 360, FW = 600, FH = 880; // door frame
  const bx = interpolate(beam, [0, 1], [700, 540]), by = interpolate(beam, [0, 1], [600, 960]);
  return (
    <AbsoluteFill style={{ background: NIGHT, translate: `${s.x}px ${s.y}px` }}>
      <div style={{ position: "absolute", left: FX - 30, top: FY - 30, width: FW + 60, height: FH + 30, background: "#161A26" }} />
      {/* room behind the door */}
      <div style={{ position: "absolute", left: FX, top: FY, width: FW, height: FH, overflow: "hidden", background: "#07080D" }}>
        <svg width={FW} height={FH} style={{ position: "absolute" }}>
          <rect y={560} width={FW} height={320} fill="#0D0F18" />
          {/* bed: headboard, pillow with a dent, blanket thrown back */}
          <rect x={90} y={430} width={420} height={150} rx={16} fill="#2A2234" />
          <rect x={110} y={560} width={380} height={240} rx={18} fill="#3A3F55" />
          <ellipse cx={300} cy={600} rx={120} ry={40} fill="#C9CEDA" />
          <ellipse cx={300} cy={606} rx={60} ry={16} fill="#A9AFBD" />
          <path d="M110 700 Q220 650 300 700 T490 690 L490 800 L110 800 Z" fill="#2E5A9C" />
          <path d="M110 700 Q220 650 300 700 T490 690" stroke="#3F6FB5" strokeWidth={10} fill="none" />
        </svg>
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${bx - FX}px ${by - FY}px, transparent 0%, transparent 18%, #000000F2 42%)` }} />
        <AbsoluteFill style={{ background: T.red, opacity: hit * 0.12, mixBlendMode: "screen" }} />
      </div>
      {/* door panel swinging open */}
      <div style={{ position: "absolute", left: FX, top: FY, width: FW, height: FH, background: "linear-gradient(90deg,#2B2F3E,#1E2130)",
        transformOrigin: "0% 50%", transform: `perspective(1400px) rotateY(${-open * 80}deg)`, border: "4px solid #11131C" }}>
        <div style={{ position: "absolute", right: 40, top: FH / 2, width: 26, height: 26, borderRadius: "50%", background: "#8A847B" }} />
      </div>
      <Tag text="3:12 AM" p={sp(frame, fps, 0.1, SPRINGS.snappy)} style={{ left: 64, top: 300 }} />
      <Tag text="EMPTY" p={hit} style={{ left: 420, top: 1120, fontSize: 52 }} />
    </AbsoluteFill>
  );
};

// 7 ─ Hallway in one-point perspective. The carpet runner pulls tight toward the end wall.
export const CarpetPull: React.FC<Beat & { pullAt: number; wallAt: number }> = ({ pullAt, wallAt, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p0 = pullAt - beatStart, w0 = wallAt - beatStart;
  const pull = interpolate(frame, [(p0 - 0.1) * fps, (p0 + 0.8) * fps], [0, 1], ease);
  const glow = sp(frame, fps, w0, SPRINGS.slam);
  const s = shake(frame, fps, w0, 18, 0.16);
  const push = 1 + interpolate(frame, [0, (w0 + 1.2) * fps], [0, 0.25], clamp);
  const VX = 540, top = 300, floor = 1250, EL = 400, ER = 680, ET = 520, EB = 760;
  const near = 1250 - pull * 140; // the near edge of the runner lifts away from us
  const runner = `M330 ${near} L750 ${near} L${VX + 50} ${EB} L${VX - 50} ${EB} Z`;
  return (
    <AbsoluteFill style={{ background: NIGHT, translate: `${s.x}px ${s.y}px` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", scale: String(push), transformOrigin: `${VX}px ${(ET + EB) / 2}px` }}>
        <polygon points={`80,${top} ${EL},${ET} ${EL},${EB} 80,${floor}`} fill="#121522" />
        <polygon points={`1000,${top} ${ER},${ET} ${ER},${EB} 1000,${floor}`} fill="#101320" />
        <polygon points={`80,${top} 1000,${top} ${ER},${ET} ${EL},${ET}`} fill="#0B0D16" />
        <polygon points={`80,${floor} 1000,${floor} ${ER},${EB} ${EL},${EB}`} fill="#1A1610" />
        {[0.15, 0.35, 0.6].map((k) => {
          const y = EB + (floor - EB) * k;
          return <line key={k} x1={EL - (EL - 80) * k} y1={y} x2={ER + (1000 - ER) * k} y2={y} stroke="#14110C" strokeWidth={3} />;
        })}
        {/* end wall with the seam */}
        <rect x={EL} y={ET} width={ER - EL} height={EB - ET} fill="#171B2A" />
        <line x1={VX} y1={ET} x2={VX} y2={EB} stroke={T.red} strokeWidth={4 + glow * 6} opacity={0.3 + glow * 0.7} />
        <rect x={EL} y={ET} width={ER - EL} height={EB - ET} fill={T.red} opacity={glow * 0.18} />
        {/* runner and its wrinkles, all pointing at the wall */}
        <path d={runner} fill="#5A1E22" />
        {[0.2, 0.4, 0.6, 0.8].map((k, i) => {
          const y = near + (EB - near) * k;
          const half = interpolate(k, [0, 1], [210, 50]);
          const p = interpolate(pull, [i * 0.15, i * 0.15 + 0.4], [0, 1], clamp);
          return <path key={k} d={`M${VX - half} ${y + 10} L${VX} ${y - 18 * p} L${VX + half} ${y + 10}`} stroke="#3A1013"
            strokeWidth={8} fill="none" opacity={p} />;
        })}
      </svg>
      {/* flashlight */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${VX + Math.sin(t * 1.7) * 30}px ${880 + Math.cos(t * 1.3) * 20}px, transparent 0%, transparent 22%, #000000D8 55%)` }} />
      <Tag text="PULLED TIGHT" p={sp(frame, fps, p0 + 0.3, SPRINGS.bouncy)} color={T.text} style={{ left: 64, top: 1110 }} />
      <Tag text="TOWARD THE WALL" p={glow} style={{ left: 380, top: 440 }} />
    </AbsoluteFill>
  );
};
