# Afterframe: project memory

This file carries the context from the original planning chat. Read it fully
before doing anything.

## What this is

A faceless animated storytelling brand, **Afterframe**, for Instagram Reels,
TikTok and YouTube. Hub-and-spoke model: each story becomes 4 vertical parts
(9:16, 1080x1920, 60fps, **at least 30 s each**, aim 40 to 55 s) that each end on
a cliffhanger, plus one YouTube long-form master (16:9, 6 to 12 min).

Style: code-driven motion design (vector shapes, kinetic type, diagrams, UI
cards, spring physics, a visual change every 2.5 to 4 s). Reference creators:
frames.explains, play.malo, nineties.exe, sabodominik_, making.w.malte,
whitelightai. **No AI video generation, no morphing clips.**

## The user's rules (follow exactly)

- **Writing style for every reply:** active voice, address the user as "you",
  direct and short, simple words, conversational. No fluff, no marketing
  language, no clichés or jargon. **Never use emojis, hashtags, semicolons,
  asterisks or dashes** in prose. Don't hedge (could, might, may) when sure.
- **Voice is free only.** No paid TTS. Use Kokoro-82M locally (`scripts/tts_kokoro.py`).
- **No vidIQ and no scheduling SaaS.** Upload directly through a browser when
  publishing. Pause only for logins and 2FA.
- **Rebrand existing accounts, never create new ones.** The user already has
  Instagram, TikTok and YouTube accounts to rebrand (handles, names, bios,
  banners, generated profile pictures).
- **Everything lives in this GitHub repo** (prabhvfx/afterframe), organized,
  with clear branches and commits. One branch per story or tool.
- Stories can be **original fiction with characters** (preferred lately) or
  real incidents. Real ones must be fact-checked across several sources, and
  any disputed figure stays out of the script.
- "Make no mistakes": check stills and loudness before calling anything done.

## Pipeline (see README.md for commands)

1. `stories/<story>/partN.json` storyboard: voice lines, cast, beats, SFX cues.
   Times are anchors tied to the voice: `L2`, `L2.end`, `L0.w3`, `END`, plus offsets.
2. `scripts/tts_kokoro.py`: Kokoro voice with exact word timestamps (the
   model is patched to output phoneme durations, 25 ms per unit). Supports
   `cast` + `speaker` per line, per-line `speed`/`gain`, `say` with `/ipa/`.
   Set `KOKORO_DIR` to the folder holding the models (`scripts/fetch_models.sh`).
3. `scripts/sfx.py`: all sound synthesized in code (no samples). Beds: default, `horror`.
4. Remotion (`src/`): `StoryVertical` reads the resolved JSON. Components are
   registered by name in `src/StoryVertical.tsx`. Register each episode in `src/Root.tsx`.
5. Render, then `scripts/master.sh` (two-pass loudnorm to -14 LUFS, -1.5 dBTP).
6. Review a contact sheet of stills for every beat. Fix overlaps, then re-render.
7. Approved masters go in `renders/`. Drafts stay in `out/` (gitignored).

Caption rules learned the hard way: words never scale past 1 (they collided),
dialogue lines show in speech bubbles not captions, keep text inside the
safe zone (top 170 px, bottom 420 px, right 140 px).

## Brand

- Name: Afterframe. Palette and fonts in `src/theme.ts` (dark bg, paper cards,
  red = danger/the antagonist, yellow = highlight, Inter Display + JetBrains Mono).
- Not done yet: bios per platform, avatar and YouTube banner (code-generated),
  rebranding the existing accounts.

## Stories and status

| Story | Branch | Status |
|---|---|---|
| Rosenhan "The Fake Patients" (real) | main | 11 s preview only, superseded |
| Citicorp "The 59-Story Secret" (real) | story/citicorp-part1 | Part 1 done (44 s). Parts 2 to 4 scripted in `stories/citicorp/BIBLE.md` |
| **"The Seventh Room" (original horror)** | story/seventh-room | Part 1 done (47 s). Parts 2 to 4 outlined in `stories/seventh-room/BIBLE.md` |

The Seventh Room cast: Nadia Reyes (architect, 31, af_heart, amber), Theo Reyes
(brother, 19, am_puck, sky blue), the Occupant (never seen), Mrs. Albrecht
(Part 3, bf_emma). Rules of the haunting: knocks always at 3:12, always three.
The gap is 90 cm and grows 1 cm a night. The Occupant copies what is done to the
wall. It keeps a floor plan of the house with the people drawn in it.

## Tooling branch

`tooling/animation-skills` (newest, contains everything above) vendors
artemnovitckii/claude-animation-skills under `vendor/` and links its 11
skills into `.claude/skills/` (/graph, /map-route, /kurzgesagt, /low-poly,
/minecraft, /dan-koe, /minimalistic-graphics, /breakdown, /stick-figure,
/zach-d-films, /zach-3d-films). Setup: `bash vendor/claude-animation-skills/kit/setup.sh`
(add `--voice` for the two engines). Idea pending: a /low-poly shot of the
house at night for Seventh Room Part 2.

## Next steps

1. Get the user's feedback on Seventh Room Part 1 (look, voices, names).
2. Build Seventh Room Parts 2 to 4, then the 16:9 YouTube master.
3. Brand kit: bios, avatar, banner. Then rebrand the accounts via browser.
4. Merge branches into main once the user approves.

## Machine notes

- The user's PC is Windows (DESKTOP-8AKIF9K), repo cloned in `Documents/Projects`.
  The `.sh` scripts need Git Bash or WSL. Node 20+, Python 3.10+, FFmpeg required.
- `.claude/skills/*` are symlinks. On Windows, git needs symlinks enabled
  (`git config core.symlinks true`, Developer Mode on) or they arrive as plain text files.
