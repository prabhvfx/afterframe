import React from "react";
import { T } from "../theme";

// Citicorp Center as a clean vector elevation (viewBox 0 0 400 1000):
// 45° sloped crown, shaft with window bands, eight tiers of chevron bracing
// (x-ray), and the base on mid-side stilts with open corners.
export const TOWER = {
  left: 100,
  right: 300,
  crownL: 240, // crown height at left edge
  crownR: 40, // crown height at right edge (45° slope over 200 units)
  shaftBottom: 820,
  ground: 960,
  tiers: 8,
};

const tierEdges = () => {
  const top = TOWER.crownL;
  const h = (TOWER.shaftBottom - top) / TOWER.tiers;
  return Array.from({ length: TOWER.tiers }, (_, i) => ({ yt: top + i * h, yb: top + (i + 1) * h }));
};

// joint positions (center of each chevron apex) in viewBox units
export const towerJoints = () => tierEdges().map((t) => ({ x: 200, y: t.yt }));

export const Tower: React.FC<{
  draw?: number; // 0..1 line draw-on
  xray?: number; // 0..1 chevron bracing visibility
  stroke?: string;
  fill?: string;
  jointGlow?: number; // 0..1 highlight joints
  showBase?: boolean;
  style?: React.CSSProperties;
}> = ({ draw = 1, xray = 0, stroke = T.text, fill = "#1B191F", jointGlow = 0, showBase = true, style }) => {
  const { left: L, right: R, crownL, crownR, shaftBottom: B, ground: G } = TOWER;
  const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw } as const;
  const bands: string[] = [];
  for (let y = crownL + 14; y < B; y += 14) bands.push(`M${L + 6} ${y} H${R - 6}`);
  // crown band lines follow the slope region
  for (let y = crownR + 20; y < crownL; y += 14) {
    const xStart = L + (crownL - y); // on the 45° slope
    bands.push(`M${Math.max(L + 6, xStart + 4)} ${y} H${R - 6}`);
  }
  const chevrons = tierEdges()
    .map(({ yt, yb }) => `M${L} ${yb} L200 ${yt} L${R} ${yb}`)
    .join(" ");
  return (
    <svg viewBox="0 0 400 1000" style={style}>
      <path d={`M${L} ${B} V${crownL} L${R} ${crownR} V${B} Z`} fill={fill} opacity={draw} />
      <path d={bands.join(" ")} stroke={stroke} strokeOpacity={0.22} strokeWidth={2} fill="none" {...dash} />
      <path d={`M${L} ${B} V${crownL} L${R} ${crownR} V${B} Z`} fill="none" stroke={stroke} strokeWidth={5}
        strokeLinejoin="round" {...dash} />
      <path d={chevrons} fill="none" stroke={T.yellow} strokeWidth={4} opacity={xray} strokeLinejoin="round" />
      {xray > 0 &&
        towerJoints().map((j, i) => (
          <circle key={i} cx={j.x} cy={j.y} r={7 + jointGlow * 7} fill={jointGlow > 0 ? T.red : T.yellow}
            opacity={xray} />
        ))}
      {showBase && (
        <g opacity={draw}>
          {/* stilt at the middle of the visible face, core behind, open corners */}
          <rect x={186} y={B} width={28} height={G - B} fill={stroke} />
          <rect x={232} y={B} width={14} height={G - B} fill={stroke} opacity={0.35} />
          <path d={`M60 ${G} H340`} stroke={stroke} strokeWidth={5} />
        </g>
      )}
    </svg>
  );
};
