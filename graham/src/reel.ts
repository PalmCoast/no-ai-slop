import type { Answer } from "../shared/answer.ts";

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  max: number,
  lineHeight: number,
  color: string,
  font: string,
): number {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = "center";
  const words = text.split(/\s+/);
  let line = "";
  let cursor = y;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      ctx.fillText(line, x, cursor);
      cursor += lineHeight;
      line = word;
    } else {
      line = next;
    }
  }
  if (line) {
    ctx.fillText(line, x, cursor);
    cursor += lineHeight;
  }
  return cursor;
}

/** Vertical caption reel. The mark talks. It is not a face of the operator. */
export function drawFrame(ctx: CanvasRenderingContext2D, answer: Answer, progress: number): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = "#050403";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#e4b84a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(w / 2, 210, 78, 0, Math.PI * 2);
  ctx.stroke();
  const open = progress > 0.08 && progress < 0.92 ? 6 + Math.abs(Math.sin(progress * Math.PI * 10)) * 16 : 4;
  ctx.fillStyle = "#ffd56a";
  ctx.beginPath();
  ctx.ellipse(w / 2, 228, 16, open, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6edd8";
  ctx.font = "600 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("GRAHAM", w / 2, 340);
  ctx.fillStyle = "#a89472";
  ctx.font = "16px sans-serif";
  ctx.fillText("Daniel's line", w / 2, 368);
  wrap(ctx, answer.headline, w / 2, 460, w - 96, 40, "#f6edd8", "600 32px Georgia, serif");
  const detail = answer.detail.slice(0, Math.max(0, Math.floor(answer.detail.length * Math.min(1, progress * 1.15))));
  wrap(ctx, detail, w / 2, 640, w - 110, 30, "#f6edd8", "22px sans-serif");
  if (answer.price && progress > 0.4) {
    ctx.fillStyle = "#ffd56a";
    ctx.font = "600 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(answer.price, w / 2, h - 210);
  }
  if (progress > 0.55) {
    wrap(ctx, answer.reason, w / 2, h - 160, w - 110, 26, "#a89472", "18px sans-serif");
  }
}
