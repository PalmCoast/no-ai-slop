#!/usr/bin/env bash
# Build the companion face clips for the Sonaris console.
#
# Usage:
#   scripts/build-companion-clips.sh <source-video> [out-dir] [size]
#
#   source-video  The original companion render (any codec ffmpeg can read;
#                 the shipped clips came from a 10 s 3840x2160 HEVC file).
#                 The creature must sit in the centre of the frame: the script
#                 takes a square centre crop.
#   out-dir       Defaults to public/companion (relative to sonaris/).
#   size          Square output size in px. Defaults to 720. Drop to 640 if
#                 the folder ends up over the 4 MB budget.
#
# What it produces (each clip as .webm VP9 and .mp4 H.264, both silent):
#   sleep  0.0-4.0 s ping-pong   resting; idle and behind the lock screen
#   wake   4.0-6.0 s forward     eyes open; played once when the user starts talking
#   alert  5.6-6.0 s ping-pong   subtle alive idle; listening / user speaking
#   smile  6.0-8.0 s forward     settles into a smile; thinking (holds last frame)
#   speak  8.0-10.0 s ping-pong  joyful bounce; speaking
#   poster.jpg  frame at 9.9 s   <video poster>, reduced-motion fallback, marketing
#
# Ping-pong clips play forward then reversed so they loop without a cut. The
# source is HEVC, which most browsers cannot play, and 4K is far too heavy for
# a face that is at most 44vh tall, so nothing from the source is used as is.
#
# Requires ffmpeg with libx264 and libvpx-vp9. Re-running overwrites the outputs.
set -euo pipefail

SRC="${1:-}"
if [[ -z "$SRC" || ! -f "$SRC" ]]; then
  echo "usage: $0 <source-video> [out-dir] [size]" >&2
  exit 1
fi
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${2:-$HERE/public/companion}"
SIZE="${3:-720}"
# Per-clip CRF. Ping-pong loops double their length, so they get a little more
# compression than the one-shot clips to keep the folder under 4 MB.
X264_CRF="${X264_CRF:-26}"
VP9_CRF="${VP9_CRF:-36}"

command -v ffmpeg >/dev/null || { echo "ffmpeg not found" >&2; exit 1; }
mkdir -p "$OUT"

# Square centre crop, then scale. `min(iw,ih)` keeps the script valid for a
# source that is already square or portrait.
CROP="crop='min(iw,ih)':'min(iw,ih)',scale=${SIZE}:${SIZE}:flags=lanczos"

# forward <name> <start> <end>
forward() {
  local name="$1" start="$2" end="$3"
  local vf="trim=start=${start}:end=${end},setpts=PTS-STARTPTS,${CROP}"
  encode "$name" "$vf"
}

# pingpong <name> <start> <end>: forward, then the same frames reversed.
pingpong() {
  local name="$1" start="$2" end="$3"
  local fc="[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS,${CROP},split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[v]"
  encode_complex "$name" "$fc"
}

encode() {
  local name="$1" vf="$2"
  echo "» $name (mp4)"
  ffmpeg -v error -y -i "$SRC" -an -vf "$vf" \
    -c:v libx264 -preset slow -crf "$X264_CRF" -pix_fmt yuv420p -movflags +faststart \
    "$OUT/$name.mp4"
  echo "» $name (webm)"
  ffmpeg -v error -y -i "$SRC" -an -vf "$vf" \
    -c:v libvpx-vp9 -crf "$VP9_CRF" -b:v 0 -row-mt 1 -pix_fmt yuv420p \
    "$OUT/$name.webm"
}

encode_complex() {
  local name="$1" fc="$2"
  echo "» $name (mp4, ping-pong)"
  ffmpeg -v error -y -i "$SRC" -filter_complex "$fc" -map "[v]" -an \
    -c:v libx264 -preset slow -crf "$X264_CRF" -pix_fmt yuv420p -movflags +faststart \
    "$OUT/$name.mp4"
  echo "» $name (webm, ping-pong)"
  ffmpeg -v error -y -i "$SRC" -filter_complex "$fc" -map "[v]" -an \
    -c:v libvpx-vp9 -crf "$VP9_CRF" -b:v 0 -row-mt 1 -pix_fmt yuv420p \
    "$OUT/$name.webm"
}

pingpong sleep 0.0 4.0
forward  wake  4.0 6.0
pingpong alert 5.6 6.0
forward  smile 6.0 8.0
pingpong speak 8.0 10.0

echo "» poster.jpg"
ffmpeg -v error -y -ss 9.9 -i "$SRC" -frames:v 1 -vf "$CROP" -q:v 3 "$OUT/poster.jpg"

echo
du -ah "$OUT" | sort -k2
echo "total: $(du -sh "$OUT" | cut -f1)"
