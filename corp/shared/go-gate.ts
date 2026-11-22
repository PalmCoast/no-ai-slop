// Bot gate and click-analytics helpers for agenthiveinc.com/go/<name>.
// Bot list matches firstdeploy.ai's live /go function (BOT_RE + empty UA).
// TEST_RE stays AgentHive-specific (ah-clicktest), parallel to fd-clicktest.

export const POSTHOG_KEY = "phc_y9BPZxQLpF7FviUKN6JSBqSUD7fcnwXuXzHzDQ8asLjv";
export const POSTHOG_HOST = "https://us.i.posthog.com";
export const POSTHOG_PROJECT = "598301";
export const POSTHOG_COOKIE = `ph_${POSTHOG_KEY}_posthog`;
export const ANON_COOKIE = "ah_go_id";
export const POSTHOG_TIMEOUT_MS = 500;

// Same regex as firstdeploy.ai netlify/functions/go.mjs, including "quora link".
export const BOT_RE =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|skype|curl|wget|python|httpx|aiohttp|go-http|java\/|okhttp|axios|node-fetch|undici|headless|phantom|puppeteer|playwright|lighthouse|pagespeed|monitor|uptime|scan|check|validator|feed|fetch|archiver|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|gptbot|claude|perplexity|chatgpt|oai-search|google-extended|bingpreview/i;
export const TEST_RE = /ah-clicktest/i;

export const BOT_FORBIDDEN_BODY = "Checkout links open for people, not bots.";

export function isPrefetch(req: Request): boolean {
  return /prefetch|prerender/i.test(
    (req.headers.get("sec-purpose") || "") + (req.headers.get("purpose") || "") + (req.headers.get("x-moz") || ""),
  );
}

export function classifyUa(ua: string): { test: boolean; bot: boolean; kind: "test" | "bot" | "human" } {
  const test = TEST_RE.test(ua);
  const bot = !test && (!ua || BOT_RE.test(ua));
  const kind = test ? "test" : bot ? "bot" : "human";
  return { test, bot, kind };
}

function cookieValue(header: string, name: string): string {
  const parts = header.split(/;\s*/);
  const prefix = name + "=";
  for (const part of parts) {
    if (part.startsWith(prefix)) return part.slice(prefix.length);
  }
  return "";
}

function distinctFromPosthogCookie(raw: string): string {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { distinct_id?: unknown };
    const id = String(parsed?.distinct_id || "").trim();
    return id.slice(0, 200);
  } catch {
    return "";
  }
}

export function distinctIdFromRequest(req: Request): { id: string; setCookie: string | null } {
  const header = req.headers.get("cookie") || "";
  const fromPh = distinctFromPosthogCookie(cookieValue(header, POSTHOG_COOKIE));
  if (fromPh) return { id: fromPh, setCookie: null };
  const fromAnon = decodeURIComponent(cookieValue(header, ANON_COOKIE)).trim().slice(0, 200);
  if (fromAnon) return { id: fromAnon, setCookie: null };
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? `anon_${crypto.randomUUID()}` : `anon_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  const setCookie = `${ANON_COOKIE}=${encodeURIComponent(id)}; Path=/; Secure; SameSite=Lax; Max-Age=31536000`;
  return { id, setCookie };
}

export function incomingUtms(url: URL): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (/^utm_[a-z0-9_]+$/i.test(key) && value) out[key.toLowerCase()] = value.slice(0, 200);
  }
  return out;
}

export function destinationUtms(dest: URL): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of dest.searchParams.entries()) {
    if (/^utm_[a-z0-9_]+$/i.test(key) && value) out[key.toLowerCase()] = value.slice(0, 200);
  }
  return out;
}

export type GoClickProperties = {
  slug: string;
  from: string;
  destination_host: string;
  destination: string;
  href: string;
  client_reference_id: string | null;
  referer: string;
  kind: "human" | "test";
  via: "server_go";
  site: string;
  project: string;
  country?: string | null;
  [key: string]: string | null | undefined;
};

export function goClickProperties(opts: {
  slug: string;
  from: string;
  dest: URL;
  requestUrl: URL;
  referer: string;
  kind: "human" | "test";
  country?: string | null;
}): GoClickProperties {
  const destUtms = destinationUtms(opts.dest);
  const reqUtms = incomingUtms(opts.requestUrl);
  const cref = opts.dest.searchParams.get("client_reference_id");
  return {
    slug: opts.slug,
    from: opts.from,
    destination_host: opts.dest.host,
    destination: opts.dest.toString(),
    href: opts.dest.origin + opts.dest.pathname,
    client_reference_id: cref,
    referer: opts.referer.slice(0, 500),
    kind: opts.kind,
    via: "server_go",
    site: "agenthiveinc.com",
    project: POSTHOG_PROJECT,
    country: opts.country ?? null,
    product: opts.slug,
    page: opts.requestUrl.pathname,
    // Destination UTMs (what we stamp on the 302) win; incoming utm_* still pass through if unset.
    ...reqUtms,
    ...destUtms,
  };
}

type CaptureFetch = (input: string, init: RequestInit) => Promise<unknown>;

export async function captureGoEvents(
  distinctId: string,
  properties: GoClickProperties,
  fetchImpl: CaptureFetch = fetch,
  timeoutMs = POSTHOG_TIMEOUT_MS,
): Promise<void> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const now = new Date().toISOString();
  const shared = {
    distinct_id: distinctId,
    properties: { ...properties, $lib: "agenthive-go", distinct_id: distinctId },
    timestamp: now,
  };
  try {
    await fetchImpl(`${POSTHOG_HOST}/batch/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        batch: [
          { event: "buy_click", ...shared },
          { event: "go_click", ...shared },
        ],
      }),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}
