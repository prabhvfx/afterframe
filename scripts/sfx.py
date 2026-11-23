"""Synthesize the SFX + music bed for a storyboard. No samples, no licensing.

Usage: python3 scripts/sfx.py <storyboard.json> <out.wav>
The storyboard's "sfx" list holds {type, at, ...} cues in seconds.
"""
import json
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def env(n, attack, release):
    a = max(1, int(attack * SR))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[a:] *= np.exp(-np.arange(n - a) / (release * SR))
    return e


def lowpass(x, cutoff):
    # one-pole lowpass, cutoff may be an array (sweeps)
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    k = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += k[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def sweep_sine(f0, f1, dur, curve=3.0):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    f = f1 + (f0 - f1) * np.exp(-curve * t * 4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def impact(dur=1.6):
    """Cinematic THUD: pitch-dropping sub + body + transient."""
    n = int(dur * SR)
    sub = sweep_sine(140, 38, dur) * env(n, 0.002, 0.55)
    body = sweep_sine(320, 90, dur, 6) * env(n, 0.001, 0.08) * 0.6
    click = highpass(rng.standard_normal(n), 1500) * env(n, 0.0005, 0.012) * 0.5
    tail = lowpass(rng.standard_normal(n), 300) * env(n, 0.01, 0.6) * 0.5
    return np.tanh((sub * 1.1 + body + click + tail) * 1.6) * 0.9


def stamp(dur=0.6):
    n = int(dur * SR)
    thwack = lowpass(rng.standard_normal(n), 2500) * env(n, 0.0008, 0.035)
    knock = sweep_sine(220, 110, dur, 8) * env(n, 0.001, 0.07) * 0.8
    return np.tanh((thwack + knock) * 2.0) * 0.75


def whoosh(dur=0.55):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    cutoff = 300 + 5000 * np.sin(np.pi * t) ** 2
    x = lowpass(rng.standard_normal(n), cutoff)
    shape = np.sin(np.pi * t) ** 1.5
    return x * shape * 0.55


def click(dur=0.05):
    n = int(dur * SR)
    x = highpass(rng.standard_normal(n), 2500) * env(n, 0.0003, 0.006)
    tone = np.sin(2 * np.pi * 1800 * np.arange(n) / SR) * env(n, 0.0003, 0.01) * 0.3
    return (x + tone) * 0.45


def paper(dur=0.5):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    crackle = rng.standard_normal(n) * (rng.random(n) < 0.08)
    x = highpass(lowpass(crackle + rng.standard_normal(n) * 0.15, 6000), 900)
    return x * np.sin(np.pi * t) * 0.6


def riser(dur=2.0):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    f = 110 * 2 ** (2.5 * t)
    tone = (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(4 * np.pi * np.cumsum(f) / SR))
    noise = lowpass(rng.standard_normal(n), 400 + 7000 * t ** 2)
    return (tone * 0.18 + noise * 0.35) * t ** 2.2


def creak(dur=1.2):
    """Groaning steel: slow pitch wobble through a resonant band plus grit."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 70 + 25 * np.sin(2 * np.pi * 1.3 * t) + 12 * np.sin(2 * np.pi * 7 * t)
    tone = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5
    grit = (rng.random(n) < 0.02) * rng.standard_normal(n)
    x = lowpass(tone + grit, 900)
    return x * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7 * 0.7


def tick(dur=0.03):
    n = int(dur * SR)
    return np.sin(2 * np.pi * 3200 * np.arange(n) / SR) * env(n, 0.0002, 0.004) * 0.35


def wind(dur=3.0):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    gust = 0.55 + 0.45 * np.sin(2 * np.pi * (0.7 * t * dur) + 1.3) ** 2
    x = lowpass(rng.standard_normal(n), 250 + 900 * gust)
    x = highpass(x, 120)
    shape = np.minimum(1, t * 6) * np.minimum(1, (1 - t) * 4)
    return x * gust * shape * 1.4


def knock(dur=0.7):
    """Knuckle on drywall: sharp transient, hollow body, short room tail."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    tr = lowpass(rng.standard_normal(n), 3000) * env(n, 0.0003, 0.006) * 0.9
    body = (np.sin(2 * np.pi * 118 * t) * 0.9 + np.sin(2 * np.pi * 247 * t) * 0.4) * env(n, 0.001, 0.045)
    room = lowpass(rng.standard_normal(n), 700) * env(n, 0.004, 0.16) * 0.25
    return np.tanh((tr + body + room) * 1.8) * 0.85


def drill(dur=1.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 210 + 25 * np.sin(2 * np.pi * 3 * t) + 40 * np.minimum(1, t * 3)
    motor = (2 * ((np.cumsum(f) / SR) % 1) - 1) * 0.35
    grind = highpass(lowpass(rng.standard_normal(n), 4500), 800) * (0.4 + 0.3 * np.sin(2 * np.pi * 11 * t) ** 2)
    shape = np.minimum(1, t * 12) * np.minimum(1, (dur - t) * 8)
    return (lowpass(motor, 2500) + grind * 0.5) * shape * 0.7


def hiss(dur=1.5):
    """Cold draft through a small hole."""
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    x = highpass(rng.standard_normal(n), 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.7 * t * dur) ** 2)
    return x * np.minimum(1, t * 5) * np.minimum(1, (1 - t) * 3) * 0.35


def tape(dur=0.6):
    """Tape measure pulled out: fast ratchet clicks."""
    n = int(dur * SR)
    out = np.zeros(n)
    for i, at in enumerate(np.arange(0, dur - 0.05, 0.018)):
        c = click(0.02) * (1 - at / dur) * 0.9
        j = int(at * SR)
        out[j : j + len(c)] += c[: n - j]
    return out


def static(dur=1.0):
    """Camera feed static: band-limited noise with a 50 Hz flutter."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = highpass(lowpass(rng.standard_normal(n), 6000), 500) * (0.7 + 0.3 * np.sin(2 * np.pi * 50 * t))
    return x * np.minimum(1, t * 20) * np.minimum(1, (dur - t) * 6) * 0.5


def pencil(dur=1.0):
    """Graphite on paper: bright noise in quick strokes."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    strokes = np.sin(2 * np.pi * 6.5 * t) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 1.3 * t))
    x = highpass(rng.standard_normal(n), 3000) * strokes
    return x * np.minimum(1, t * 30) * np.minimum(1, (dur - t) * 8) * 0.4


def scrape(dur=1.0):
    """Cable sliding through a hole in plaster."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = lowpass(rng.standard_normal(n), 1200) * (0.6 + 0.4 * np.sin(2 * np.pi * 4 * t))
    return x * np.minimum(1, t * 10) * np.minimum(1, (dur - t) * 5) * 0.6


def bed_horror(dur, level):
    """Two close low tones beating (41 vs 43.6 Hz), a thin high whine, breath noise."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    low = np.sin(2 * np.pi * 41 * t) + np.sin(2 * np.pi * 43.6 * t) + 0.4 * np.sin(2 * np.pi * 82 * t)
    whine = np.sin(2 * np.pi * 1318 * t + 3 * np.sin(2 * np.pi * 0.2 * t)) * 0.025 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t))
    breath = lowpass(rng.standard_normal(n), 300) * 0.25 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t))
    fade = np.minimum(1, t / 1.5) * np.minimum(1, (dur - t) / 0.6)
    return (low * 0.3 + whine + breath) * fade * level


