export function cameraBubble(
  width: number,
  height: number,
): { x: number; y: number; r: number } {
  const r = Math.max(48, Math.round(Math.min(width, height) * 0.14));
  const margin = Math.round(Math.min(width, height) * 0.045);
  return { x: width - r - margin, y: height - r - margin, r };
}

export function coverRect(
  srcW: number,
  srcH: number,
  destW: number,
  destH: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const scale = Math.max(destW / srcW, destH / srcH);
  const sw = destW / scale;
  const sh = destH / scale;
  return { sx: (srcW - sw) / 2, sy: (srcH - sh) / 2, sw, sh };
}

export function drawDemoFrame(ctx: CanvasRenderingContext2D, elapsedMs: number, w: number, h: number): void {
  ctx.fillStyle = "#0c0b0a";
  ctx.fillRect(0, 0, w, h);

  const t = elapsedMs / 1000;
  const cx = w / 2 + Math.sin(t * 1.3) * w * 0.22;
  const cy = h / 2 + Math.cos(t * 0.9) * h * 0.16;
  const radius = Math.min(w, h) * 0.12;
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 2.4);
  glow.addColorStop(0, "rgba(255, 90, 31, 0.95)");
  glow.addColorStop(0.45, "rgba(255, 90, 31, 0.28)");
  glow.addColorStop(1, "rgba(255, 90, 31, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ff5a1f";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = "#0c0b0a";
  ctx.fill();

  ctx.fillStyle = "#f4efe6";
  ctx.font = `600 ${Math.round(h * 0.08)}px Fraunces, Georgia, serif`;
  ctx.textAlign = "center";
  ctx.fillText("Flick", w / 2, h * 0.22);

  ctx.fillStyle = "#a39a8e";
  ctx.font = `500 ${Math.round(h * 0.045)}px Manrope, sans-serif`;
  const seconds = Math.floor(elapsedMs / 1000);
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  ctx.fillText(`${mm}:${ss}  demo scene`, w / 2, h * 0.86);
}

export function drawCameraBubble(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
  mirrored: boolean,
): void {
  if (video.readyState < 2) return;
  const { x, y, r } = cameraBubble(width, height);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (mirrored) {
    ctx.translate(x, y);
    ctx.scale(-1, 1);
    ctx.translate(-x, -y);
  }
  const srcW = video.videoWidth || 640;
  const srcH = video.videoHeight || 480;
  const box = coverRect(srcW, srcH, r * 2, r * 2);
  ctx.drawImage(video, box.sx, box.sy, box.sw, box.sh, x - r, y - r, r * 2, r * 2);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(244, 239, 230, 0.7)";
  ctx.lineWidth = Math.max(3, r * 0.06);
  ctx.stroke();
}
