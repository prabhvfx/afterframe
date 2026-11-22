# Afterframe

Code-driven motion-design storytelling. One JSON storyboard per episode drives
voice, captions, visuals and sound. Everything is free and runs locally.

## Setup (once)

```bash
npm install
```

```bash
pip install -r requirements.txt
```

```bash
scripts/fetch_models.sh
```

Needs Node 20+, Python 3.10+ and FFmpeg. Kokoro's phonemizer ships its own
espeak-ng, so nothing else to install.

## Make an episode

1. Write `stories/<story>/partN.json`: voice lines, beats, SFX cues.
   Times can be anchors: `L2` (line 2 start), `L2.end`, `L0.w3` (line 0,
   word 3), `END`, each with an optional `+0.2` / `-0.1` offset.
2. Voice and word timestamps (Kokoro-82M, offline):
   ```bash
   python3 scripts/tts_kokoro.py stories/citicorp/part1.json
   ```
   Writes `public/vo/*.wav` and `partN.resolved.json`. Use `"say"` on a line
   for pronunciation, with `/ipa/` for names.
3. Sound effects (synthesized, no samples):
   ```bash
   python3 scripts/sfx.py stories/citicorp/part1.resolved.json public/sfx/citicorp-p1.wav
   ```
4. Register the episode in `src/Root.tsx`, then preview:
   ```bash
   npx remotion studio
   ```
5. Render and master (-14 LUFS, -1.5 dBTP):
   ```bash
   npx remotion render src/index.ts CiticorpP1 out/citicorp-p1.mp4 --crf=16
   ```
   ```bash
   scripts/master.sh out/citicorp-p1.mp4 out/citicorp-p1-master.mp4
   ```

## Layout

| Path | What |
|---|---|
| `stories/` | storyboards and production bibles |
| `src/beats/` | visual beat components (`KineticTitle`, `TowerHero`, `TimelineScrubber`, `WindDiagram`, ...) |
| `src/components/` | captions, PART badge, grain, shared tower, spring presets |
| `scripts/` | TTS, SFX synth, mastering, model download |
| `public/` | generated voice and SFX audio |

Approved final renders go in `renders/` (mastered MP4s only). Drafts stay in `out/`, which git ignores.
