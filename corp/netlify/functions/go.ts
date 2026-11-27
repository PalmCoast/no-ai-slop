import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { cleanToken, goTarget, GO_LINKS } from "../../shared/go-links.ts";
import { TRIAGE_SCHEDULE_URL } from "../../shared/brand.ts";
import {
  BOT_FORBIDDEN_BODY,
  captureGoEvents,
  classifyUa,
  distinctIdFromRequest,
  goClickProperties,
  goOkSetCookie,
  interstitialHtml,
  isHiveHost,
  isInternalTraffic,
  isPrefetch,
  resolveGoGate,
  sessionIdFromRequest,
} from "../../shared/go-gate.ts";

function fromOf(url: URL, referer: string): string {
  const q = cleanToken(url.searchParams.get("from"));
  if (q) return q;
  try {
    const r = new URL(referer);
    if (isHiveHost(r.hostname)) {
      return cleanToken(r.pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-")) || "home";
    }
    if (/(^|\.)(t\.co|x\.com|twitter\.com)$/i.test(r.hostname)) return "x";
    return cleanToken("ext-" + r.hostname);
  } catch {
    return "direct";
  }
}

const noStore = {
  "cache-control": "no-store, max-age=0",
  "x-robots-tag": "noindex, nofollow",
};

function clientIp(req: Request, context: Context): string | null {
  const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("x-nf-client-connection-ip") || "";
  const first = forwarded.split(",")[0]?.trim();
  if (first) return first.slice(0, 80);
  const ip = (context as Context & { ip?: string }).ip;
  return ip ? String(ip).slice(0, 80) : null;
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const name = cleanToken(context.params?.name || url.pathname.split("/").pop(), 60);
  const referer = req.headers.get("referer") || "";
  const from = fromOf(url, referer);

  // 2026-11-27: /go/triage logs the free-triage click server-side, then 302s to the
  // same Google appointment schedule /triage uses. Nothing to protect, so bots get
  // the 302 too, but only non-internal human hits are sent to PostHog.
  if (name === "triage") {
    return triage(req, context, url, referer, from);
  }

  const target = goTarget(name, from);
  if (!target) {
    return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  }

  const ua = req.headers.get("user-agent") || "";
  const { test, bot, kind } = classifyUa(ua);
  const prefetch = isPrefetch(req);
  const dest = new URL(target);
  const gate = bot ? null : resolveGoGate(req, url, name);

  if (req.method === "GET" && !prefetch) {
    const ts = new Date().toISOString();
    const rand = Math.random().toString(36).slice(2, 8);
    const key = `ev/${name}/${ts.slice(0, 10)}/${ts}_${kind}_${from}_${rand}`;
    const event = {
      name,
      from,
      referer: referer.slice(0, 500),
      ts,
      ua: ua.slice(0, 400),
      bot,
      test,
      country: context.geo?.country?.code || null,
      target,
      gate: gate || (bot ? "bot" : "interstitial"),
    };
    try {
      const write = getStore({ name: "go-clicks", consistency: "strong" }).setJSON(key, event);
      if (context.waitUntil) context.waitUntil(write.catch((e: unknown) => console.error("go: blob write failed", e)));
      else await write;
    } catch (e) {
      console.error("go: blob write failed", e);
    }
  }

  if (bot) {
    return new Response(BOT_FORBIDDEN_BODY, {
      status: 403,
      headers: { ...noStore, "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (prefetch) {
    return new Response(null, { status: 204, headers: noStore });
  }

  if (!gate) {
    const action = url.pathname + url.search;
    const label = GO_LINKS[name]?.label || "checkout";
    return new Response(interstitialHtml(action, label), {
      status: 200,
      headers: { ...noStore, "content-type": "text/html; charset=utf-8" },
    });
  }

  const outHeaders = new Headers(noStore);
  outHeaders.set("location", target);
  outHeaders.set("referrer-policy", "no-referrer-when-downgrade");
  outHeaders.append("set-cookie", goOkSetCookie());
  const { id, setCookie } = distinctIdFromRequest(req);
  if (setCookie) outHeaders.append("set-cookie", setCookie);

  const properties = goClickProperties({
    slug: name,
    from,
    dest,
    requestUrl: url,
    referer,
    kind: kind === "test" ? "test" : "human",
    country: context.geo?.country?.code || null,
    gate,
    userAgent: ua,
    ip: clientIp(req, context),
    sessionId: sessionIdFromRequest(req),
  });
  if (kind === "human" && !isInternalTraffic(properties.$ip, ua)) {
    const send = captureGoEvents(id, properties).catch((e: unknown) => console.error("go: posthog capture failed", e));
    if (context.waitUntil) context.waitUntil(send);
    else await send;
  }

  return new Response(null, {
    status: 302,
    headers: outHeaders,
  });
};

async function triage(req: Request, context: Context, url: URL, referer: string, from: string): Promise<Response> {
  const ua = req.headers.get("user-agent") || "";
  const { kind } = classifyUa(ua);
  const headers = new Headers(noStore);
  headers.set("location", TRIAGE_SCHEDULE_URL);
  if (req.method === "GET" && !isPrefetch(req) && kind === "human") {
    const ip = clientIp(req, context);
    if (!isInternalTraffic(ip, ua)) {
      const { id, setCookie } = distinctIdFromRequest(req);
      if (setCookie) headers.append("set-cookie", setCookie);
      const properties = goClickProperties({
        slug: "triage",
        from,
        dest: new URL(TRIAGE_SCHEDULE_URL),
        requestUrl: url,
        referer,
        kind: "human",
        country: context.geo?.country?.code || null,
        gate: "triage",
        userAgent: ua,
        ip,
        sessionId: sessionIdFromRequest(req),
      });
      properties.cta = "triage";
      const send = captureGoEvents(id, properties).catch((e: unknown) => console.error("go: posthog capture failed", e));
      if (context.waitUntil) context.waitUntil(send);
      else await send;
    }
  }
  return new Response(null, { status: 302, headers });
}

export const config: Config = {
  path: "/go/:name",
  method: ["GET", "POST"],
};
