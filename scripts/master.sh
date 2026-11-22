#!/usr/bin/env bash
# Master a render for social: -14 LUFS integrated, -1.5 dBTP, video stream copied.
set -euo pipefail
in="$1"; out="${2:-${1%.mp4}-master.mp4}"
ffmpeg -y -loglevel error -i "$in" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.85:level=false" -ar 48000 -c:a aac -b:a 256k -movflags +faststart "$out"
echo "$out"
