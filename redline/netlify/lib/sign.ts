import { createHmac, timingSafeEqual } from "node:crypto";

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function signToken(sessionId: string, secret: string): string {
  const body = b64url(Buffer.from(JSON.stringify({ product: "redline", plan: "once", sessionId })));
  const sig = b64url(createHmac("sha256", secret).update(body).digest());
  return `REDLINE1.${body}.${sig}`;
}

export function verifyToken(token: string, secret: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "REDLINE1" || !parts[1] || !parts[2]) return false;
  const expected = b64url(createHmac("sha256", secret).update(parts[1]).digest());
  const left = Buffer.from(expected);
  const right = Buffer.from(parts[2]);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function integrationId(random: () => number = Math.random): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let suffix = "";
  for (let i = 0; i < 8; i++) suffix += alphabet[Math.floor(random() * alphabet.length)];
  return `redline-once-${suffix}`;
}
