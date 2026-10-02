"""Original score: Winter Passage. Deterministic synthesis; no sampled recording.

96-second D-gong pentatonic loop: damped strings, low drone, timber and air.
Run with Python / NumPy, then encode the temporary WAV with ffmpeg.
"""
import sys
import wave
import numpy as np

RATE, LENGTH = 32000, 96
rng = np.random.default_rng(20261002)
score = np.zeros((RATE * LENGTH, 2), dtype=np.float64)


def add(start, signal, gain, pan=0):
    indices = (int(start * RATE) + np.arange(len(signal))) % len(score)
    score[indices, 0] += signal * gain * np.sqrt((1 - pan) / 2)
    score[indices, 1] += signal * gain * np.sqrt((1 + pan) / 2)


def string(midi, duration=5):
    t = np.arange(int(RATE * duration)) / RATE
    frequency = 440 * 2 ** ((midi - 69) / 12)
    # The softened, slightly inharmonic pluck and slow pitch settling suggest
    # wood and string rather than a bright electronic bell.
    phase = 2 * np.pi * frequency * (t - .004 * .045 * (1 - np.exp(-t / .045)))
    result = np.zeros_like(t)
    for partial, amplitude in [(1, 1), (2, .36), (3, .16), (4, .065), (5, .026)]:
        result += amplitude * np.sin(phase * partial * np.sqrt(1 + .00012 * partial ** 2)) * np.exp(-t * partial ** .65 / 2.2)
    envelope = (1 - np.exp(-t / .012)) * np.minimum(1, (duration - t) / .25)
    return result * envelope


motifs = [
    [(0, 62), (2, 69), (3.5, 66), (5.5, 64), (7, 62)],
    [(.5, 64), (2.5, 66), (4, 69), (6, 71)],
    [(0, 69), (2, 71), (3.5, 69), (5, 66), (7, 64)],
    [(1, 66), (3, 64), (5.5, 62)],
]
for phrase in range(12):
    base = phrase * 8
    motif = motifs[phrase % 4]
    for i, (beat, midi) in enumerate(motif):
        add(base + beat, string(midi), .10 if i else .14, -.18 if i % 2 else .18)
    add(base, string(50 if phrase % 4 != 2 else 57, 7), .09, -.08)
    # A quiet wooden pulse; no sharp cymbal, synth swell or busy percussion.
    t = np.arange(int(RATE * .16)) / RATE
    tap = np.sin(2 * np.pi * 190 * t) * np.exp(-t / .018) * (1 - np.exp(-t / .001))
    add(base + 4.5, tap, .012, .1)

t = np.arange(len(score)) / RATE
breath = .65 + .35 * np.sin(2 * np.pi * t / 32) ** 2
for frequency in [73.4162, 110, 146.8324]:
    # Exact loop-bin frequencies make the background seamless at the join.
    frequency = round(frequency * LENGTH) / LENGTH
    drone = np.sin(2 * np.pi * frequency * t) * breath * .008
    score += drone[:, None]

# Filtered, very low air texture; not a claimed field recording.
frequencies = np.fft.rfftfreq(len(score), 1 / RATE)
noise = np.fft.rfft(rng.normal(size=len(score)))
shape = np.minimum(1, frequencies / 180) * np.exp(-frequencies / 650)
air = np.fft.irfft(noise * shape, n=len(score))
air = air / max(np.std(air), 1e-9) * .0012
score += air[:, None] * breath[:, None]

dry = score.copy()
for delay, gain in [(.107, .15), (.233, .12), (.419, .09), (.677, .06), (1.031, .035)]:
    score += np.roll(dry[:, ::-1], int(delay * RATE), axis=0) * gain
score *= .72 / np.max(np.abs(score))
pcm = (np.tanh(score) * 32767).astype("<i2")
with wave.open(sys.argv[1], "wb") as output:
    output.setnchannels(2)
    output.setsampwidth(2)
    output.setframerate(RATE)
    output.writeframes(pcm.tobytes())
print(f"Original loop: {LENGTH}s, stereo {RATE}Hz, peak {np.max(np.abs(score)):.3f}")
