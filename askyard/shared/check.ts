import { SALE_APPS } from "./catalog.ts";
import {
  BRAND_COMPANY,
  BRAND_NAME,
  BRAND_PARENT,
  BRAND_PLACE,
  BRAND_URL,
  CALENDLY_URL,
  COMPANY_URL,
  CONSULT_RATES,
  FD_PRICE_LONG,
  FD_PROMISE,
} from "./brand.ts";
import { askAiLinks, type AskAiProvider } from "./reputation.ts";

export const GAP_IDS = [
  "demo-fictional",
  "demo-blank",
  "no-website",
  "no-sitemap",
  "no-indexnow",
  "missing-phone",
  "missing-hours",
  "scrape-blocked",
  "scrape-failed",
  "scrape-unavailable",
  "windows-cal",
] as const;

export type GapId = (typeof GAP_IDS)[number];
export type Tri = "found" | "missing" | "unknown";
export type CheckSource = "website" | "name" | "google" | "facebook" | "demo";
export type EvidenceLabel = "Live scrape" | "Not a live scrape" | "Demo shop";

export const MODEL_LABEL = "Opened with this prompt" as const;

export const MODEL_NOTE =
  "Opened with this prompt. If a model names a different phone, a different city, or another company, it invented a different business.";

const GAP_TEXT: Record<GapId, string> = {
  "demo-fictional": "Harbor HVAC is a fictional Palm Coast shop for this card. It is not a client.",
  "demo-blank": "Phone and hours are blank on purpose. Open a model and see if it invents a business.",
  "no-website": "No website URL, so there is no sitemap or IndexNow key to check.",
  "no-sitemap": "No sitemap in robots.txt, and /sitemap.xml did not answer with a sitemap.",
  "no-indexnow": "No IndexNow mention on the page or in robots.txt.",
  "missing-phone": "No phone number on the page we fetched.",
  "missing-hours": "No hours in the page schema or in the visible hours text.",
  "scrape-blocked": "Google and Facebook pages block a live scrape. The model links open the prompt. That is not a live answer.",
  "scrape-failed": "The site did not answer, so there is no sitemap or IndexNow evidence from here.",
  "scrape-unavailable": "The live scrape did not run from here. Model links still open the prompt. Site facts are not filled in.",
  "windows-cal": "The page mentions Windows Server or CALs.",
};

const GAP_CARD_LINE: Record<GapId, string> = {
  "demo-fictional": "FICTIONAL DEMO SHOP",
  "demo-blank": "PHONE AND HOURS LEFT BLANK",
  "no-website": "NO PUBLIC SITE ON FILE",
  "no-sitemap": "NO SITEMAP EVIDENCE",
  "no-indexnow": "NO INDEXNOW EVIDENCE",
  "missing-phone": "NO PHONE ON THE PAGE",
  "missing-hours": "NO HOURS ON THE PAGE",
  "scrape-blocked": "PAGE BLOCKS A LIVE SCRAPE",
  "scrape-failed": "SITE DID NOT ANSWER",
  "scrape-unavailable": "LIVE SCRAPE DID NOT RUN",
  "windows-cal": "WINDOWS SERVER OR CAL QUOTE",
};

const MODEL_ORDER: AskAiProvider["name"][] = ["Grok", "ChatGPT", "Claude", "Perplexity", "Gemini", "Google"];

export type ParsedCheck = {
  sourceKind: Exclude<CheckSource, "demo">;
  name: string;
  city: string;
  url: string | null;
};

export type SiteEvidence = {
  fetched: boolean;
  blocked: boolean;
  failed: boolean;
  unavailable: boolean;
  phone: string | null;
  hours: string | null;
  sitemap: Tri;
  indexnow: Tri;
  mentionsWindowsCal: boolean;
  finalUrl: string | null;
};

export type CheckFact = { label: string; value: string };

export type CheckGap = { id: GapId; text: string; cardLine: string };

