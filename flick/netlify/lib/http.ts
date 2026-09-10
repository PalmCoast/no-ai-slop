const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

export function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), { ...init, headers: { ...JSON_HEADERS, ...(init.headers ?? {}) } });
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export function error(status: number, code: string, message: string): Response {
  return json({ error: code, message }, { status });
}

export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    const text = await req.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function int(value: unknown, fallback: number | null = null): number | null {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export type Handler = (req: Request, params: Record<string, string>) => Promise<Response>;

export class Router {
  private routes: Array<{ method: string; parts: string[]; handler: Handler }> = [];

  on(method: string, pattern: string, handler: Handler): this {
    this.routes.push({ method, parts: pattern.split("/").filter(Boolean), handler });
    return this;
  }

  async handle(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/(\/index)?\.html?$/, "");
    const parts = pathname.split("/").filter(Boolean);
    let pathMatched = false;
    for (const route of this.routes) {
      if (route.parts.length !== parts.length) continue;
      const params: Record<string, string> = {};
      let ok = true;
      for (let i = 0; i < parts.length; i++) {
        const p = route.parts[i]!;
        const v = parts[i]!;
        if (p.startsWith(":")) params[p.slice(1)] = decodeURIComponent(v);
        else if (p !== v) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      pathMatched = true;
      if (route.method !== req.method) continue;
      try {
        return await route.handler(req, params);
      } catch (e) {
        if (e instanceof HttpError) return error(e.status, e.code, e.message);
        console.error(`[flick] ${req.method} ${url.pathname} failed`, e);
        return error(500, "internal", "Something went wrong on our side. Please try again.");
      }
    }
    return pathMatched
      ? error(405, "method_not_allowed", `${req.method} is not allowed here.`)
      : error(404, "not_found", "No such endpoint.");
  }
}
