export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function error(status: number, code: string, message: string, extra: Record<string, unknown> = {}): Response {
  return json({ error: code, message, ...extra }, { status });
}

export function text(body: string, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "text/plain; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(body, { ...init, headers });
}

export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function licenseFromRequest(req: Request, body?: { licenseKey?: unknown } | null): string {
  const url = new URL(req.url);
  const fromHeader = req.headers.get("x-sonaris-license");
  const fromQuery = url.searchParams.get("key");
  const fromBody = typeof body?.licenseKey === "string" ? body.licenseKey : "";
  return (fromHeader || fromQuery || fromBody || "").trim().toUpperCase();
}
