import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

// Flat vector character busts (viewBox 0 0 600 700). Each character is data:
// colors + hair/outfit shapes. They blink on their own clock and only move
// their mouth inside [talkFrom, talkTo] (seconds, local to the sequence).
export type CharacterId = "nadia" | "theo" | "albrecht";

export type Look = {
  skin: string;
  skinShade: string;
  hair: string;
  top: string;
  topShade: string;
  glasses: boolean;
  blinkOffset: number;
};

export const LOOKS: Record<CharacterId, Look> = {
  nadia: { skin: "#C68A64", skinShade: "#A8704E", hair: "#17110F", top: "#2F4A6E", topShade: "#243A57", glasses: true, blinkOffset: 0 },
  theo: { skin: "#E2B490", skinShade: "#C8946F", hair: "#6A4428", top: "#8C2B2B", topShade: "#6E2020", glasses: false, blinkOffset: 1.3 },
  albrecht: { skin: "#E8C3A6", skinShade: "#CFA285", hair: "#B9B6B0", top: "#7B6A93", topShade: "#62547A", glasses: false, blinkOffset: 0.7 },
};

// Name-plate and speech-bubble color per character.
export const CAST_COLORS: Record<CharacterId, string> = { nadia: "#FFB46B", theo: "#8EC8FF", albrecht: "#C9A7F0" };

const HairBack: React.FC<{ id: CharacterId; c: string }> = ({ id, c }) =>
  id === "nadia" ? (
    <path d="M138 300 C120 150 210 100 300 100 C390 100 480 150 462 300 L470 455 C430 478 392 462 380 430 L220 430 C208 462 170 478 130 455 Z" fill={c} />
  ) : id === "albrecht" ? (
    <path d="M140 300 C120 160 210 100 300 100 C390 100 480 160 460 300 L455 385 C430 400 400 390 390 362 L210 362 C200 390 170 400 145 385 Z" fill={c} />
  ) : null;

const HairFront: React.FC<{ id: CharacterId; c: string }> = ({ id, c }) =>
  id === "nadia" ? (
    <path d="M146 262 C150 150 222 110 300 110 C378 110 450 150 454 262 C430 232 380 218 330 214 L300 236 L285 214 C225 218 176 232 146 262 Z" fill={c} />
  ) : id === "albrecht" ? (
    <path d="M150 270 C150 150 225 108 300 108 C375 108 450 150 450 270 C440 230 410 205 370 200 C350 225 320 230 300 215 C280 230 250 225 230 200 C190 205 160 230 150 270 Z" fill={c} />
  ) : (
    <path d="M150 282 C138 150 222 112 300 112 C382 112 466 148 452 282 L436 214 L410 246 L392 192 L360 236 L334 180 L304 228 L272 176 L244 232 L216 188 L196 246 L168 206 Z" fill={c} />
  );

export const Character: React.FC<{
  id: CharacterId;
  talkFrom?: number;
  talkTo?: number;
  worry?: number; // 0..1 brow tilt
  night?: boolean;
  style?: React.CSSProperties;
  look?: Partial<Look>; // outfit changes, e.g. Theo's new blue hoodie
  asleep?: boolean;
}> = ({ id, talkFrom = -1, talkTo = -1, worry = 0, night = false, style, look, asleep = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = { ...LOOKS[id], ...look };
  const t = frame / fps;
  // blink: 0.1 s closed every ~3.4 s, offset per character
  const cycle = (t + L.blinkOffset) % 3.4;
  const lid = asleep || cycle < 0.1 ? 0.12 : 1;
  const talking = t >= talkFrom && t <= talkTo;
  const open = talking ? Math.max(0, Math.sin(frame * 0.95) * 0.6 + Math.sin(frame * 0.37) * 0.4) : 0;
  const bob = Math.sin(t * 1.6 + L.blinkOffset) * 3 + (talking ? Math.sin(frame * 0.5) * 2 : 0);
  const brow = worry * 14;
  return (
    <svg viewBox="0 0 600 700" style={{ overflow: "visible", ...style }}>
      <g style={{ translate: `0 ${bob}px`, filter: night ? "brightness(0.42) saturate(0.55) hue-rotate(-12deg)" : undefined }}>
        {/* torso */}
        <path d="M40 700 C40 560 140 505 300 500 C460 505 560 560 560 700 Z" fill={L.top} />
        {id === "theo" && (
          <>
            <path d="M170 520 C200 470 400 470 430 520 C400 560 200 560 170 520 Z" fill={L.topShade} />
            <path d="M262 545 V625 M338 545 V625" stroke="#EDE6DA" strokeWidth={7} strokeLinecap="round" />
          </>
        )}
        {id === "nadia" && <path d="M230 505 Q300 560 370 505" stroke={L.topShade} strokeWidth={22} fill="none" />}
        {id === "albrecht" && (
          <>
            <path d="M232 506 L300 640 L368 506 Z" fill="#EDE6DA" />
            <path d="M232 506 L300 640 M368 506 L300 640" stroke={L.topShade} strokeWidth={14} />
            {[662, 692].map((y) => <circle key={y} cx={300} cy={y} r={7} fill={L.topShade} />)}
          </>
        )}
        <rect x={258} y={400} width={84} height={120} rx={30} fill={L.skinShade} />
        <HairBack id={id} c={L.hair} />
        <ellipse cx={300} cy={300} rx={150} ry={172} fill={L.skin} />
        <ellipse cx={152} cy={318} rx={18} ry={30} fill={L.skinShade} />
        <ellipse cx={448} cy={318} rx={18} ry={30} fill={L.skinShade} />
        <HairFront id={id} c={L.hair} />
        {/* brows */}
        <path d={`M205 ${272 - brow} L268 ${272 + brow * 0.3}`} stroke={L.hair} strokeWidth={11} strokeLinecap="round" />
        <path d={`M332 ${272 + brow * 0.3} L395 ${272 - brow}`} stroke={L.hair} strokeWidth={11} strokeLinecap="round" />
        {/* eyes */}
        {[240, 360].map((x) => (
          <ellipse key={x} cx={x} cy={322} rx={14} ry={18 * lid} fill="#141012" />
        ))}
        {[240, 360].map((x) => (
          <circle key={`h${x}`} cx={x + 5} cy={315} r={4} fill="#fff" opacity={lid > 0.5 ? 0.9 : 0} />
        ))}
        {L.glasses && (
          <g stroke="#141012" strokeWidth={7} fill="none">
            <circle cx={240} cy={322} r={44} />
            <circle cx={360} cy={322} r={44} />
            <path d="M284 318 Q300 308 316 318" />
          </g>
        )}
        {id === "albrecht" && (
          <g stroke={L.skinShade} strokeWidth={5} fill="none" strokeLinecap="round">
            <path d="M196 340 Q204 352 214 350 M404 340 Q396 352 386 350 M262 448 Q300 458 338 448" />
          </g>
        )}
        {/* nose + mouth */}
        <path d="M300 340 Q290 372 304 376" stroke={L.skinShade} strokeWidth={7} fill="none" strokeLinecap="round" />
        {open > 0.05 ? (
          <ellipse cx={300} cy={418} rx={26} ry={4 + open * 20} fill="#3A1418" />
        ) : (
          <path d={`M272 ${418} Q300 ${424 - worry * 10} 328 ${418}`} stroke="#3A1418" strokeWidth={8} fill="none" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
};
