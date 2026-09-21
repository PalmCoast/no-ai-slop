import { deflateSync } from "node:zlib";
import { placeLine, type CheckReport } from "./check.ts";

const WIDTH = 1200;
const HEIGHT = 630;

const CREAM: RGB = [246, 237, 216];
const INK: RGB = [28, 25, 21];
const STEEL: RGB = [92, 86, 76];
const BAND: RGB = [232, 223, 204];

type RGB = [number, number, number];

const FONT: Record<string, number[]> = {
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  I: [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  J: [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  S: [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b10101, 0b01010],
  X: [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  "0": [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  "1": [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  "2": [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  "3": [0b11110, 0b00001, 0b00001, 0b01110, 0b00001, 0b00001, 0b11110],
  "4": [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  "5": [0b11111, 0b10000, 0b10000, 0b11110, 0b00001, 0b00001, 0b11110],
  "6": [0b01110, 0b10000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  "7": [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  "8": [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  "9": [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00001, 0b01110],
  ".": [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b01100, 0b01100],
  ",": [0b00000, 0b00000, 0b00000, 0b00000, 0b00100, 0b00100, 0b01000],
  ":": [0b00000, 0b01100, 0b01100, 0b00000, 0b01100, 0b01100, 0b00000],
  "-": [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
  "'": [0b00100, 0b00100, 0b01000, 0b00000, 0b00000, 0b00000, 0b00000],
  "/": [0b00001, 0b00010, 0b00010, 0b00100, 0b01000, 0b01000, 0b10000],
  "+": [0b00000, 0b00100, 0b00100, 0b11111, 0b00100, 0b00100, 0b00000],
  "&": [0b01100, 0b10010, 0b10100, 0b01000, 0b10101, 0b10010, 0b01101],
  " ": [0, 0, 0, 0, 0, 0, 0],
};

export function renderCheckCardPng(report: CheckReport): Uint8Array {
  const canvas = new Uint8Array(WIDTH * HEIGHT * 3);
  fillRect(canvas, 0, 0, WIDTH, HEIGHT, CREAM);
  fillRect(canvas, 0, 0, 18, HEIGHT, STEEL);
  const place = placeLine(report).toUpperCase();
  drawText(canvas, "ASKYARD CHECK", 64, 54, 3, STEEL);
  drawWrapped(canvas, report.name.toUpperCase(), 64, 118, 8, INK, 1000, 2);
  drawText(canvas, place || "NO CITY GIVEN", 64, 280, 4, STEEL);
  const count = `${report.gaps.length} GAP${report.gaps.length === 1 ? "" : "S"}`;
  drawText(canvas, count, 64, 340, 4, INK);
  drawText(canvas, report.evidenceLabel.toUpperCase(), 420, 340, 3, STEEL);
  const lines = (report.gaps.length ? report.gaps : [{ cardLine: "PUBLIC PAGE HAS THE BASICS" }]).slice(0, 3);
  lines.forEach((item, index) => {
    drawText(canvas, item.cardLine, 64, 400 + index * 36, 3, INK);
  });
  fillRect(canvas, 0, 548, WIDTH, 82, BAND);
  drawText(canvas, "INDEXME.LOL  GETS THE PAGE FOUND", 64, 572, 3, INK);
  return encodePng(canvas);
}

export function renderToolCardPng(): Uint8Array {
  const canvas = new Uint8Array(WIDTH * HEIGHT * 3);
  fillRect(canvas, 0, 0, WIDTH, HEIGHT, CREAM);
  fillRect(canvas, 0, 0, 18, HEIGHT, STEEL);
  drawText(canvas, "ASKYARD", 64, 70, 4, STEEL);
  drawWrapped(canvas, "WHAT AI KNOWS ABOUT YOUR SHOP", 64, 150, 7, INK, 1040, 2);
  drawText(canvas, "PASTE A NAME, CITY, OR URL", 64, 360, 4, STEEL);
  drawText(canvas, "FREE. NO LOGIN.", 64, 420, 4, INK);
  fillRect(canvas, 0, 548, WIDTH, 82, BAND);
  drawText(canvas, "INDEXME.LOL  GETS THE PAGE FOUND", 64, 572, 3, INK);
  return encodePng(canvas);
}

function drawWrapped(canvas: Uint8Array, text: string, x: number, y: number, scale: number, color: RGB, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (textWidth(next, scale) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines && shown.length) {
    shown[shown.length - 1] = trimToWidth(`${shown[shown.length - 1]}...`, scale, maxWidth);
  }
  let fitted = scale;
  while (fitted > 3 && shown.some((line) => textWidth(line, fitted) > maxWidth)) fitted -= 1;
  shown.forEach((line, index) => {
    drawText(canvas, line, x, y + index * (fitted * 8 + 8), fitted, color);
  });
}

function trimToWidth(text: string, scale: number, maxWidth: number): string {
  let next = text;
  while (next.length > 1 && textWidth(next, scale) > maxWidth) next = next.slice(0, -1);
  return next;
}

const ADVANCE = 7;

function textWidth(text: string, scale: number): number {
  return text.length * ADVANCE * scale;
}

function drawText(canvas: Uint8Array, text: string, x: number, y: number, scale: number, color: RGB) {
  let cursor = x;
  for (const char of text.toUpperCase()) {
    const glyph = FONT[char] ?? FONT[" "];
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        if ((glyph[row] >> (4 - col)) & 1) {
          fillRect(canvas, cursor + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursor += ADVANCE * scale;
  }
}

function fillRect(canvas: Uint8Array, x: number, y: number, w: number, h: number, color: RGB) {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(WIDTH, x + w);
  const y1 = Math.min(HEIGHT, y + h);
  for (let py = y0; py < y1; py += 1) {
    let offset = (py * WIDTH + x0) * 3;
    for (let px = x0; px < x1; px += 1) {
      canvas[offset] = color[0];
      canvas[offset + 1] = color[1];
      canvas[offset + 2] = color[2];
      offset += 3;
    }
  }
}

function encodePng(rgb: Uint8Array): Uint8Array {
  const raw = new Uint8Array((WIDTH * 3 + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    const rawStart = y * (WIDTH * 3 + 1);
    raw[rawStart] = 0;
    raw.set(rgb.subarray(y * WIDTH * 3, (y + 1) * WIDTH * 3), rawStart + 1);
  }
  const compressed = deflateSync(raw);
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, WIDTH);
  view.setUint32(4, HEIGHT);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const signature = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [signature, chunk("IHDR", ihdr), chunk("IDAT", compressed), chunk("IEND", new Uint8Array())];
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const png = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    png.set(part, offset);
    offset += part.length;
  }
  return png;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out[4] = type.charCodeAt(0);
  out[5] = type.charCodeAt(1);
  out[6] = type.charCodeAt(2);
  out[7] = type.charCodeAt(3);
  out.set(data, 8);
  const crc = crc32(out.subarray(4, 8 + data.length));
  view.setUint32(8 + data.length, crc);
  return out;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
