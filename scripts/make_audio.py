"""Generate a 12s ambient pad for the Remotion demo soundtrack.

Deliberately dependency-free (stdlib `wave` + math) so it can run anywhere.
"""
import math
import os
import struct
import wave

SR = 44100
DUR = 12.0
N = int(SR * DUR)

# A minor add9 pad
NOTES = [110.00, 164.81, 220.00, 277.18, 329.63]
GAINS = [0.55, 0.32, 0.30, 0.20, 0.14]

frames = bytearray()
for i in range(N):
    t = i / SR
    # global envelope: 1.2s fade in, 2.5s fade out
    env = min(1.0, t / 1.2) * min(1.0, max(0.0, (DUR - t) / 2.5))
    # slow breathing
    env *= 0.82 + 0.18 * math.sin(2 * math.pi * 0.09 * t - 1.2)
    left = 0.0
    right = 0.0
    for detune, f, g in ((0.0, NOTES[0], GAINS[0]), (1.003, NOTES[0], GAINS[0] * 0.6)):
        for k, (freq, gain) in enumerate(zip(NOTES, GAINS)):
            if k == 0 and detune != 0.0:
                continue
            vibrato = 1.0 + 0.0015 * math.sin(2 * math.pi * 0.4 * t + k)
            phase = 2 * math.pi * freq * vibrato * t
            s = math.sin(phase) + 0.22 * math.sin(2 * phase) + 0.08 * math.sin(3 * phase)
            pan = 0.5 + 0.35 * math.sin(k * 1.7)
            left += s * gain * g * (1.0 - pan)
            right += s * gain * g * pan
    # gentle tick, one per second, like a metronome far away
    beat = t % 1.0
    if beat < 0.06:
        click = math.sin(2 * math.pi * 1400 * t) * math.exp(-beat * 90) * 0.05
        left += click
        right += click
    left *= 0.16 * env
    right *= 0.16 * env
    li = max(-32767, min(32767, int(left * 32767)))
    ri = max(-32767, min(32767, int(right * 32767)))
    frames += struct.pack("<hh", li, ri)

os.makedirs("public", exist_ok=True)
with wave.open("public/soundtrack.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(frames))

print("wrote public/soundtrack.wav", os.path.getsize("public/soundtrack.wav"), "bytes")
