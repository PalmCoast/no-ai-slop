import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { cleanToken, goTarget, GO_LINKS } from "../../shared/go-links.ts";
import {
  BOT_FORBIDDEN_BODY,
  captureGoEvents,
  classifyUa,
  distinctIdFromRequest,
  goClickProperties,
  goOkSetCookie,
  interstitialHtml,
  isPrefetch,
  resolveGoGate,
  sessionIdFromRequest,
} from "../../shared/go-gate.ts";

function fromOf(url: URL, referer: string): string {
  const q = cleanToken(url.searchParams.get("from"));
  if (q) return q;
  try {
    const r = new URL(referer);
    if (/(^|\.)agenthiveinc\.com$/i.test(r.hostname)) {
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
  const target = goTarget(name, from);
  if (!target) {
    return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  }

  const ua = req.headers.get("user-agent") || "";
  const { test, bot, kind } = classifyUa(ua);
  const prefetch = isPrefetch(req);
  const dest = new URL(target);
  const gate = bot ? null : resolveGoGate(req, url);

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
  const send = captureGoEvents(id, properties).catch((e: unknown) => console.error("go: posthog capture failed", e));
  if (context.waitUntil) context.waitUntil(send);
  else await send;

  return new Response(null, {
    status: 302,
    headers: outHeaders,
  });
};

export const config: Config = {
  path: "/go/:name",
  method: ["GET", "POST"],
};
