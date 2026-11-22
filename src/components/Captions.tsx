import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { T, SAFE } from "../theme";
import { sp, SPRINGS } from "./anim";

export type VoiceWord = { text: string; start: number; end: number };
export type VoiceLine = { text: string; start: number; dur: number; emphasis?: boolean; words?: VoiceWord[] };
type Word = { text: string; start: number; end: number; line: number };

// Estimate word timings from line timings: TTS lines carry ~80ms lead-in and
// ~150ms tail, and word length tracks syllables well enough for captions.
// Swap in forced-alignment timestamps when available; the shape stays the same.
export const wordsFromLines = (lines: VoiceLine[]): Word[] => {
  const out: Word[] = [];
  lines.forEach((l, li) => {
    if (l.emphasis) return; // emphasis words are animated as on-screen graphics instead
    if (l.words) {
      // exact timestamps from the TTS engine
      l.words.forEach((w) => out.push({ ...w, line: li }));
      return;
    }
    const parts = l.text.split(/\s+/);
    const speech = Math.max(0.2, l.dur - 0.08 - 0.15);
    const weights = parts.map((w) => w.replace(/[^\w]/g, "").length + 2);
    const total = weights.reduce((a, b) => a + b, 0);
    let t = l.start + 0.08;
    parts.forEach((p, i) => {
      const d = (weights[i] / total) * speech;
      out.push({ text: p, start: t, end: t + d, line: li });
      t += d;
    });
  });
  return out;
};

// Chunk words into groups of up to `max` per screen, never across lines.
const chunk = (words: Word[], max: number) => {
  const groups: Word[][] = [];
  words.forEach((w) => {
    const g = groups[groups.length - 1];
    if (!g || g.length >= max || g[0].line !== w.line) groups.push([w]);
    else g.push(w);
  });
  return groups;
};

export const Captions: React.FC<{ lines: VoiceLine[]; y?: number; hl?: string[]; hidden?: (t: number) => boolean }> = ({
  lines,
  hidden,
  y = 1280,
  hl = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = chunk(wordsFromLines(lines), 3);
  const gi = groups.findIndex((g, i) => {
    const next = groups[i + 1];
    const end = next && next[0].line === g[0].line ? next[0].start : g[g.length - 1].end + 0.25;
    return t >= g[0].start - 0.03 && t < end;
  });
  if (gi < 0 || hidden?.(t)) return null;
  const g = groups[gi];
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: SAFE.left,
        right: SAFE.right,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 22px",
      }}
    >
      {g.map((w, i) => {
        const p = sp(frame, fps, w.start - 0.03, SPRINGS.bouncy);
        const active = t >= w.start && t < w.end + 0.05;
        const key = w.text.replace(/[^\w]/g, "").toLowerCase();
        const isHl = hl.includes(key);
        return (
          <span
            key={i}
            style={{
              fontFamily: T.display,
              fontWeight: 900,
              fontSize: 86,
              lineHeight: 1.12,
              textTransform: "uppercase",
              letterSpacing: -1,
              color: isHl ? T.yellow : T.text,
              opacity: Math.min(1, p * 1.4),
              scale: String(0.6 + 0.4 * p + (active ? 0.06 : 0)),
              translate: `0 ${(1 - p) * 40}px`,
              display: "inline-block",
              textShadow: "0 6px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.6)",
              WebkitTextStroke: "2px rgba(0,0,0,0.35)",
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