export type CheckModel = {
  name: AskAiProvider["name"];
  href: string;
  label: typeof MODEL_LABEL;
};

export type CheckReport = {
  demo: boolean;
  sourceKind: CheckSource;
  name: string;
  city: string;
  url: string | null;
  phone: string | null;
  hours: string | null;
  sitemap: Tri;
  indexnow: Tri;
  evidenceLabel: EvidenceLabel;
  prompt: string;
  models: CheckModel[];
  gaps: CheckGap[];
  facts: CheckFact[];
  note: string;
  ctas: {
    indexme: string;
    indexmeStudio: string;
    indexmePrice: string;
    firstDeploy: string;
    firstDeployPrice: string;
    calendly: string;
    consultPay: string;
    consultRates: string;
    netyard: string | null;
    askyard: string;
  };
  sharePath: string;
  imagePath: string;
  token: string | null;
};

const INDEXME = SALE_APPS.find((app) => app.slug === "indexme");
const INDEXME_PRICE = INDEXME?.price ?? "Pro $19.99 · Studio $29.99 one-time";
const INDEXME_PRO_URL = "https://buy.stripe.com/4gMcN52Ese5ldL7cyu2ZO1a";
const INDEXME_STUDIO_URL = "https://buy.stripe.com/aFa00jfre2mD8qN5622ZO1b";
const CONSULT_75_URL = "https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h";

export function withCheckUtm(href: string, content: string): string {
  const url = new URL(href);
  url.searchParams.set("utm_source", "askyard");
  url.searchParams.set("utm_medium", "check");
  url.searchParams.set("utm_campaign", "shop-visibility");
  url.searchParams.set("utm_content", content);
  return url.toString();
}

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "").replace(/^\[|\]$/g, "");
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "metadata.google.internal" || host === "metadata.internal") return true;
  if (host === "::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true;
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;
  const nums = ipv4.slice(1).map((part) => Number(part));
  if (nums.some((n) => n > 255)) return true;
  const [a, b] = nums;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
}

export function isBlockedUrl(url: URL): boolean {
  if (url.protocol !== "http:" && url.protocol !== "https:") return true;
  if (url.username || url.password) return true;
  return isBlockedHostname(url.hostname);
}

function classifyHost(url: URL): "website" | "google" | "facebook" {
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const path = url.pathname.toLowerCase();
  if (host === "facebook.com" || host === "fb.com" || host === "m.facebook.com" || host.endsWith(".facebook.com") || host.endsWith(".fb.com")) {
    return "facebook";
  }
  if (
    host === "g.page" ||
    host === "business.google.com" ||
    host === "maps.google.com" ||
    host === "maps.app.goo.gl" ||
    (host === "google.com" && path.startsWith("/maps")) ||
    (host.endsWith(".google.com") && (host.startsWith("maps.") || path.includes("/maps")))
  ) {
    return "google";
  }
  return "website";
}

function nameFromUrl(url: URL, kind: "website" | "google" | "facebook"): string {
  const host = url.hostname.replace(/^www\./, "");
  const segment = url.pathname.split("/").filter(Boolean)[0];
  if ((kind === "facebook" || kind === "google") && segment && segment.toLowerCase() !== "maps") {
    return cleanText(decodeURIComponent(segment).replace(/[-_]+/g, " "), 80);
  }
  return cleanText(host, 80);
}

