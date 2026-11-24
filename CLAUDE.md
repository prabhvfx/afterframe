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
5. Render, then `scripts/master.sh`: loudnorm plus a 4x oversampled limiter,
   then a correction pass. It prints the result and fails if it misses
   -14 LUFS (±0.3) or goes above -1.5 dBTP. On 2026-11-23 Citicorp P1 and
   Seventh Room P1 were re-mastered from their old masters (the old script let
   peaks reach -0.9 dBTP). Their video streams are byte-identical to the originals.
6. Review a contact sheet of stills for every beat. Fix overlaps, then re-render.
7. Approved masters go in `renders/`. Drafts stay in `out/` (gitignored).

Caption rules learned the hard way: words never scale past 1 (they collided),
dialogue lines show in speech bubbles not captions, keep text inside the
safe zone (top 170 px, bottom 420 px, right 140 px).

## Brand

- Name: Afterframe. Palette and fonts in `src/theme.ts` (dark bg, paper cards,
  red = danger/the antagonist, yellow = highlight, Inter Display + JetBrains Mono).
- Brand kit (branch `brand/kit`): `brand/avatar.png`, `brand/banner.png`
  (rendered from `src/brand/BrandStills.tsx`), names, handles and bios in `brand/BRAND.md`.
- Accounts rebranded 2026-11-24 (signed in on the PC's Claude browser pane):
  all three are now "Afterframe", **@afterframe.animated**, with the bios from
  BRAND.md. Old handles were Instagram @hero3sunited, TikTok @bloxclips791,
  YouTube @HERO3S-UNITED. The user uploaded the avatar on all three and the
  YouTube banner (checked live 2026-11-24). The browser pane has no file upload,
  so image uploads are always the user's job. TikTok username is locked
  until about 2026-12-24.

## Stories and status

| Story | Branch | Status |
|---|---|---|
| Rosenhan "The Fake Patients" (real) | main | 11 s preview only, superseded |
| Citicorp "The 59-Story Secret" (real) | story/citicorp-part1 | Part 1 done (44 s). Parts 2 to 4 scripted in `stories/citicorp/BIBLE.md` |
| **"The Seventh Room" (original horror)** | story/seventh-room | Parts 1 (47 s), 2 (49.5 s) and 3 (54.4 s) done. Part 4 outlined in `stories/seventh-room/BIBLE.md` |

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
(add `--voice` for the two engines). The /low-poly idea for Part 2 was skipped: the skill renders through
Playwright Chromium, which is not installed on the PC. Part 2 uses 2D beats in
`src/beats/CameraBeats.tsx` (recap strip, inspection camera, phone feed, pencil plan, receipt proof).

## Next steps

1. Get the user's feedback on Seventh Room Part 1 (look, voices, names).
2. Build Seventh Room Part 4, then the 16:9 YouTube master.
   Part 2 continuity: Theo now owns a blue hoodie (`look` prop on CharacterCard),
   the pencil plan marks the gap as a red "7", a fictional store "Threadline Supply" sold the hoodie.
   Part 3 continuity: Mrs. Albrecht is a character (`albrecht` in `Character.tsx`, grey bob, lilac
   cardigan, bf_emma, pronounced /ˈɑlbɹɛkt/). Rental records show 0 leases every decade. The gap
   read 0.91, 0.92, 0.93 m on nights 1 to 3. Theo vanished at 3:12, bed empty, carpet pulled toward
   the wall. Part 3 beats live in `src/beats/NightBeats.tsx`.
3. Brand kit: bios, avatar, banner. Then rebrand the accounts via browser.
4. Merge branches into main once the user approves.

## Machine notes

- The user's PC is Windows (DESKTOP-8AKIF9K), repo cloned in `Documents/Projects`.
  The `.sh` scripts need Git Bash or WSL. Node 20+, Python 3.10+, FFmpeg required.
- `.claude/skills/*` are symlinks. On Windows, git needs symlinks enabled
  (`git config core.symlinks true`, Developer Mode on) or they arrive as plain text files.
  As of 2026-11-23 Developer Mode is still off on the PC, so the links are missing there.
  Workaround (2026-11-24): the 11 skills are copied as real folders into `~/.claude/skills`.
  After updating `vendor/`, copy them again.
- Fonts load in code from `public/fonts` (`src/fonts.ts`, Inter variable and
  JetBrains Mono, OFL). Never rely on OS fonts: the PC has neither installed.
- PC Python is 3.15, too new for kokoro-onnx 0.6.1. Use the project venv:
  `uv venv --python 3.12 .venv`, then `uv pip install --python .venv/Scripts/python.exe -r requirements.txt`,
  and run scripts with `.venv/Scripts/python.exe`. Models live in `~/models` (`KOKORO_DIR`).
- npm on Windows skips `@rspack/binding-win32-x64-msvc` (lock file made on Linux).
  Fix: `npm i --no-save @rspack/binding-win32-x64-msvc@<version in package-lock>`.
- The user said not to install Playwright's Chromium, so the kit setup stopped
  there. /zach-d-films and /stick-figure renders need it. Ask before installing.
