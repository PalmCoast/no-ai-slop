export function deskKey(): string | undefined {
  if (typeof Netlify !== "undefined") return Netlify.env.get("GRAHAM_DESK_KEY") || undefined;
  return process.env.GRAHAM_DESK_KEY || undefined;
}

export function deskOpen(req: Request): boolean {
  const key = deskKey();
  if (!key) return true;
  return req.headers.get("x-graham-key") === key;
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}
