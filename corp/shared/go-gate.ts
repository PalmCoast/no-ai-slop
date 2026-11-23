// Bot gate and click-analytics helpers for agenthiveinc.com/go/<name>.
// Bot list matches firstdeploy.ai's live /go function (BOT_RE + empty UA).
// TEST_RE stays AgentHive-specific (ah-clicktest), parallel to fd-clicktest.
//
// Tight gate (2026-11-23): a non-bot request 302s only with a same-site
// Referer or a JS-set ah_go_ok cookie (or a POST confirm from the interstitial).
// Otherwise the buyer gets an HTML click-through page. Bot UAs still 403.

import { GO_PRODUCT } from "./go-links.ts";

export const POSTHOG_KEY = "phc_y9BPZxQLpF7FviUKN6JSBqSUD7fcnwXuXzHzDQ8asLjv";
export const POSTHOG_HOST = "https://us.i.posthog.com";
export const POSTHOG_PROJECT = "598301";
export const POSTHOG_COOKIE = `ph_${POSTHOG_KEY}_posthog`;
export const ANON_COOKIE = "ah_go_id";
export const GO_OK_COOKIE = "ah_go_ok";
export const GO_OK_COOKIE_VALUE = "1";
export const POSTHOG_TIMEOUT_MS = 500;
export const GO_LIB = "agenthive-go";
export const GO_LIB_VERSION = "2026-11-23";

// Same regex as firstdeploy.ai netlify/functions/go.mjs, including "quora link".
export const BOT_RE =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|skype|curl|wget|python|httpx|aiohttp|go-http|java\/|okhttp|axios|node-fetch|undici|headless|phantom|puppeteer|playwright|lighthouse|pagespeed|monitor|uptime|scan|check|validator|feed|fetch|archiver|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|gptbot|claude|perplexity|chatgpt|oai-search|google-extended|bingpreview/i;
export const TEST_RE = /ah-clicktest/i;

export const BOT_FORBIDDEN_BODY = "Checkout links open for people, not bots.";

export type GoGate = "referer" | "cookie" | "confirm";

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

export function hasGoOkCookie(req: Request): boolean {
  const raw = decodeURIComponent(cookieValue(req.headers.get("cookie") || "", GO_OK_COOKIE)).trim();
  return raw === GO_OK_COOKIE_VALUE || raw === "1" || raw === "true";
}

export function goOkSetCookie(): string {
  return `${GO_OK_COOKIE}=${GO_OK_COOKIE_VALUE}; Path=/; Secure; SameSite=Lax; Max-Age=1800`;
}

/** agenthiveinc.com and its subdomains, plus this site's Netlify prod and deploy-preview hosts. */
export function isHiveHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, "");
  if (/(^|\.)agenthiveinc\.com$/i.test(h)) return true;
  if (h === "dashing-cascaron-ddd950.netlify.app") return true;
  if (h.endsWith("--dashing-cascaron-ddd950.netlify.app")) return true;
  return false;
}

export function isSameSiteReferer(referer: string, requestUrl: URL): boolean {
  if (!referer) return false;
  try {
    const r = new URL(referer);
    if (r.protocol !== "http:" && r.protocol !== "https:") return false;
    const rh = r.hostname.toLowerCase().replace(/\.$/, "");
    const hh = requestUrl.hostname.toLowerCase().replace(/\.$/, "");
    if (rh === hh) return true;
    return isHiveHost(rh) && isHiveHost(hh);
  } catch {
    return false;
  }
}

export function resolveGoGate(req: Request, requestUrl: URL): GoGate | null {
  if (req.method === "POST") return "confirm";
  if (hasGoOkCookie(req)) return "cookie";
  if (isSameSiteReferer(req.headers.get("referer") || "", requestUrl)) return "referer";
  return null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** HTML fallback when a human UA arrives with no same-site Referer and no ah_go_ok cookie. */
export function interstitialHtml(actionUrl: string, label: string): string {
  const action = escapeHtml(actionUrl);
  const title = escapeHtml(label || "checkout");
  const cookieJs = JSON.stringify(`${GO_OK_COOKIE}=${GO_OK_COOKIE_VALUE}; Path=/; Secure; SameSite=Lax; Max-Age=1800`);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Continue to checkout</title>
  <style>
    body{font-family:system-ui,sans-serif;background:#14110e;color:#f5f1e8;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center}
    main{max-width:28rem;padding:2rem;text-align:center}
    h1{font-size:1.35rem;margin:0 0 .75rem}
    p{margin:0 0 1.25rem;line-height:1.45;color:#d9d2c5}
    button{appearance:none;border:0;background:#ff4d0f;color:#fff;font:inherit;font-weight:650;padding:.8rem 1.2rem;border-radius:.4rem;cursor:pointer}
    button:hover{background:#e6450d}
  </style>
</head>
<body>
  <main>
    <h1>Continue to checkout</h1>
    <p>One more click confirms this is you, then we will send you to ${title}.</p>
    <form method="POST" action="${action}" id="go-confirm">
      <button type="submit">Continue to checkout</button>
    </form>
  </main>
  <script>
    document.getElementById("go-confirm").addEventListener("submit", function () {
      document.cookie = ${cookieJs};
    });
  </script>
</body>
</html>
`;
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

export function sessionIdFromRequest(req: Request): string | null {
  const raw = cookieValue(req.headers.get("cookie") || "", POSTHOG_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { $sesid?: unknown; session_id?: unknown };
    const sesid = parsed?.$sesid;
    if (Array.isArray(sesid) && sesid.length >= 2) {
      const id = String(sesid[1] || "").trim();
      if (id) return id.slice(0, 200);
    }
    const sid = String(parsed?.session_id || "").trim();
    return sid ? sid.slice(0, 200) : null;
  } catch {
    return null;
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
  bot_verdict: "human" | "test";
  gate: GoGate;
  $lib: string;
  $lib_version: string;
  $source: string;
  $current_url: string;
  $referrer: string;
  $host: string;
  $pathname: string;
  $raw_user_agent: string;
  $ip?: string | null;
  $session_id?: string | null;
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
  gate: GoGate;
  userAgent?: string;
  ip?: string | null;
  sessionId?: string | null;
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
    product: GO_PRODUCT[opts.slug] || opts.slug,
    page: opts.requestUrl.pathname,
    bot_verdict: opts.kind,
    gate: opts.gate,
    $lib: GO_LIB,
    $lib_version: GO_LIB_VERSION,
    $source: "server_go",
    $current_url: opts.requestUrl.toString().slice(0, 1000),
    $referrer: opts.referer.slice(0, 500),
    $host: opts.requestUrl.host,
    $pathname: opts.requestUrl.pathname,
    $raw_user_agent: (opts.userAgent || "").slice(0, 400),
    $ip: opts.ip ?? null,
    $session_id: opts.sessionId ?? null,
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
  // $process_person_profile stitches this to the browser person when we
  // reused the ph_* cookie distinct_id. $ip + $raw_user_agent let PostHog's
  // own bot detection judge the client, not the Netlify function's UA.
  // bot_verdict / gate / via stay queryable even if traffic_type is Automation.
  const eventProps = {
    ...properties,
    $lib: GO_LIB,
    $lib_version: GO_LIB_VERSION,
    $source: "server_go",
    distinct_id: distinctId,
    $process_person_profile: true,
  };
  const shared = {
    distinct_id: distinctId,
    properties: eventProps,
    timestamp: now,
  };
  try {
    await fetchImpl(`${POSTHOG_HOST}/batch/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // Do not spoof a browser UA on the capture request; the client UA is in $raw_user_agent.
      },
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
