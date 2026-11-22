import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { T } from "./theme";
import { Grain, PartBadge } from "./components/Chrome";
import { Captions, VoiceLine } from "./components/Captions";
import { KineticTitle } from "./beats/KineticTitle";
import { Blueprint } from "./beats/Blueprint";
import { ArchivalCard } from "./beats/ArchivalCard";
import { Slam } from "./beats/Slam";
import { Checklist } from "./beats/Checklist";
import { Stamp } from "./beats/Stamp";
import { TowerHero, DocStamp, TowerStats, TowerBase, FootprintPlan } from "./beats/TowerBeats";
import { ListingCount, CharacterCard, MeasureGap, KnockNight, DrillHole } from "./beats/HorrorBeats";
import { TimelineScrubber, WindDiagram, CalcSheet, BigCounter, JointZoom, NextPart } from "./beats/EvidenceBeats";

export type Beat = {
  id: string;
  start: number;
  end: number;
  component: string;
  noCaptions?: boolean;
  props: Record<string, unknown>;
};

export type Story = {
  id: string;
  title: string;
  part: number;
  totalParts: number;
  fps: number;
  durationSeconds: number;
  captionHighlights?: string[];
  voice: { file: string; lines: VoiceLine[] };
  beats: Beat[];
};

// Storyboard component registry: JSON "component" name -> React component.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, React.FC<any>> = {
  KineticTitle, Blueprint, ArchivalCard, Slam, Checklist, Stamp,
  TowerHero, DocStamp, TowerStats, TowerBase, FootprintPlan,
  TimelineScrubber, WindDiagram, CalcSheet, BigCounter, JointZoom, NextPart,
  ListingCount, CharacterCard, MeasureGap, KnockNight, DrillHole,
};

export const StoryVertical: React.FC<{ story: Story; sfxFile: string }> = ({ story, sfxFile }) => {
  const { fps } = useVideoConfig();
  const quiet = story.beats.filter((b) => b.noCaptions);
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      {story.beats.map((b) => {
        const C = REGISTRY[b.component];
        if (!C) throw new Error(`Unknown component "${b.component}" in beat "${b.id}"`);
        const from = Math.round(b.start * fps);
        const len = Math.max(1, Math.round(b.end * fps) - from);
        return (
          <Sequence key={b.id} name={b.id} from={from} durationInFrames={len}>
            <C {...b.props} beatStart={b.start} dur={b.end - b.start} />
          </Sequence>
        );
      })}
      <Captions
        lines={story.voice.lines}
        hl={story.captionHighlights}
        hidden={(t) => quiet.some((b) => t >= b.start && t < b.end)}
      />
      <PartBadge part={story.part} total={story.totalParts} title={story.title} />
      <Grain />
      <Audio src={staticFile(story.voice.file)} />
      <Audio src={staticFile(sfxFile)} volume={0.85} />
    </AbsoluteFill>
  );
};
