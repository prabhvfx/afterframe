"""Free local narration with frame-accurate word timestamps.

Kokoro-82M (ONNX) runs fully offline. We patch the model once to also output
its internal per-phoneme durations (`/encoder/Clip_output_0`). Each duration
unit is exactly 600 samples at 24 kHz (25 ms), so word timings come straight
from the model: no Whisper, no forced alignment, no drift.

Usage:
  python3 scripts/tts_kokoro.py stories/rosenhan/part1-preview.json

Reads   story["voice"] = {voice, speed, lines:[{text, pauseBefore?}]}
Writes  public/<voice.file> (wav) and <story>.resolved.json with line + word
        times, and with every "L2+0.3" style anchor in beats/sfx resolved.
"""
import json
import os
import re
import sys
import wave

import numpy as np

MODELS = os.environ.get("KOKORO_DIR", os.path.expanduser("~/models"))
SR = 24000
HOP = 600  # samples per duration unit
PUNCT = set(".,!?;:—…\"'()")


def load():
    import onnx
    import onnxruntime as ort
    from kokoro_onnx import Kokoro

    base = os.path.join(MODELS, "kokoro-v1.0.onnx")
    patched = os.path.join(MODELS, "kokoro-v1.0-dur.onnx")
    if not os.path.exists(patched):
        m = onnx.load(base)
        m.graph.output.append(
            onnx.helper.make_tensor_value_info("/encoder/Clip_output_0", onnx.TensorProto.FLOAT, None)
        )
        onnx.save(m, patched)
    k = Kokoro(base, os.path.join(MODELS, "voices-v1.0.bin"))
    sess = ort.InferenceSession(patched, providers=["CPUExecutionProvider"])
    return k, sess


def voice_style(k, spec):
    # "am_michael" or a blend like "am_michael:0.7,am_onyx:0.3"
    bank = None
    for part in spec.split(","):
        name, _, weight = part.partition(":")
        v = k.voices[name.strip()] * float(weight or 1)
        bank = v if bank is None else bank + v
    return bank


IPA_WORD = re.compile(r"^/([^/]+)/([.,!?;:]*)$")


def phonemize(k, text, lang):
    """Phonemize text; a word written as /ipa/ is used verbatim (for names)."""
    out, run = [], []
    for w in text.split():
        m = IPA_WORD.match(w)
        if m:
            if run:
                out.append(k.tokenizer.phonemize(" ".join(run), lang))
                run = []
            out.append(m.group(1) + m.group(2))
        else:
            run.append(w)
    if run:
        out.append(k.tokenizer.phonemize(" ".join(run), lang))
    return " ".join(p.strip() for p in out)


def synth_line(k, sess, text, style_bank, speed, lang, say=None):
    # `say` is a respelled version used only for pronunciation (same word count)
    ph = phonemize(k, say or text, lang)
    # tokenize char by char so we keep a char -> token map (unknown chars drop)
    char_tok = [k.tokenizer.tokenize(c) for c in ph]
    toks = [t for ct in char_tok for t in ct]
    style = style_bank[min(len(toks), len(style_bank) - 1)]
    audio, dur = sess.run(
        None,
        {
            "tokens": np.array([[0, *toks, 0]], dtype=np.int64),
            "style": style.astype(np.float32),
            "speed": np.array([speed], dtype=np.float32),
        },
    )
    dur = dur.ravel()
    assert abs(dur.sum() * HOP - audio.shape[-1]) < HOP, "duration/audio mismatch"
    # start time of each phoneme char (seconds); dur[0] is the leading pad token
    t = dur[0] * HOP / SR
    idx = 1  # each token consumes the next duration slot
    char_t = []
    for ct in char_tok:
        span = dur[idx : idx + len(ct)].sum() * HOP / SR
        char_t.append((t, t + span))
        t += span
        idx += len(ct)
    # group phoneme chars into words by spaces
    pwords, cur = [], []
    for c, ts in zip(ph, char_t):
        if c == " ":
            if cur:
                pwords.append(cur)
            cur = []
        elif c not in PUNCT:  # punctuation carries pause time, not speech
            cur.append(ts)
    if cur:
        pwords.append(cur)
    words = text.split()
    if say and len(say.split()) != len(words):
        raise ValueError(f"'say' must have the same word count as text: {text!r}")
    if len(pwords) == len(words):
        wt = [(w, p[0][0], p[-1][1]) for w, p in zip(words, pwords)]
    else:  # rare: phonemizer merged/split words. Fall back to proportional.
        s, e = pwords[0][0][0], pwords[-1][-1][1]
        L = [len(w) + 1 for w in words]
        acc, wt = s, []
        for w, l in zip(words, L):
            d = (e - s) * l / sum(L)
            wt.append((w, acc, acc + d))
            acc += d
    # trim trailing silence: keep 120 ms after the last phoneme
    end = min(audio.shape[-1], int((wt[-1][2] + 0.12) * SR))
    lead = wt[0][1]
    lead_cut = max(0, int((lead - 0.03) * SR))
    audio = audio[lead_cut:end]
    shift = lead_cut / SR
    return audio, [(w, a - shift, b - shift) for w, a, b in wt]


