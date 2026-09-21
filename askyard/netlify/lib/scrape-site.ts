import { lookup } from "node:dns/promises";
import { emptyEvidence, evidenceFromDocuments, isBlockedHostname, isBlockedUrl, type SiteEvidence } from "../../shared/check.ts";

const MAX_BYTES = 180_000;
const TIMEOUT_MS = 7000;

export type ScrapeDeps = {
  fetchImpl?: typeof fetch;
  lookupHost?: (hostname: string) => Promise<string[]>;
};

export async function scrapePublicSite(pageUrl: string, deps: ScrapeDeps = {}): Promise<SiteEvidence> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const lookupHost = deps.lookupHost ?? defaultLookup;
  let start: URL;
  try {
    start = new URL(pageUrl);
  } catch {
    return emptyEvidence({ failed: true });
  }
  if (await hostBlocked(start, lookupHost)) return emptyEvidence({ blocked: true });
  try {
    const home = await fetchText(start, fetchImpl, lookupHost, 0);
    if (!home) return emptyEvidence({ failed: true });
    if (!home.ok) return emptyEvidence({ failed: true, finalUrl: home.finalUrl });
    const origin = new URL(home.finalUrl).origin;
    const robotsUrl = new URL("/robots.txt", origin);
    const robots = (await fetchText(robotsUrl, fetchImpl, lookupHost, 0))?.text ?? "";
    const sitemapFromRobots = robots.match(/^Sitemap:\s*(\S+)/im)?.[1];
    let sitemapUrl: URL;
    try {
      sitemapUrl = sitemapFromRobots ? new URL(sitemapFromRobots, origin) : new URL("/sitemap.xml", origin);
    } catch {
      sitemapUrl = new URL("/sitemap.xml", origin);
    }
    const sitemap = (await fetchText(sitemapUrl, fetchImpl, lookupHost, 0)) ?? { ok: false, status: 0, text: "", finalUrl: sitemapUrl.toString() };
    return evidenceFromDocuments({
      html: home.text,
      robots,
      sitemapStatus: sitemap.ok ? sitemap.status : 0,
      sitemapBody: sitemap.text,
      finalUrl: home.finalUrl,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "blocked") return emptyEvidence({ blocked: true });
    return emptyEvidence({ failed: true });
  }
}

async function defaultLookup(hostname: string): Promise<string[]> {
  if (isBlockedHostname(hostname)) return [hostname];
  const records = await lookup(hostname, { all: true, verbatim: true });
  return records.map((record) => record.address);
}

async function hostBlocked(url: URL, lookupHost: (hostname: string) => Promise<string[]>): Promise<boolean> {
  if (isBlockedUrl(url)) return true;
  if (isBlockedHostname(url.hostname)) return true;
  try {
    const addresses = await lookupHost(url.hostname);
    if (!addresses.length) return true;
    return addresses.some((address) => isBlockedHostname(address));
  } catch {
    return true;
  }
}

async function fetchText(
  url: URL,
  fetchImpl: typeof fetch,
  lookupHost: (hostname: string) => Promise<string[]>,
  hops: number,
): Promise<{ ok: boolean; status: number; text: string; finalUrl: string } | null> {
  if (hops > 3) return null;
  if (await hostBlocked(url, lookupHost)) throw new Error("blocked");
  const res = await fetchImpl(url, {
    redirect: "manual",
    cache: "no-store",
    headers: {
      accept: "text/html,application/xml,text/plain;q=0.9,*/*;q=0.1",
      "user-agent": "AskYardCheck/1.0 (+https://askyard.firstdeploy.ai/check)",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location");
    if (!location) return { ok: false, status: res.status, text: "", finalUrl: url.toString() };
    return fetchText(new URL(location, url), fetchImpl, lookupHost, hops + 1);
  }
  const text = await readCapped(res, MAX_BYTES);
  return { ok: res.ok, status: res.status, text, finalUrl: url.toString() };
}

async function readCapped(res: Response, max: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < max) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    total += value.length;
    if (total >= max) {
      await reader.cancel();
      break;
    }
  }
  const buf = new Uint8Array(Math.min(total, max));
  let offset = 0;
  for (const chunk of chunks) {
    const take = Math.min(chunk.length, buf.length - offset);
    if (take <= 0) break;
    buf.set(chunk.subarray(0, take), offset);
    offset += take;
  }
  return new TextDecoder().decode(buf);
}