def bed(dur, level=0.22):
    """Dark tension drone: detuned low fifths + slow filtered noise + heartbeat."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    drone = sum(
        np.sin(2 * np.pi * f * t + p) * a
        for f, p, a in [(55, 0, 1), (55.4, 1, 0.7), (82.5, 2, 0.45), (110.3, 0.5, 0.18)]
    )
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.15 * t)
    air = lowpass(rng.standard_normal(n), 500) * 0.35
    x = (drone * 0.35 + air) * lfo
    fade = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 0.4)
    return x * fade * level


GEN = {"impact": impact, "stamp": stamp, "whoosh": whoosh, "click": click,
       "paper": paper, "riser": riser, "creak": creak, "tick": tick, "wind": wind,
       "knock": knock, "drill": drill, "hiss": hiss, "tape": tape,
       "static": static, "pencil": pencil, "scrape": scrape}


def main():
    board = json.load(open(sys.argv[1]))
    dur = board["durationSeconds"]
    mix = np.zeros(int((dur + 2) * SR))
    bed_fn = bed_horror if board.get("bed") == "horror" else bed
    mix[: int(dur * SR)] += bed_fn(dur, board.get("bedLevel", 0.22))
    for cue in board["sfx"]:
        kind = cue["type"]
        times = [cue["at"]]
        if "every" in cue:  # repeating cue, e.g. typewriter clicks
            times = list(np.arange(cue["at"], cue["until"], cue["every"]))
        for at in times:
            kw = {"dur": cue["dur"]} if "dur" in cue else {}
            s = GEN[kind](**kw) * cue.get("gain", 1.0)
            i = int(at * SR)
            mix[i : i + len(s)] += s[: len(mix) - i]
    mix = mix[: int(dur * SR)]
    mix = np.tanh(mix * 1.1) * 0.89  # soft limiter
    stereo = np.stack([mix, np.roll(mix, 24)], axis=1)  # tiny Haas width
    pcm = (stereo * 32767).astype("<i2")
    with wave.open(sys.argv[2], "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", sys.argv[2], f"{dur}s")


if __name__ == "__main__":
    main()