function cleanText(value: string, max: number): string {
  return value.replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function parseCheckQuery(raw: string): { ok: true; value: ParsedCheck } | { ok: false; error: string } {
  const query = cleanText(raw, 200);
  if (query.length < 2) return { ok: false, error: "Paste a shop name and city, or a page URL." };
  const asUrl = toPublicUrl(query);
  if (asUrl) {
    if (isBlockedUrl(asUrl)) return { ok: false, error: "That URL is not a public shop page." };
    const sourceKind = classifyHost(asUrl);
    return {
      ok: true,
      value: {
        sourceKind,
        name: nameFromUrl(asUrl, sourceKind),
        city: "",
        url: asUrl.toString(),
      },
    };
  }
  let name = query;
  let city = "";
  const comma = query.split(",");
  const inMatch = query.match(/^(.+?)\s+in\s+(.+)$/i);
  if (comma.length >= 2) {
    name = cleanText(comma[0], 80);
    city = cleanText(comma.slice(1).join(","), 80);
  } else if (inMatch) {
    name = cleanText(inMatch[1], 80);
    city = cleanText(inMatch[2], 80);
  } else {
    name = cleanText(query, 80);
  }
  if (name.length < 2) return { ok: false, error: "Need a shop name." };
  return { ok: true, value: { sourceKind: "name", name, city, url: null } };
}

function toPublicUrl(query: string): URL | null {
  if (/\s/.test(query)) return null;
  const withProtocol = /^https?:\/\//i.test(query) ? query : /^[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(query) ? `https://${query}` : "";
  if (!withProtocol) return null;
  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

export function emptyEvidence(patch: Partial<SiteEvidence> = {}): SiteEvidence {
  return {
    fetched: false,
    blocked: false,
    failed: false,
    unavailable: false,
    phone: null,
    hours: null,
    sitemap: "unknown",
    indexnow: "unknown",
    mentionsWindowsCal: false,
    finalUrl: null,
    ...patch,
  };
}

export function modelPrompt(name: string, city: string, url: string | null): string {
  const where = city ? `${name} in ${city}` : name;
  const site = url ? ` Their site or page is ${url}.` : "";
  return `What do you actually know about ${where}?${site} Cite a public page, phone, and hours if you have them. If you are not sure, say you do not know. Do not invent a different business.`;
}

function gap(id: GapId): CheckGap {
  return { id, text: GAP_TEXT[id], cardLine: GAP_CARD_LINE[id] };
}

function triLabel(value: Tri, fetched: boolean): string {
  if (!fetched) return "Not scraped";
  if (value === "found") return "Found";
  if (value === "missing") return "Not found";
  return "Not scraped";
}

function moneyLinks(showNetyard: boolean): CheckReport["ctas"] {
  const first = new URL("https://firstdeploy.ai/");
  first.searchParams.set("utm_source", "askyard");
  first.searchParams.set("utm_medium", "check");
  first.searchParams.set("utm_campaign", "shop-visibility");
  first.searchParams.set("utm_content", "first-deploy");
  first.hash = "check";
  return {
    indexme: withCheckUtm(INDEXME_PRO_URL, "indexme-pro"),
    indexmeStudio: withCheckUtm(INDEXME_STUDIO_URL, "indexme-studio"),
    indexmePrice: INDEXME_PRICE,
    firstDeploy: first.toString(),
    firstDeployPrice: FD_PRICE_LONG,
    calendly: withCheckUtm(CALENDLY_URL, "free-30"),
    consultPay: withCheckUtm(CONSULT_75_URL, "consult-75"),
    consultRates: CONSULT_RATES,
    netyard: showNetyard ? withCheckUtm("https://netyard.firstdeploy.ai/", "netyard") : null,
    askyard: withCheckUtm(`${BRAND_URL}/`, "ask"),
  };
}

type ReportSeed = {
  sourceKind: CheckSource;
  name: string;
  city: string;
  url: string | null;
};

export function buildReport(seed: ReportSeed, evidence: SiteEvidence | null): CheckReport {
  const name = cleanText(seed.name, 80) || "Shop";
  const city = cleanText(seed.city, 80);
  const url = seed.url && safeHttpUrl(seed.url) ? safeHttpUrl(seed.url) : null;
  const sourceKind = seed.sourceKind;
  const demo = sourceKind === "demo";
  const ev = evidence;
  const fetched = Boolean(ev?.fetched && !ev.failed && !ev.blocked && !ev.unavailable);
  const gaps: CheckGap[] = [];
  if (demo) {
    gaps.push(gap("demo-fictional"), gap("no-website"), gap("demo-blank"));
  } else if (!url && sourceKind === "name") {
    gaps.push(gap("no-website"));
  } else if (ev?.blocked || sourceKind === "google" || sourceKind === "facebook") {
    gaps.push(gap("scrape-blocked"));
  } else if (ev?.unavailable) {
    gaps.push(gap("scrape-unavailable"));
  } else if (ev?.failed || (url && !fetched)) {
    gaps.push(gap("scrape-failed"));
  } else if (fetched && ev) {
    if (ev.sitemap !== "found") gaps.push(gap("no-sitemap"));
    if (ev.indexnow !== "found") gaps.push(gap("no-indexnow"));
    if (!ev.phone) gaps.push(gap("missing-phone"));
    if (!ev.hours) gaps.push(gap("missing-hours"));
    if (ev.mentionsWindowsCal) gaps.push(gap("windows-cal"));
  }

  const evidenceLabel: EvidenceLabel = demo ? "Demo shop" : fetched ? "Live scrape" : "Not a live scrape";
  const prompt = modelPrompt(name, city, url);
  const links = new Map(askAiLinks(prompt).map((link) => [link.name, link.href]));
  const models: CheckModel[] = MODEL_ORDER.map((modelName) => ({
    name: modelName,
    href: links.get(modelName) ?? "https://askyard.firstdeploy.ai/check",
    label: MODEL_LABEL,
  }));
  const phone = fetched ? ev?.phone ?? null : null;
  const hours = fetched ? ev?.hours ?? null : null;
  const sitemap: Tri = fetched && ev ? ev.sitemap : "unknown";
  const indexnow: Tri = fetched && ev ? ev.indexnow : "unknown";
  const facts: CheckFact[] = demo
    ? [
        { label: "Phone", value: "Blank on purpose" },
        { label: "Hours", value: "Blank on purpose" },
        { label: "Sitemap", value: "No public site" },
        { label: "IndexNow", value: "No public site" },
      ]
    : [
        { label: "Phone", value: fetched ? phone || "Not on the page" : "Not scraped" },
        { label: "Hours", value: fetched ? hours || "Not on the page" : "Not scraped" },
        { label: "Sitemap", value: triLabel(sitemap, fetched) },
        { label: "IndexNow", value: triLabel(indexnow, fetched) },
      ];
  const showNetyard = gaps.some((item) => item.id === "windows-cal");
  const payload = {
    n: name,
    c: city,
    u: url ?? "",
    k: sourceKind,
    p: phone ?? "",
    h: hours ?? "",
    s: sitemap,
    i: indexnow,
    f: ev?.failed ? 1 : 0,
    b: ev?.blocked || sourceKind === "google" || sourceKind === "facebook" ? 1 : 0,
    a: ev?.unavailable ? 1 : 0,
    w: ev?.mentionsWindowsCal ? 1 : 0,
    t: fetched ? 1 : 0,
  };
  const token = demo ? null : toBase64Url(JSON.stringify(payload));
  return {
    demo,
    sourceKind,
    name,
    city,
    url,
    phone,
    hours,
    sitemap,
    indexnow,
    evidenceLabel,
    prompt,
    models,
    gaps,
    facts,
    note: MODEL_NOTE,
    ctas: moneyLinks(showNetyard),
    sharePath: demo ? "/check/harbor-hvac" : `/s/${token}`,
    imagePath: demo ? "/check/harbor-hvac.png" : `/api/check-card?token=${encodeURIComponent(token ?? "")}`,
    token,
  };
}

export function demoReport(): CheckReport {
  return buildReport({ sourceKind: "demo", name: "Harbor HVAC", city: "Palm Coast, FL", url: null }, null);
}

export function fallbackCheck(raw: string): CheckReport | { error: string } {
  const parsed = parseCheckQuery(raw);
  if (!parsed.ok) return { error: parsed.error };
  if (parsed.value.sourceKind === "google" || parsed.value.sourceKind === "facebook") {
    return buildReport(parsed.value, emptyEvidence({ blocked: true }));
  }
  if (parsed.value.sourceKind === "website") {
    return buildReport(parsed.value, emptyEvidence({ unavailable: true }));
  }
  return buildReport(parsed.value, null);
}

type SharePayload = {
  n: string;
  c: string;
  u: string;
  k: CheckSource;
  p: string;
  h: string;
  s: Tri;
  i: Tri;
  f: 0 | 1;
  b: 0 | 1;
  a: 0 | 1;
  w: 0 | 1;
  t: 0 | 1;
};

export function encodeShareToken(report: CheckReport): string | null {
  return report.token;
}

export function decodeShareToken(token: string): CheckReport | null {
  if (!/^[A-Za-z0-9_-]{8,1800}$/.test(token)) return null;
  let parsed: SharePayload;
  try {
    parsed = JSON.parse(fromBase64Url(token)) as SharePayload;
  } catch {
    return null;
  }
  if (!parsed || typeof parsed.n !== "string" || typeof parsed.k !== "string") return null;
  if (!["website", "name", "google", "facebook", "demo"].includes(parsed.k)) return null;
  if (parsed.k === "demo") return demoReport();
  const tri = (value: unknown): Tri => (value === "found" || value === "missing" || value === "unknown" ? value : "unknown");
  const bit = (value: unknown): 0 | 1 => (value === 1 ? 1 : 0);
  const evidence = emptyEvidence({
    fetched: bit(parsed.t) === 1,
    failed: bit(parsed.f) === 1,
    blocked: bit(parsed.b) === 1,
    unavailable: bit(parsed.a) === 1,
    phone: typeof parsed.p === "string" && parsed.p ? cleanText(parsed.p, 40) : null,
    hours: typeof parsed.h === "string" && parsed.h ? cleanText(parsed.h, 80) : null,
    sitemap: tri(parsed.s),
    indexnow: tri(parsed.i),
    mentionsWindowsCal: bit(parsed.w) === 1,
    finalUrl: typeof parsed.u === "string" ? parsed.u : null,
  });
  const report = buildReport(
    {
      sourceKind: parsed.k,
      name: parsed.n,
      city: typeof parsed.c === "string" ? parsed.c : "",
      url: typeof parsed.u === "string" && parsed.u ? parsed.u : null,
    },
    parsed.k === "name" && bit(parsed.t) === 0 && bit(parsed.f) === 0 && bit(parsed.b) === 0 && bit(parsed.a) === 0 ? null : evidence,
  );
  if (report.token !== token) return null;
  return report;
}

export function evidenceFromDocuments(docs: {
  html: string;
  robots: string;
  sitemapStatus: number;
  sitemapBody: string;
  finalUrl: string;
}): SiteEvidence {
  const html = docs.html.slice(0, 180_000);
  const robots = docs.robots.slice(0, 80_000);
  const phone = extractPhone(html);
  const hours = extractHours(html);
  const sitemapInHtml = /<link[^>]+rel=["'][^"']*sitemap[^"']*["'][^>]*>/i.test(html);
  const sitemapBodyOk = docs.sitemapStatus >= 200 && docs.sitemapStatus < 300 && /<urlset|<sitemapindex/i.test(docs.sitemapBody);
  const sitemap: Tri = sitemapBodyOk || sitemapInHtml ? "found" : "missing";
  const indexnow: Tri = /indexnow/i.test(html) || /indexnow/i.test(robots) ? "found" : "missing";
  const text = stripTags(html);
  return {
    fetched: true,
    blocked: false,
    failed: false,
    unavailable: false,
    phone,
    hours,
    sitemap,
    indexnow,
    mentionsWindowsCal: /windows server|client access licen[sc]e|\bCALs?\b/i.test(text),
    finalUrl: docs.finalUrl,
  };
}

export function placeLine(report: CheckReport): string {
  if (report.city) return report.city;
  if (report.url) {
    try {
      return new URL(report.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }
  return "";
}

export function shareDocument(report: CheckReport): string {
  const canonical = `${BRAND_URL}${report.sharePath}`;
  const image = report.imagePath.startsWith("http") ? report.imagePath : `${BRAND_URL}${report.imagePath}`;
  const title = `${report.name} — what AI knows | ${BRAND_NAME}`;
  const gapWord = report.gaps.length === 1 ? "gap" : "gaps";
  const description = `${report.evidenceLabel}. ${report.gaps.length} ${gapWord}. ${MODEL_NOTE}`;
  const facts = report.facts
    .map((fact) => `<li><span>${escapeHtml(fact.label)}</span> ${escapeHtml(fact.value)}</li>`)
    .join("");
  const gaps = report.gaps.map((item) => `<li>${escapeHtml(item.text)}</li>`).join("");
  const models = report.models
    .map(
      (model) =>
        `<li><a href="${escapeHtml(safeHref(model.href))}">${escapeHtml(model.name)}</a> <small>${escapeHtml(model.label)}</small></li>`,
    )
    .join("");
  const netyard = report.ctas.netyard
    ? `<p><a href="${escapeHtml(report.ctas.netyard)}">NetYard</a> if the pain is Windows Server or CAL quotes.</p>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="noindex, follow" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${BRAND_NAME}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <style>
    body { margin: 0; background: #1c1915; color: #1c1915; font-family: Georgia, "Times New Roman", serif; }
    main { max-width: 720px; margin: 32px auto; background: #f6edd8; padding: 32px 28px; }
    h1 { font-weight: 500; font-size: 2.4rem; margin: 0.2rem 0 0.4rem; }
    p, li { font-family: system-ui, sans-serif; line-height: 1.45; }
    .steel { color: #5c564c; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.78rem; }
    a { color: #1c1915; }
    .primary { display: inline-block; margin-top: 0.6rem; background: #1c1915; color: #f6edd8; text-decoration: none; padding: 0.75rem 1.1rem; border-radius: 999px; }
    .soft { display: inline-block; margin-top: 0.6rem; border: 1px solid #8a8172; color: #1c1915; text-decoration: none; padding: 0.7rem 1rem; border-radius: 999px; }
    ul { padding-left: 1.1rem; }
    small { color: #5c564c; }
  </style>
</head>
<body>
  <main>
    <p class="steel">${escapeHtml(report.evidenceLabel)} · ${BRAND_NAME} check</p>
    <h1>${escapeHtml(report.name)}</h1>
    <p>${escapeHtml(placeLine(report) || "No city given")}</p>
    <p class="steel">${report.gaps.length} ${gapWord} on the public record</p>
    <ul>${facts}</ul>
    <ul>${gaps}</ul>
    <p>${escapeHtml(report.note)}</p>
    <p class="steel">Models</p>
    <ul>${models}</ul>
    <p><a class="primary" href="${escapeHtml(report.ctas.indexme)}">Pay $19.99 — IndexMe Pro</a></p>
    <p><a href="${escapeHtml(report.ctas.indexmeStudio)}">Studio $29.99</a>. ${escapeHtml(report.ctas.indexmePrice)}. One time.</p>
    <p><a class="soft" href="${escapeHtml(report.ctas.firstDeploy)}">${BRAND_PARENT} — 2-minute check</a></p>
    <p>${escapeHtml(report.ctas.firstDeployPrice)}. ${escapeHtml(FD_PROMISE)}. Free 30, then ${escapeHtml(report.ctas.consultRates)}. <a href="${escapeHtml(report.ctas.calendly)}">Book the free 30</a>. <a href="${escapeHtml(report.ctas.consultPay)}">Pay $75 now</a>.</p>
    ${netyard}
    <p><a href="${escapeHtml(report.ctas.askyard)}">Ask a shop-floor question on ${BRAND_NAME}</a></p>
    <p class="steel">${BRAND_NAME} · ${BRAND_COMPANY} · ${BRAND_PLACE} · <a href="${COMPANY_URL}">agenthiveinc.com</a></p>
  </main>
</body>
</html>`;
}

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (isBlockedUrl(url)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function safeHref(href: string): string {
  return safeHttpUrl(href) ?? `${BRAND_URL}/check`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(token: string): string {
  const pad = token.length % 4 === 0 ? "" : "=".repeat(4 - (token.length % 4));
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function extractPhone(html: string): string | null {
  const fromLd = firstLdString(html, ["telephone", "phone"]);
  if (fromLd && lookLikePhone(fromLd)) return clipPhone(fromLd);
  const tel = html.match(/href=["']tel:([^"'<>]+)["']/i)?.[1];
  if (tel && lookLikePhone(decodeURIComponent(tel))) return clipPhone(decodeURIComponent(tel));
  const match = stripTags(html).match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]\d{4}/);
  return match ? clipPhone(match[0]) : null;
}

function extractHours(html: string): string | null {
  const fromLd = firstLdString(html, ["openingHours"]);
  if (fromLd) return cleanText(fromLd, 80);
  const spec = firstHoursSpec(html);
  if (spec) return spec;
  const itemprop = html.match(/itemprop=["']openingHours["'][^>]*content=["']([^"']+)["']/i)?.[1];
  if (itemprop) return cleanText(itemprop, 80);
  const text = stripTags(html);
  const line = text.match(/\b(?:hours|mon(?:day)?|tue(?:s|sday)?)\b[^.]{0,60}\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i);
  return line ? cleanText(line[0], 80) : null;
}

function lookLikePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function clipPhone(value: string): string {
  return cleanText(value, 40);
}

function firstLdString(html: string, keys: string[]): string | null {
  let found: string | null = null;
  for (const node of jsonLdNodes(html)) {
    walkLd(node, (obj) => {
      if (found) return;
      for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string" && value.trim()) found = value.trim();
        if (Array.isArray(value) && typeof value[0] === "string") found = value[0];
      }
    });
  }
  return found;
}

function firstHoursSpec(html: string): string | null {
  let found: string | null = null;
  for (const node of jsonLdNodes(html)) {
    walkLd(node, (obj) => {
      if (found) return;
      const spec = obj.openingHoursSpecification;
      const row = Array.isArray(spec) ? spec[0] : spec;
      if (!row || typeof row !== "object") return;
      const record = row as Record<string, unknown>;
      const opens = typeof record.opens === "string" ? record.opens : "";
      const closes = typeof record.closes === "string" ? record.closes : "";
      if (opens || closes) found = cleanText(`${opens}${closes ? `–${closes}` : ""}`, 80);
    });
  }
  return found;
}

function jsonLdNodes(html: string): unknown[] {
  const nodes: unknown[] = [];
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      nodes.push(JSON.parse(match[1]));
    } catch {
      // ignore broken blocks
    }
  }
  return nodes;
}

function walkLd(node: unknown, visit: (obj: Record<string, unknown>) => void) {
  if (Array.isArray(node)) {
    for (const item of node) walkLd(item, visit);
    return;
  }
  if (!node || typeof node !== "object") return;
  const record = node as Record<string, unknown>;
  visit(record);
  if ("@graph" in record) walkLd(record["@graph"], visit);
}

export const CHECK_ATTRIBUTION = `${BRAND_NAME} · ${BRAND_COMPANY} · ${BRAND_PLACE}`;
