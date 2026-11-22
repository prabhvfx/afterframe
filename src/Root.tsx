import React from "react";
import { Composition } from "remotion";
import { StoryVertical, Story } from "./StoryVertical";
import p1preview from "../stories/rosenhan/part1-preview.resolved.json";

const story = p1preview as unknown as Story;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="RosenhanP1Preview"
      component={StoryVertical}
      fps={story.fps}
      width={1080}
      height={1920}
      durationInFrames={Math.round(story.durationSeconds * story.fps)}
      defaultProps={{ story, sfxFile: "sfx/part1-preview.wav" }}
    />
  </>
);