ANCHOR = re.compile(r"^(?:L(\d+)(?:\.w(\d+))?(\.end)?|END)([+-][\d.]+)?$")


def resolve(v, lines, total):
    """'L2' line start, 'L2.end' line end, 'L0.w3' word start, 'L0.w3.end',
    'END' clip end, each with an optional +/- offset in seconds."""
    if not isinstance(v, str):
        return v
    m = ANCHOR.match(v.strip())
    if not m:
        raise ValueError(f"bad anchor {v}")
    off = float(m.group(4) or 0)
    if m.group(1) is None:
        return round(total + off, 3)
    ln = lines[int(m.group(1))]
    if m.group(2) is not None:
        w = ln["words"][int(m.group(2))]
        base = w["end"] if m.group(3) else w["start"]
    else:
        base = ln["start"] + ln["dur"] if m.group(3) else ln["start"]
    return round(float(base) + off, 3)


def resolve_props(x, lines, total):
    if isinstance(x, dict):
        return {k: resolve_props(v, lines, total) for k, v in x.items()}
    if isinstance(x, list):
        return [resolve_props(v, lines, total) for v in x]
    if isinstance(x, str) and ANCHOR.match(x.strip()):
        return resolve(x, lines, total)
    return x


def main():
    path = sys.argv[1]
    story = json.load(open(path))
    v = story["voice"]
    k, sess = load()
    bank = voice_style(k, v["voice"])
    t = v.get("leadIn", 0.25)
    chunks, lines = [], []
    for ln in v["lines"]:
        t += ln.get("pauseBefore", 0.12)
        audio, words = synth_line(k, sess, ln["text"], bank, v.get("speed", 1.0), v.get("lang", "en-us"), ln.get("say"))
        dur = len(audio) / SR
        lines.append({**ln, "start": round(float(t), 3), "dur": round(float(dur), 3),
                      "words": [{"text": w, "start": round(float(t + a), 3), "end": round(float(t + b), 3)} for w, a, b in words]})
        chunks.append((t, audio))
        t += dur
    total = story["durationSeconds"]
    if total == "auto":
        total = round(t + v.get("tail", 0.8), 2)
    if t > total:
        print(f"warning: narration ends at {t:.2f}s, past {total}s")
    out = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for st, a in chunks:
        i = int(st * SR)
        out[i : i + len(a)] += a[: len(out) - i]
    out = out[: int(total * SR)]
    out = out / max(1e-6, np.abs(out).max()) * 0.89
    pcm = (out * 32767).astype("<i2")
    dst = os.path.join(os.path.dirname(__file__), "..", "public", v["file"])
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with wave.open(dst, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())

    story["durationSeconds"] = total
    story["voice"]["lines"] = lines
    for b in story["beats"]:
        b["start"], b["end"] = resolve(b["start"], lines, total), resolve(b["end"], lines, total)
        b["props"] = resolve_props(b.get("props", {}), lines, total)
    for c in story["sfx"]:
        for key in ("at", "until"):
            if key in c:
                c[key] = resolve(c[key], lines, total)
    out_json = re.sub(r"\.json$", ".resolved.json", path)
    json.dump(story, open(out_json, "w"), indent=2)
    print(f"voice -> {dst} ({t:.2f}s speech, {total}s total)")
    for ln in lines:
        print(f"  {ln['start']:6.2f}  {' '.join(f'{w['text']}@{w['start']:.2f}' for w in ln['words'])}")
    print("resolved ->", out_json)


if __name__ == "__main__":
    main()
