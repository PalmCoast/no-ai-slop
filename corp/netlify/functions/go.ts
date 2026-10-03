import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { cleanToken, goTarget, isAuditSrc } from "../../shared/go-links.ts";

const BOT_RE =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|skype|curl|wget|python|httpx|aiohttp|go-http|java\/|okhttp|axios|node-fetch|undici|headless|phantom|puppeteer|playwright|lighthouse|pagespeed|monitor|uptime|scan|check|validator|feed|fetch|archiver|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|gptbot|claude|perplexity|chatgpt|oai-search|google-extended|bingpreview/i;
const TEST_RE = /ah-clicktest/i;

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
  const test = TEST_RE.test(ua);
  const bot = !test && (!ua || BOT_RE.test(ua));
  // Audit mode: agents and site audits call /go/<name>?src=audit. Never redirect them to
  // Stripe, because loading a Payment Link creates a real Checkout Session.
  const audit = isAuditSrc(url.searchParams.get("src"));
  const kind = audit ? "audit" : test ? "test" : bot ? "bot" : "human";
  const prefetch = /prefetch|prerender/i.test(
    (req.headers.get("sec-purpose") || "") + (req.headers.get("purpose") || "") + (req.headers.get("x-moz") || ""),
  );

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
      audit,
      country: context.geo?.country?.code || null,
      target,
    };
    try {
      const write = getStore({ name: "go-clicks", consistency: "strong" }).setJSON(key, event);
      if (context.waitUntil) context.waitUntil(write.catch((e: unknown) => console.error("go: blob write failed", e)));
      else await write;
    } catch (e) {
      console.error("go: blob write failed", e);
    }
  }

  if (audit) {
    return new Response(`audit: /go/${name} -> ${target}\n`, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-go-target": target,
        "cache-control": "no-store, max-age=0",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      location: target,
      "cache-control": "no-store, max-age=0",
      "x-robots-tag": "noindex, nofollow",
      "referrer-policy": "no-referrer-when-downgrade",
    },
  });
};

export const config: Config = {
  path: "/go/:name",
  method: "GET",
};
