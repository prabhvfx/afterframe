#!/usr/bin/env bash
# Master a render for social: two-pass loudnorm to -14 LUFS integrated,
# -1.5 dBTP ceiling, video stream copied untouched.
set -euo pipefail
in="$1"; out="${2:-${1%.mp4}-master.mp4}"
I=-14; TP=-1.5; LRA=11
stats=$(ffmpeg -hide_banner -i "$in" -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -loglevel error -i "$in" -c:v copy \
  -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  -ar 48000 -c:a aac -b:a 256k -movflags +faststart "$out"
echo "$out"
