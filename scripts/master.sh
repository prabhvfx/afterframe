#!/usr/bin/env bash
# Master a render for social: -14 LUFS integrated, -1.5 dBTP ceiling, video
# stream copied untouched. Pass 1 measures, pass 2 runs loudnorm plus a 4x
# oversampled limiter at -2.5 dB (catches true peaks that loudnorm and AAC
# let through), pass 3 corrects the loudness the limiter took. Fails if the
# result misses the targets.
set -euo pipefail
in="$1"; out="${2:-${1%.mp4}-master.mp4}"
I=-14; TP=-1.5; LRA=11
stats=$(ffmpeg -hide_banner -i "$in" -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
encode() { # $1 = loudnorm target in LUFS
  ffmpeg -y -loglevel error -i "$in" -c:v copy \
    -af "loudnorm=I=$1:TP=$TP:LRA=$LRA:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=192000,alimiter=limit=0.75:attack=1:release=60:level=disabled,aresample=48000" \
    -ar 48000 -c:a aac -b:a 256k -movflags +faststart "$out"
}
measure() { # prints "<integrated LUFS> <true peak dBTP>"
  ffmpeg -hide_banner -i "$1" -af ebur128=peak=true -f null - 2>&1 |
    awk '/Summary/{s=1} s&&$1=="I:"{i=$2} s&&$1=="Peak:"{p=$2} END{print i, p}'
}
encode "$I"
read -r got _ <<<"$(measure "$out")"
encode "$(python3 -c "print(round(2 * $I - $got, 2))")"
read -r got peak <<<"$(measure "$out")"
echo "$out: $got LUFS, $peak dBTP"
python3 -c "import sys; sys.exit(0 if abs($got - $I) <= 0.3 and $peak <= $TP else 1)" ||
  { echo "master misses -14 LUFS / -1.5 dBTP" >&2; exit 1; }
