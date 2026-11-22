#!/usr/bin/env bash
# Download the free Kokoro-82M ONNX model + voices (≈350 MB) from GitHub releases.
set -euo pipefail
dir="${KOKORO_DIR:-$HOME/models}"
mkdir -p "$dir"
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -s "$dir/$f" ] || curl -fL --retry 4 -o "$dir/$f" "$base/$f"
done
echo "models in $dir (set KOKORO_DIR=$dir when running tts_kokoro.py)"
