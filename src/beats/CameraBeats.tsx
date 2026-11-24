import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";
import { clamp, lin, shake, sp, SPRINGS } from "../components/anim";
import { Tag } from "./TowerBeats";
import { BlueGrid, DAY } from "./HorrorBeats";

// Seventh Room Part 2 beats: recap, inspection camera, the feed, the pencil plan.
type Beat = { beatStart: number; dur: number };

export const PENCIL = "#55534F";
const HOODIE = "#3F6FB5";
const ease = { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) };

// 1 ─ Recap: three cards slam in, one per fact from Part 1.
type RecapItem = { at: number; label: string; sub: string; icon: "gap" | "knock" | "hole" | "bed" };
const RecapIcon: React.FC<{ icon: RecapItem["icon"] }> = ({ icon }) => (
  <svg width={150} height={150} viewBox="0 0 150 150">
    {icon === "gap" && (
      <>
        <rect x={20} y={20} width={22} height={110} fill={T.text} />
        <rect x={108} y={20} width={22} height={110} fill={T.text} />
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={46} y1={36 + i * 22} x2={104} y2={14 + i * 22} stroke={T.red} strokeWidth={6} />)}
      </>
    )}
    {icon === "knock" && [0, 1, 2].map((i) => (
      <circle key={i} cx={75} cy={75} r={20 + i * 22} fill="none" stroke={i === 0 ? T.red : T.text} strokeWidth={7} opacity={1 - i * 0.25} />
    ))}
    {icon === "hole" && (
      <>
        <rect x={10} y={10} width={130} height={130} rx={14} fill="#BDB3A3" />
        <circle cx={75} cy={75} r={30} fill="#000" stroke="#9C9182" strokeWidth={7} />
      </>
    )}
    {icon === "bed" && (
      <>
        <rect x={14} y={40} width={22} height={80} rx={6} fill={T.text} />
        <rect x={36} y={78} width={100} height={30} rx={8} fill={T.text} />
        <rect x={44} y={62} width={36} height={18} rx={8} fill={T.red} />
      </>
    )}
  </svg>
);

