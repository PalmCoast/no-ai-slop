export type FoundLink = {
  href: string;
  text: string;
  nofollow: boolean;
  named: boolean;
};

export type LinkJudgement = "linked" | "unnamed" | "nofollow" | "missing";

export type CheckStatus = LinkJudgement | "unreachable" | "blocked" | "limited";

export type CheckResult = {
  status: CheckStatus;
  url: string;
  httpStatus: number | null;
  links: FoundLink[];
  note: string;
};

const NAMED = /indexme/i;

function attr(source: string, name: string): string {
  const match = source.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`, "i"),
  );
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'");
}

function visibleText(inner: string, openTag: string): string {
  const alts = [...inner.matchAll(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map(
    (match) => match[1] ?? match[2] ?? "",
  );
  const stripped = inner.replace(/<[^>]+>/g, " ");
  const combined = [stripped, ...alts, attr(openTag, "aria-label"), attr(openTag, "title")].join(" ");
  return decodeEntities(combined).replace(/\s+/g, " ").trim();
}

/** Absolute http(s) link whose host is indexme.lol. Relative links do not count. */
export function indexMeHref(raw: string): string | null {
  const href = raw.trim();
  if (!href || href.startsWith("#")) return null;
  if (/^(javascript|data|mailto|tel):/i.test(href)) return null;
  let url: URL;
  try {
    url = new URL(href, "https://example.invalid");
  } catch {
    return null;
  }
  if (url.hostname === "example.invalid") return null;
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (host !== "indexme.lol" && host !== "www.indexme.lol") return null;
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  return url.href;
}

export function findIndexMeLinks(html: string): FoundLink[] {
  const cleaned = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  const found: FoundLink[] = [];
  const anchors = cleaned.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi);
  for (const match of anchors) {
    const open = match[1] ?? "";
    const href = indexMeHref(attr(open, "href"));
    if (!href) continue;
    const text = visibleText(match[2] ?? "", open).slice(0, 180);
    const rel = attr(open, "rel").toLowerCase().split(/\s+/);
    found.push({
      href,
      text,
      nofollow: rel.includes("nofollow"),
      named: NAMED.test(text),
    });
  }
  return found;
}

export function judgeLinks(links: FoundLink[]): LinkJudgement {
  if (links.some((link) => link.named && !link.nofollow)) return "linked";
  if (links.some((link) => !link.nofollow)) return "unnamed";
  if (links.length > 0) return "nofollow";
  return "missing";
}

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}
