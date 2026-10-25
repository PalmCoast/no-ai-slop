import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import {
  findIndexMeLinks,
  judgeLinks,
  normalizeUrl,
  type CheckResult,
  type CheckStatus,
  type FoundLink,
  type LinkJudgement,
} from "./check-link.ts";

export type { CheckResult, CheckStatus };

export type CheckDeps = {
  fetch: typeof fetch;
  lookup: (hostname: string) => Promise<string[]>;
};

const MAX_BYTES = 600_000;
const MAX_HOPS = 4;
const UA = "IndexMeLinkFest/1.0 (+https://indexme.lol/)";

const blocked = new BlockList();
blocked.addSubnet("0.0.0.0", 8, "ipv4");
blocked.addSubnet("10.0.0.0", 8, "ipv4");
blocked.addSubnet("100.64.0.0", 10, "ipv4");
blocked.addSubnet("127.0.0.0", 8, "ipv4");
blocked.addSubnet("169.254.0.0", 16, "ipv4");
blocked.addSubnet("172.16.0.0", 12, "ipv4");
blocked.addSubnet("192.0.0.0", 24, "ipv4");
blocked.addSubnet("192.0.2.0", 24, "ipv4");
blocked.addSubnet("192.168.0.0", 16, "ipv4");
blocked.addSubnet("198.18.0.0", 15, "ipv4");
blocked.addSubnet("198.51.100.0", 24, "ipv4");
blocked.addSubnet("203.0.113.0", 24, "ipv4");
blocked.addSubnet("224.0.0.0", 4, "ipv4");
blocked.addSubnet("240.0.0.0", 4, "ipv4");
blocked.addAddress("::1", "ipv6");
blocked.addSubnet("fc00::", 7, "ipv6");
blocked.addSubnet("fe80::", 10, "ipv6");
blocked.addSubnet("ff00::", 8, "ipv6");

export function isBlockedIp(ip: string): boolean {
  const family = isIP(ip);
  if (family === 0) return true;
  const mapped = ip.toLowerCase();
  if (mapped.startsWith("::ffff:")) {
    const v4 = mapped.slice(7);
    if (isIP(v4) === 4) return isBlockedIp(v4);
  }
  return blocked.check(ip, family === 6 ? "ipv6" : "ipv4");
}

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host || host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".home.arpa")) return true;
  if (host === "metadata.google.internal" || host === "metadata.google.com") return true;
  return false;
}

export function publicUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(normalizeUrl(raw));
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (url.port && url.port !== "80" && url.port !== "443") return null;
  if (!url.hostname || isBlockedHostname(url.hostname)) return null;
  if (isIP(url.hostname) && isBlockedIp(url.hostname)) return null;
  return url;
}

export async function defaultLookup(hostname: string): Promise<string[]> {
  const rows = await lookup(hostname, { all: true, verbatim: true });
  return rows.map((row) => row.address);
}

async function assertPublicHost(hostname: string, resolve: CheckDeps["lookup"]): Promise<void> {
  if (isBlockedHostname(hostname) || (isIP(hostname) && isBlockedIp(hostname))) {
    throw new Error("blocked");
  }
  if (isIP(hostname)) return;
  let ips: string[];
  try {
    ips = await resolve(hostname);
  } catch {
    throw new Error("dns");
  }
  if (ips.length === 0 || ips.some((ip) => isBlockedIp(ip))) throw new Error("blocked");
}

function result(
  status: CheckStatus,
  url: string,
  httpStatus: number | null,
  links: FoundLink[],
  note: string,
): CheckResult {
  return { status, url, httpStatus, links, note };
}

function noteFor(status: LinkJudgement, links: FoundLink[]): string {
  const sample = links.find((link) => link.named) ?? links[0];
  if (status === "linked") {
    return `Follow link found. The anchor text is "${sample?.text ?? "IndexMe"}".`;
  }
  if (status === "unnamed") {
    return "The page links to indexme.lol. The anchor text does not say IndexMe, so the check does not pass.";
  }
  if (status === "nofollow") {
    return "The link is on the page and marked nofollow. A person can click it. Ranking credit stays on your page.";
  }
  return "The page loaded. It has no link to indexme.lol.";
}

export async function checkPublicPage(raw: string, deps: CheckDeps): Promise<CheckResult> {
  const start = publicUrl(raw);
  if (!start) {
    return result("blocked", raw.trim().slice(0, 300), null, [], "That address is not a public website.");
  }

  let current = start;
  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    try {
      await assertPublicHost(current.hostname, deps.lookup);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "";
      if (reason === "dns") {
        return result("unreachable", current.href, null, [], "The hostname did not resolve.");
      }
      return result("blocked", current.href, null, [], "That address is not a public website.");
    }

    let response: Response;
    try {
      response = await deps.fetch(current.href, {
        redirect: "manual",
        headers: {
          "user-agent": UA,
          accept: "text/html,application/xhtml+xml;q=0.9,text/plain;q=0.5",
        },
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      return result("unreachable", current.href, null, [], "The page did not answer.");
    }

    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      const location = response.headers.get("location");
      if (!location) {
        return result("unreachable", current.href, response.status, [], "The redirect had no destination.");
      }
      let next: URL;
      try {
        next = new URL(location, current);
      } catch {
        return result("blocked", current.href, response.status, [], "That address is not a public website.");
      }
      if (!publicUrl(next.href)) {
        return result("blocked", current.href, response.status, [], "That address is not a public website.");
      }
      current = next;
      continue;
    }

    if (response.status < 200 || response.status >= 300) {
      await response.body?.cancel();
      return result(
        "unreachable",
        current.href,
        response.status,
        [],
        `The page answered HTTP ${response.status}.`,
      );
    }

    const type = (response.headers.get("content-type") ?? "").toLowerCase();
    const htmlType = type.includes("text/html") || type.includes("xml") || type.includes("text/plain") || type === "";
    if (!htmlType) {
      await response.body?.cancel();
      return result("unreachable", current.href, response.status, [], "The response was not an HTML page.");
    }

    const html = await readCapped(response);
    const links = findIndexMeLinks(html).slice(0, 8);
    const status = judgeLinks(links);
    return result(status, current.href, response.status, links, noteFor(status, links));
  }

  return result("unreachable", current.href, null, [], "The page redirected too many times.");
}

async function readCapped(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const step = await reader.read();
    if (step.done) break;
    const value = step.value;
    if (!value) continue;
    total += value.byteLength;
    chunks.push(value);
  }
  await reader.cancel();
  const bytes = new Uint8Array(Math.min(total, MAX_BYTES));
  let offset = 0;
  for (const chunk of chunks) {
    const take = Math.min(chunk.byteLength, bytes.length - offset);
    if (take <= 0) break;
    bytes.set(chunk.subarray(0, take), offset);
    offset += take;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}