export const RecapStrip: React.FC<Beat & { items: RecapItem[] }> = ({ items, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = sp(frame, fps, 0, SPRINGS.snappy);
  const last = items[items.length - 1].at - beatStart;
  const s = shake(frame, fps, last, 10, 0.12);
  return (
    <AbsoluteFill style={{ background: DAY, translate: `${s.x}px ${s.y}px` }}>
      <BlueGrid opacity={0.08} />
      <div style={{ position: "absolute", top: 330, left: 90, fontFamily: T.mono, fontSize: 32, letterSpacing: 8, color: T.muted,
        opacity: head }}>PREVIOUSLY</div>
      {items.map((it, i) => {
        const p = sp(frame, fps, it.at - beatStart - 0.05, SPRINGS.slam);
        return (
          <div key={i} style={{ position: "absolute", left: 90, right: 90, top: 400 + i * 270, height: 230, borderRadius: 24,
            background: "#161B27", borderLeft: `12px solid ${T.red}`, display: "flex", alignItems: "center", gap: 40, padding: "0 40px",
            opacity: Math.min(1, p * 2), translate: `${(1 - p) * 700}px 0`, rotate: `${(1 - p) * 4}deg` }}>
            <RecapIcon icon={it.icon} />
            <div>
              <div style={{ fontFamily: T.display, fontWeight: 900, fontSize: 92, lineHeight: 1, color: T.text, letterSpacing: -2 }}>{it.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: 32, letterSpacing: 5, color: T.muted, marginTop: 10 }}>{it.sub}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Small lens head on a cable. Drawn pointing right, origin at the lens tip.
const LensHead: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <rect x={-150} y={-26} width={130} height={52} rx={10} fill="#2A2A2E" />
    <rect x={-40} y={-30} width={40} height={60} rx={8} fill={T.yellow} />
    <circle cx={0} cy={0} r={18} fill="#0A0B10" />
    <circle cx={-5} cy={-6} r={6} fill="#ffffff" opacity={0.6} />
  </g>
);

// 2 ─ Inspection camera: phone, coiled cable unrolls, lens close-up.
export const CameraKit: React.FC<Beat & { lensAt: number }> = ({ lensAt, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l0 = lensAt - beatStart;
  const enter = sp(frame, fps, 0, SPRINGS.bouncy);
  const draw = interpolate(frame, [0.15 * fps, 1.3 * fps], [0, 1], ease);
  const lens = sp(frame, fps, l0 - 0.05, SPRINGS.bouncy);
  const title = sp(frame, fps, 0.2, SPRINGS.snappy);
  const cable = "M330 1150 C330 1240 520 1250 560 1120 S 520 860 700 820 S 900 840 860 700";
  return (
    <AbsoluteFill style={{ background: DAY }}>
      <BlueGrid opacity={0.1} />
      <Tag text="INSPECTION CAMERA" p={title} color={T.yellow} style={{ left: 90, top: 330 }} />
      {/* phone */}
      <div style={{ position: "absolute", left: 120, top: 460, width: 420, height: 700, borderRadius: 56, background: "#0B0C10",
        border: "4px solid #2A2D36", translate: `${(1 - enter) * -600}px 0`, rotate: "-6deg", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 18, borderRadius: 40, background: "#1E2620", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,#ffffff10 0 2px,transparent 2px 6px)" }} />
          <div style={{ position: "absolute", top: 30, left: 28, fontFamily: T.mono, fontSize: 24, color: T.red }}>● CAM 01</div>
          <div style={{ position: "absolute", top: 290, left: 0, right: 0, textAlign: "center", fontFamily: T.mono, fontSize: 26,
            color: "#9FB09A", letterSpacing: 4 }}>NO SIGNAL</div>
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path d={cable} stroke="#1A1A1E" strokeWidth={16} fill="none" strokeLinecap="round" pathLength={1}
          strokeDasharray={1} strokeDashoffset={1 - draw} />
        <g transform="translate(860 700) rotate(-80)" opacity={draw > 0.95 ? 1 : 0}>
          <LensHead scale={1 + lens * 0.15} />
        </g>
        {/* lens close-up inset */}
        <g opacity={lens} transform={`translate(760 430) scale(${0.6 + 0.4 * lens})`}>
          <circle r={120} fill="#0F1420" stroke={T.yellow} strokeWidth={6} />
          <circle r={70} fill="#0A0B10" stroke="#2A2A2E" strokeWidth={16} />
          <circle r={34} fill="#141A2E" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 52} cy={Math.sin((a * Math.PI) / 180) * 52} r={7} fill="#FFF6D0" />
          ))}
          <circle cx={-12} cy={-12} r={10} fill="#fff" opacity={0.5} />
        </g>
      </svg>
      <Tag text="8 MM LENS · LED RING" p={lens} color={T.text} style={{ left: 540, top: 580 }} />
    </AbsoluteFill>
  );
};

// 3 ─ Wall close-up: the cable slides into the drilled hole.
export const CableInsert: React.FC<Beat & { pushAt: number }> = ({ pushAt, beatStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p0 = pushAt - beatStart;
  const CX = 540, CY = 740;
  const push = interpolate(frame, [(p0 - 0.3) * fps, (p0 + 0.9) * fps], [0, 1], ease);
  const tipX = interpolate(push, [0, 0.7, 1], [CX + 330, CX + 40, CX]);
  const tipY = interpolate(push, [0, 0.7, 1], [CY + 330, CY + 30, CY]);
  const sink = interpolate(push, [0.7, 1], [1, 0.55], clamp);
  const zoom = 1 + lin(frame, fps, 0, 2.2) * 0.12;
  return (
    <AbsoluteFill style={{ background: "#BDB3A3", scale: String(zoom), transformOrigin: `${CX}px ${CY}px` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <filter id="plaster2"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="9" />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.28  0 0 0 0.35 0" /></filter>
        <rect width="1080" height="1920" filter="url(#plaster2)" />
        <circle cx={CX} cy={CY} r={34} fill="#000" stroke="#9C9182" strokeWidth={6} />
        {/* cable runs off frame to the bottom right */}
        <path d={`M${tipX} ${tipY} Q ${tipX + 200} ${tipY + 120} 1180 1500`} stroke="#1A1A1E" strokeWidth={14} fill="none" strokeLinecap="round" />
        <g transform={`translate(${tipX} ${tipY}) rotate(-135)`} opacity={push < 1 ? 1 : 0}>
          <LensHead scale={sink * 0.8} />
        </g>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 40% 35%, #FFF1D633, transparent 55%), linear-gradient(180deg, transparent 60%, #00000066)" }} />
      <Tag text="INTO THE GAP" p={sp(frame, fps, p0 + 0.5, SPRINGS.bouncy)} style={{ left: 220, top: 560 }} />
    </AbsoluteFill>
  );
};

// Camera moves through [time, centerX, centerY, zoom] keys, easing 0.9 s into each.
const camera = (t: number, keys: [number, number, number, number][]) => {
  let [, x, y, z] = keys[0];
  for (const [kt, kx, ky, kz] of keys.slice(1)) {
    const p = interpolate(t, [kt - 0.15, kt + 0.75], [0, 1], ease);
    x += (kx - x) * p;
    y += (ky - y) * p;
    z += (kz - z) * p;
  }
  return { x, y, z };
};

// The hidden room, seen through the lens. Scene space is 2000 x 940, tinted green-grey.
const RoomScene: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={2000} height={940} fill="#3E463B" />
    {Array.from({ length: 22 }).map((_, i) => <line key={i} x1={i * 92} y1={0} x2={i * 92} y2={690} stroke="#343B32" strokeWidth={4} />)}
    <rect y={690} width={2000} height={22} fill="#2F352D" />
    <rect y={712} width={2000} height={228} fill="#262B24" />
    {[760, 830, 910].map((y) => <line key={y} x1={0} y1={y} x2={2000} y2={y} stroke="#20241E" strokeWidth={3} />)}
    {/* cobweb */}
    <path d="M0 0 L140 0 M0 0 L0 140 M0 0 L120 90 M30 0 Q30 30 0 30 M70 0 Q65 60 0 70 M110 0 Q100 95 0 110" stroke="#9AA694" strokeWidth={2} fill="none" opacity={0.5} />
    {/* chair, back to us, facing the far wall */}
    <g>
      <rect x={530} y={560} width={220} height={26} fill="#5A5144" />
      <rect x={545} y={340} width={20} height={380} fill="#6B6152" />
      <rect x={715} y={340} width={20} height={380} fill="#6B6152" />
      <rect x={545} y={340} width={190} height={34} fill="#6B6152" />
      {[600, 640, 680].map((x) => <rect key={x} x={x} y={374} width={12} height={186} fill="#5E5547" />)}
      <rect x={540} y={586} width={14} height={130} fill="#4A4338" />
      <rect x={726} y={586} width={14} height={130} fill="#4A4338" />
    </g>
    {/* desk with the paper and a pencil */}
    <g>
      <path d="M1180 520 L1720 520 L1760 590 L1140 590 Z" fill="#5E5547" />
      <rect x={1140} y={590} width={620} height={30} fill="#4A4338" />
      <rect x={1160} y={620} width={24} height={100} fill="#3E382F" />
      <rect x={1716} y={620} width={24} height={100} fill="#3E382F" />
      <path d="M1330 530 L1530 528 L1548 578 L1316 580 Z" fill="#C9D1BE" />
      <g stroke="#6F7868" strokeWidth={2.5} fill="none">
        <path d="M1345 536 L1515 535 L1527 572 L1335 573 Z" />
        <path d="M1420 535 L1418 573 M1340 552 L1521 552 M1480 552 L1482 573" />
      </g>
      <path d="M1500 540 L1515 548" stroke="#8B2A22" strokeWidth={3} />
      <rect x={1560} y={560} width={110} height={8} rx={3} fill="#B8A24A" transform="rotate(-8 1560 560)" />
    </g>
    {/* drifting dust */}
    {Array.from({ length: 34 }).map((_, i) => {
      const x = (i * 241 + t * (8 + (i % 5) * 3)) % 2000;
      const y = 120 + ((i * 97) % 560) + Math.sin(t * 0.8 + i) * 18;
      return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill="#DDE6D5" opacity={0.35} />;
    })}
  </g>
);

// 4 ─ Phone feed: static, then the room, the chair, the desk, the paper.
export const PhoneFeed: React.FC<Beat & { roomAt: number; chairAt: number; deskAt: number; paperAt: number }> = ({
  roomAt, chairAt, deskAt, paperAt, beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const r0 = roomAt - beatStart, c0 = chairAt - beatStart, d0 = deskAt - beatStart, p0 = paperAt - beatStart;
  const SW = 860, SH = 940;
  const cam = camera(t, [[0, 1000, 470, 0.62], [c0, 640, 520, 1.25], [d0, 1450, 560, 1.15], [p0, 1432, 554, 3.4]]);
  const wob = { x: Math.sin(t * 1.3) * 6 + Math.sin(t * 3.1) * 2, y: Math.cos(t * 1.1) * 5 };
  const snow = interpolate(t, [r0 - 0.15, r0 + 0.25], [1, 0.16], clamp);
  const enter = sp(frame, fps, 0, SPRINGS.snappy);
  const label = t >= p0 ? "PAPER" : t >= d0 ? "DESK" : t >= c0 ? "CHAIR · FACING THE WALL" : t >= r0 ? "NARROW · NO DOOR" : "CONNECTING";
  const labelAt = t >= p0 ? p0 : t >= d0 ? d0 : t >= c0 ? c0 : t >= r0 ? r0 : 0;
  const labelP = sp(frame, fps, labelAt, SPRINGS.snappy);
  return (
    <AbsoluteFill style={{ background: "#07080B" }}>
      <div style={{ position: "absolute", left: 90, top: 290, width: 900, height: 980, borderRadius: 70, background: "#0B0C10",
        border: "4px solid #2A2D36", scale: String(0.92 + 0.08 * enter) }}>
        <div style={{ position: "absolute", left: 16, top: 16, width: SW, height: SH, borderRadius: 56, overflow: "hidden", background: "#111" }}>
          <svg width={SW} height={SH} style={{ position: "absolute" }}>
            <defs>
              <filter id="snow"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed={frame % 7} />
                <feColorMatrix values="0 0 0 0 0.8  0 0 0 0 0.85  0 0 0 0 0.8  0 0 0 1.4 -0.2" /></filter>
            </defs>
            <g transform={`translate(${SW / 2 - cam.x * cam.z + wob.x} ${SH / 2 - cam.y * cam.z + wob.y}) scale(${cam.z})`}>
              <RoomScene t={t} />
            </g>
            <rect width={SW} height={SH} filter="url(#snow)" opacity={snow} />
          </svg>
          {/* lens vignette + scanlines */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 45%, #000000EE 85%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,#00000033 0 2px,transparent 2px 5px)" }} />
          <div style={{ position: "absolute", top: 36, left: 44, fontFamily: T.mono, fontSize: 28, color: T.red, opacity: Math.floor(t * 2) % 2 ? 1 : 0.3 }}>● REC</div>
          <div style={{ position: "absolute", top: 36, right: 44, fontFamily: T.mono, fontSize: 28, color: "#C8D4C0" }}>CAM 01</div>
          <div style={{ position: "absolute", bottom: 40, right: 44, fontFamily: T.mono, fontSize: 26, color: "#C8D4C0" }}>
            DEPTH {(0.1 + Math.min(0.32, Math.max(0, t - r0) * 0.03)).toFixed(2)} M
          </div>
          <div style={{ position: "absolute", bottom: 34, left: 40, fontFamily: T.mono, fontWeight: 700, fontSize: 30, color: T.ink,
            background: T.yellow, padding: "8px 16px", borderRadius: 8, opacity: labelP, scale: String(0.8 + 0.2 * labelP), transformOrigin: "0% 100%" }}>
            {label}
          </div>
          {/* viewfinder corners */}
          <svg width={SW} height={SH} style={{ position: "absolute" }}>
            {[[90, 120, 1, 1], [SW - 90, 120, -1, 1], [90, SH - 130, 1, -1], [SW - 90, SH - 130, -1, -1]].map(([x, y, sx, sy], i) => (
              <path key={i} d={`M${x} ${y + sy * 50} L${x} ${y} L${x + sx * 50} ${y}`} stroke="#C8D4C0" strokeWidth={4} fill="none" opacity={0.7} />
            ))}
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// The house as drawn by the Occupant. Plan units 900 x 900. [x, y, w, h, label]
export const ROOMS: [number, number, number, number, string][] = [
  [0, 0, 500, 330, "LIVING"], [500, 0, 400, 330, "KITCHEN"], [0, 330, 740, 120, "HALL"],
  [0, 450, 330, 450, "BED 1"], [330, 450, 310, 450, "BED 2"], [640, 450, 260, 230, "BATH"], [640, 680, 260, 220, "LAUNDRY"],
];
const THEO = { x: 485, y: 690 };

export const Figure: React.FC<{ x: number; y: number; p: number; hoodie?: boolean }> = ({ x, y, p, hoodie }) => (
  <g transform={`translate(${x} ${y})`} stroke={PENCIL} strokeWidth={5} fill="none" strokeLinecap="round">
    {hoodie && (
      <g opacity={p}>
        <path d="M-30 -32 L30 -32 L38 40 L-38 40 Z" fill={`${HOODIE}55`} stroke={HOODIE} strokeWidth={6} />
        {[-24, -10, 4, 18].map((o) => <line key={o} x1={o - 8} y1={36} x2={o + 14} y2={-28} stroke={HOODIE} strokeWidth={4} />)}
      </g>
    )}
    <circle cy={-62} r={24} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    <path d="M0 -38 L0 40 M-36 -10 L36 -10 M0 40 L-24 96 M0 40 L24 96" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </g>
);

// 5 ─ The pencil plan. Draws itself (drawAt), adds figures, zooms on Theo, circles the hoodie.
export const PencilPlan: React.FC<Beat & { drawAt?: number; houseAt?: number; figuresAt?: number; zoomAt?: number; hoodieAt?: number }> = ({
  drawAt, houseAt, figuresAt, zoomAt, hoodieAt, beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const loc = (v?: number) => (v === undefined ? undefined : v - beatStart);
  const d0 = loc(drawAt), h0 = loc(houseAt), f0 = loc(figuresAt), z0 = loc(zoomAt), k0 = loc(hoodieAt);
  const enter = sp(frame, fps, 0, SPRINGS.smooth);
  const roomP = (i: number) => (d0 === undefined ? 1 : interpolate(frame, [(d0 + i * 0.2) * fps, (d0 + i * 0.2 + 0.5) * fps], [0, 1], ease));
  const gapP = d0 === undefined ? 1 : sp(frame, fps, d0 + ROOMS.length * 0.2, SPRINGS.slam);
  const figP = f0 === undefined ? 0 : interpolate(frame, [f0 * fps, (f0 + 0.6) * fps], [0, 1], ease);
  const zoom = z0 === undefined ? 0 : sp(frame, fps, z0 - 0.1, SPRINGS.smooth);
  const ring = k0 === undefined ? 0 : interpolate(frame, [k0 * fps, (k0 + 0.45) * fps], [0, 1], ease);
  const s = k0 === undefined ? { x: 0, y: 0 } : shake(frame, fps, k0, 16, 0.14);
  const K = 0.88, OX = 42, OY = 40; // plan -> card px
  const fx = OX + THEO.x * K, fy = OY + THEO.y * K;
  const Z = 1 + zoom * 1.7;
  return (
    <AbsoluteFill style={{ background: "#0F0E0D", translate: `${s.x}px ${s.y}px` }}>
      <div style={{ position: "absolute", left: 64, top: 370, width: 876, height: 880, borderRadius: 18, overflow: "hidden",
        background: "#EDE7DA", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", translate: `0 ${(1 - enter) * 120}px`, opacity: enter }}>
        <div style={{ position: "absolute", inset: 0, scale: String(Z), transformOrigin: `${fx}px ${fy}px` }}>
          <svg width={876} height={880} style={{ position: "absolute" }}>
            <defs>
              <filter id="paperTex"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3" />
                <feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.36  0 0 0 0 0.3  0 0 0 0.12 0" /></filter>
              <filter id="hand"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="5" />
                <feDisplacementMap in="SourceGraphic" scale="5" /></filter>
              <pattern id="redHatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="16" stroke={T.red} strokeWidth="4" />
              </pattern>
            </defs>
            <rect width={876} height={880} filter="url(#paperTex)" />
            <g transform={`translate(${OX} ${OY}) scale(${K})`} filter="url(#hand)">
              {ROOMS.map(([x, y, w, h, name], i) => (
                <g key={name}>
                  <rect x={x} y={y} width={w} height={h} fill="none" stroke={PENCIL} strokeWidth={6} pathLength={1}
                    strokeDasharray={1} strokeDashoffset={1 - roomP(i)} />
                  <text x={x + w / 2} y={y + (name === "HALL" ? h / 2 + 12 : 50)} textAnchor="middle" fontFamily={T.body}
                    fontStyle="italic" fontWeight={500} fontSize={32} fill={PENCIL} opacity={roomP(i)}>{name}</text>
                </g>
              ))}
              {/* the seventh room, in red */}
              <g opacity={gapP}>
                <rect x={740} y={330} width={160} height={120} fill="url(#redHatch)" stroke={T.red} strokeWidth={6} />
                <text x={820} y={412} textAnchor="middle" fontFamily={T.display} fontWeight={900} fontSize={70} fill={T.red}
                  stroke="#EDE7DA" strokeWidth={8} paintOrder="stroke">7</text>
              </g>
              <Figure x={165} y={690} p={figP} />
              <Figure x={THEO.x} y={THEO.y} p={figP} hoodie />
              <circle cx={THEO.x} cy={THEO.y - 10} r={95} fill="none" stroke={T.yellow} strokeWidth={8} pathLength={1}
                strokeDasharray={1} strokeDashoffset={1 - ring} />
            </g>
          </svg>
        </div>
      </div>
      {h0 !== undefined && <Tag text="THEIR HOUSE" p={sp(frame, fps, h0, SPRINGS.bouncy)} color={T.yellow} style={{ left: 64, top: 300 }} />}
      {f0 !== undefined && <Tag text="2 PEOPLE" p={zoom > 0.5 ? 0 : sp(frame, fps, f0 + 0.4, SPRINGS.bouncy)} color={T.text} style={{ left: 64, top: 300 }} />}
      {k0 !== undefined && <Tag text="BLUE HOODIE" p={sp(frame, fps, k0 + 0.1, SPRINGS.slam)} style={{ left: 600, top: 300 }} />}
    </AbsoluteFill>
  );
};

// 6 ─ Proof: the receipt from yesterday next to the drawing. Stamp: drawn after move-in.
export const ReceiptProof: React.FC<Beat & { receiptAt: number; drawingAt: number; stampAt: number }> = ({
  receiptAt, drawingAt, stampAt, beatStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = sp(frame, fps, receiptAt - beatStart - 0.1, SPRINGS.bouncy);
  const d = sp(frame, fps, drawingAt - beatStart, SPRINGS.bouncy);
  const s0 = stampAt - beatStart;
  const st = sp(frame, fps, s0, SPRINGS.slam);
  const s = shake(frame, fps, s0, 22, 0.16);
  const row = (a: string, b: string, bold = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: bold ? 700 : 400 }}><span>{a}</span><span>{b}</span></div>
  );
  return (
    <AbsoluteFill style={{ background: DAY, translate: `${s.x}px ${s.y}px` }}>
      <BlueGrid opacity={0.08} />
      {/* receipt */}
      <div style={{ position: "absolute", left: 70, top: 360, width: 430, padding: "34px 30px 50px", background: "#F7F4EE", color: T.ink,
        fontFamily: T.mono, fontSize: 26, lineHeight: 1.6, rotate: `${-5 + (1 - r) * -10}deg`, translate: `${(1 - r) * -500}px 0`,
        clipPath: "polygon(0 0,100% 0,100% 96%,92% 100%,84% 96%,76% 100%,68% 96%,60% 100%,52% 96%,44% 100%,36% 96%,28% 100%,20% 96%,12% 100%,4% 96%,0 100%)" }}>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 30 }}>THREADLINE SUPPLY</div>
        <div style={{ textAlign: "center", color: "#7a7268" }}>RECEIPT #0412</div>
        <div style={{ borderTop: "3px dashed #bbb", margin: "16px 0" }} />
        {row("1 × HOODIE", "34.99")}
        {row("  COLOR: BLUE", "")}
        {row("TOTAL", "$34.99", true)}
        <div style={{ borderTop: "3px dashed #bbb", margin: "16px 0" }} />
        <div style={{ background: T.yellow, fontWeight: 700, padding: "4px 10px", display: "inline-block" }}>YESTERDAY · 5:42 PM</div>
      </div>
      {/* the drawing */}
      <div style={{ position: "absolute", right: 160, top: 540, width: 380, height: 460, background: "#EDE7DA", borderRadius: 10,
        rotate: `${4 + (1 - d) * 10}deg`, translate: `${(1 - d) * 500}px 0`, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
        <svg width={380} height={460} viewBox="330 450 310 450" preserveAspectRatio="xMidYMid meet">
          <rect x={335} y={455} width={300} height={440} fill="none" stroke={PENCIL} strokeWidth={6} />
          <text x={485} y={505} textAnchor="middle" fontFamily={T.body} fontStyle="italic" fontSize={32} fill={PENCIL}>BED 2</text>
          <Figure x={THEO.x} y={THEO.y} p={1} hoodie />
        </svg>
      </div>
      {/* stamp */}
      <div style={{ position: "absolute", left: 64, right: 140, top: 1020, textAlign: "center", opacity: Math.min(1, st * 2) }}>
        <div style={{ display: "inline-block", border: `10px solid ${T.red}`, color: T.red, borderRadius: 18, padding: "10px 36px",
          fontFamily: T.display, fontWeight: 900, fontSize: 88, lineHeight: 1, letterSpacing: -1, background: "#0D0C0ECC",
          rotate: "-8deg", scale: String(interpolate(st, [0, 1], [2.4, 1])) }}>
          DRAWN AFTER<br />THEY MOVED IN
        </div>
      </div>
    </AbsoluteFill>
  );
};
