const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

export function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), { ...init, headers: { ...JSON_HEADERS, ...(init.headers ?? {}) } });
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: string[],
  ) {
    super(message);
  }
}

export function error(status: number, code: string, message: string, details?: string[]): Response {
  return json({ error: code, message, ...(details ? { details } : {}) }, { status });
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

export function str(v: unknown, max = 1000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function bool(v: unknown): boolean {
  return v === true || v === "true" || v === 1 || v === "1";
}

export function int(v: unknown, fallback: number | null = null): number | null {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

/**
 * Minimal router for a function mounted on a wildcard path. Patterns use
 * `:name` segments. Handlers receive the parsed params.
 */
export type Handler = (req: Request, params: Record<string, string>) => Promise<Response>;

export class Router {
  private routes: Array<{ method: string; parts: string[]; handler: Handler }> = [];

  on(method: string, pattern: string, handler: Handler): this {
    this.routes.push({ method, parts: pattern.split("/").filter(Boolean), handler });
    return this;
  }

  async handle(req: Request): Promise<Response> {
    const url = new URL(req.url);
    // `netlify dev` mimics CDN file shadowing: after a 403/404 it retries the
    // request as /path.html, /path/index.html, etc. Strip those so the retry
    // reaches the same handler and the original status and body survive.
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
        if (e instanceof HttpError) return error(e.status, e.code, e.message, e.details);
        console.error(`[stateside] ${req.method} ${url.pathname} failed`, e);
        return error(500, "internal", "Something went wrong on our side. Please try again.");
      }
    }
    return pathMatched ? error(405, "method_not_allowed", `${req.method} is not allowed here.`) : error(404, "not_found", "No such endpoint.");
  }
}
