import React from "react";
import { Composition } from "remotion";
import { StoryVertical, Story } from "./StoryVertical";
import rosenhanP1 from "../stories/rosenhan/part1-preview.resolved.json";
import citicorpP1 from "../stories/citicorp/part1.resolved.json";
import seventhP1 from "../stories/seventh-room/part1.resolved.json";
import seventhP2 from "../stories/seventh-room/part2.resolved.json";
import seventhP3 from "../stories/seventh-room/part3.resolved.json";
import seventhP4 from "../stories/seventh-room/part4.resolved.json";

// One entry per rendered episode: [composition id, resolved storyboard, sfx file]
const VERTICAL: [string, Story, string][] = [
  ["RosenhanP1Preview", rosenhanP1 as unknown as Story, "sfx/part1-preview.wav"],
  ["CiticorpP1", citicorpP1 as unknown as Story, "sfx/citicorp-p1.wav"],
  ["SeventhRoomP1", seventhP1 as unknown as Story, "sfx/seventh-room-p1.wav"],
  ["SeventhRoomP2", seventhP2 as unknown as Story, "sfx/seventh-room-p2.wav"],
  ["SeventhRoomP3", seventhP3 as unknown as Story, "sfx/seventh-room-p3.wav"],
  ["SeventhRoomP4", seventhP4 as unknown as Story, "sfx/seventh-room-p4.wav"],
];

export const RemotionRoot: React.FC = () => (
  <>
    {VERTICAL.map(([id, story, sfxFile]) => (
      <Composition
        key={id}
        id={id}
        component={StoryVertical}
        fps={story.fps}
        width={1080}
        height={1920}
        durationInFrames={Math.round(story.durationSeconds * story.fps)}
        defaultProps={{ story, sfxFile }}
      />
    ))}
  </>
);
