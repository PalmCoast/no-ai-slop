// analytics-filter.ts: Netlify Edge Function (Deno). DRAFT, not deployed.
//
// This is a drop-in superset of Atlas's netlify/edge-functions/bot-filter.ts
// (drafted 2026-11-27, same file on AH and FD). Use ONE of them per site, not both:
// two edge functions on "/*" that both rewrite HTML would double the work.
// Everything bot-filter.ts does is kept with the same behavior; the additions are
// listed in edge/DIFF-vs-atlas-bot-filter.md.
//
// What it does:
// 1) Scanner probe paths (wp-admin, .env, .git, *.php ...)    -> 410 (unchanged from Atlas)
// 2) Known scanner user agents on ANY path, attack-looking queries -> 403 (new)
// 3) Our own traffic (env IPs/UAs, opt-out cookie), headless/scripted clients,
//    and self-declared crawlers -> page served normally, but analytics is switched off:
//      - window.__PH_SKIP=1 injected into HTML (ph.js already checks it)
//      - response header  x-ah-traffic: <class>
//      - cookie           ah_noanalytics=1  (ONLY set by a valid ?ah_internal=<token>, so it sticks
//                         across IP changes; read by ph.js). IP/UA matches never set it.
// 4) Everyone else passes straight through untouched. Any error bypasses the function.

type Context = { ip?: string; next: () => Promise<Response> };
declare const Netlify: { env: { get(name: string): string | undefined } } | undefined;

const env = (k: string): string => {
  try {
    return (typeof Netlify !== "undefined" && Netlify?.env.get(k)) || "";
  } catch {
    return "";
  }
};

// --- 1) scanner paths: same regex as Atlas's bot-filter.ts ---
const SCAN_PATH =
  /(^|\/)(wp-admin|wp-login\.php|wp-content|wp-includes|wp-json|xmlrpc\.php|\.env(\.[a-z0-9._-]*)?$|\.git(\/|$)|\.svn(\/|$)|\.aws(\/|$)|\.ssh(\/|$)|\.DS_Store$|phpmyadmin|pma(\/|$)|vendor\/phpunit|cgi-bin(\/|$)|server-status$|config\.json$|\.htaccess$|\.htpasswd$)|\.(php\d?|asp|aspx|jsp|cgi)$/i;

// --- 2) scanners by user agent (blocked on every path) ---
const SCANNER_UA =
  /sqlmap|nikto|nuclei|zgrab|masscan|wpscan|nmap|acunetix|nessus|openvas|qualys|netsparker|invicti|burp|dirbuster|gobuster|ffuf|feroxbuster|wfuzz|whatweb|jaeles|httprobe|l9explore|l9tcpid|censysinspect|expanse|internetmeasurement|shodan|zmap|leakix|fuzz faster/i;
// Common exploit payloads in the query string. `cmd` only as a whole parameter name (?recmd=1 passes).
const ATTACK_QS = /(\.\.\/|%2e%2e%2f|union(\s|%20|\+)+select|<script|%3cscript|\$\{jndi:|%24%7bjndi|\/etc\/passwd|base64_decode\(|(?:^|[?&])cmd=|eval\()/i;

// --- 3) traffic we never count ---
const HEADLESS_UA =
  /HeadlessChrome|PhantomJS|Puppeteer|Playwright|Selenium|webdriver|Electron\/|curl\/|Wget|python-requests|python-urllib|python-httpx|aiohttp|httpx|Go-http-client|okhttp|libwww-perl|Java\/|Apache-HttpClient|scrapy|node-fetch|axios\/|undici|got \(|PostmanRuntime|insomnia|Deno\/|Bun\//i;
// Self-declared crawlers and link-preview bots. Not blocked (SEO and X/Slack
// previews need them), only kept out of analytics. Googlebot renders JS, so
// without this it could fire PostHog pageviews.
const CRAWLER_UA =
  /bot\b|bot\/|crawl|spider|slurp|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|skype|preview|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|validator|feedfetcher|archiver|semrush|ahrefs|mj12|petalbot|bytespider|gptbot|claudebot|perplexity|chatgpt|oai-searchbot|google-extended|bingpreview|applebot/i;
// Our own QA agents (same as Atlas) + anything in INTERNAL_UAS.
const BUILTIN_INTERNAL_UA = /shipcheck|clicktest|fd-clicktest|ah-clicktest/i;
// Box egress ranges (Cloudflare WARP, shared with real WARP users): skip tracking for that request
// only, never set the cookie. Same coverage as the old "104.28." / "2a09:bac" prefixes.
const BUILTIN_INTERNAL_IP = ["104.28.0.0/16", "2a09:bac0::/28"];

const COOKIE = "ah_noanalytics";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function list(k: string): string[] {
  return env(k).split(",").map((s) => s.trim()).filter(Boolean);
}

function ipv4ToInt(ip: string): number | null {
  const p = ip.split(".");
  if (p.length !== 4) return null;
  let n = 0;
  for (const x of p) {
    if (!/^\d{1,3}$/.test(x)) return null;
    const v = Number(x);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

// Full 128-bit value of an IPv6 address ("::" and an embedded IPv4 tail allowed), or null.
function ipv6ToBig(ip: string): bigint | null {
  let a = ip.toLowerCase().split("%")[0];
  if (!a.includes(":")) return null;
  const v4 = a.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) {
    const n = ipv4ToInt(v4[2]);
    if (n === null) return null;
    a = v4[1] + ((n >>> 16) & 0xffff).toString(16) + ":" + (n & 0xffff).toString(16);
  }
  const halves = a.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0;
  if (fill < 0 || (halves.length === 1 && head.length !== 8)) return null;
  const groups = [...head, ...Array(fill).fill("0"), ...tail];
  if (groups.length !== 8) return null;
  let n = 0n;
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    n = (n << 16n) | BigInt(parseInt(g, 16));
  }
  return n;
}

// Entries: exact IP ("73.1.2.3", "2600:1700::5") or CIDR ("73.12.0.0/16", "2600:1700:abcd::/48").
// No prefix matching: "73.1.2.3" does not match 73.1.2.30. IPv4-mapped IPv6 (::ffff:a.b.c.d) is read as IPv4.
export function ipMatches(ip: string, entry: string): boolean {
  if (!ip || !entry) return false;
  let a = ip.trim().toLowerCase();
  const mapped = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) a = mapped[1];
  const [base, bitsRaw, extra] = entry.trim().toLowerCase().split("/");
  if (extra !== undefined) return false;
  const a4 = ipv4ToInt(a);
  const b4 = ipv4ToInt(base);
  if (a4 !== null && b4 !== null) {
    const bits = bitsRaw === undefined ? 32 : Number(bitsRaw);
    if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return ((a4 & mask) >>> 0) === ((b4 & mask) >>> 0);
  }
  const a6 = ipv6ToBig(a);
  const b6 = ipv6ToBig(base);
  if (a6 === null || b6 === null) return false;
  const bits = bitsRaw === undefined ? 128 : Number(bitsRaw);
  if (!Number.isInteger(bits) || bits < 0 || bits > 128) return false;
  const shift = BigInt(128 - bits);
  return a6 >> shift === b6 >> shift;
}

function hasCookie(req: Request, name: string): boolean {
  const c = req.headers.get("cookie") || "";
  return new RegExp("(?:^|;\\s*)" + name + "=1(?:;|$)").test(c);
}

export type TrafficClass = "human" | "internal" | "headless" | "crawler" | "scanner";

export function classify(req: Request, ip: string): { cls: TrafficClass; setCookie: boolean } {
  const ua = req.headers.get("user-agent") || "";
  const url = new URL(req.url);
  if (SCANNER_UA.test(ua) || ATTACK_QS.test(url.search)) return { cls: "scanner", setCookie: false };

  // Opt-out link for our own browsers: visit any page once with ?ah_internal=<token>.
  const token = env("ANALYTICS_OPTOUT_TOKEN");
  const optIn = !!token && url.searchParams.get("ah_internal") === token;
  const ipHit = [...BUILTIN_INTERNAL_IP, ...list("INTERNAL_IPS")].some((e) => ipMatches(ip, e));
  const extraUa = list("INTERNAL_UAS").some((s) => ua.toLowerCase().includes(s.toLowerCase()));
  if (optIn || ipHit || extraUa || BUILTIN_INTERNAL_UA.test(ua)) {
    // Only a valid ?ah_internal=<token> sets the opt-out cookie. IP/UA hits skip tracking for this request only.
    return { cls: "internal", setCookie: optIn };
  }
  if (hasCookie(req, COOKIE)) return { cls: "internal", setCookie: false };
  if (!ua || HEADLESS_UA.test(ua)) return { cls: "headless", setCookie: false };
  if (CRAWLER_UA.test(ua)) return { cls: "crawler", setCookie: false };
  return { cls: "human", setCookie: false };
}

const plain = (status: number, body: string, tag: string) =>
  new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": status === 410 ? "public, max-age=86400" : "no-store",
      "x-robots-tag": "noindex",
      "x-edge-filter": tag,
    },
  });

export default async (req: Request, ctx: Context) => {
  const url = new URL(req.url);
  if (SCAN_PATH.test(url.pathname)) return plain(410, "Gone\n", "scanner");

  const { cls, setCookie } = classify(req, ctx.ip || "");
  if (cls === "scanner") return plain(403, "Forbidden\n", "scanner-ua");
  if (cls === "human") return; // untouched
  if (req.method !== "GET") return; // same as Atlas: HEAD/POST pass through untouched (cheaper)

  const res = await ctx.next();
  const headers = new Headers(res.headers);
  headers.set("x-ah-traffic", cls);
  headers.set("x-edge-filter", "no-analytics");
  if (setCookie) headers.append("set-cookie", `${COOKIE}=1; Path=/; Max-Age=${COOKIE_MAX_AGE}; Secure; SameSite=Lax`);

  const isHtml = (res.headers.get("content-type") || "").includes("text/html");
  if (!isHtml) {
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
  const html = await res.text();
  const out = html.replace(/<head(\s[^>]*)?>/i, (m: string) => m + "<script>window.__PH_SKIP=1</script>");
  headers.delete("content-length");
  return new Response(out, { status: res.status, statusText: res.statusText, headers });
};

export const config = {
  path: "/*",
  // Same exclusions as Atlas's file, so static assets never pay for an edge call.
  excludedPath: ["/assets/*", "/.netlify/*", "/fd-brand/*", "/*.css", "/*.js", "/*.mjs", "/*.map", "/*.json", "/*.xml", "/*.txt", "/*.ico", "/*.svg", "/*.png", "/*.jpg", "/*.jpeg", "/*.webp", "/*.gif", "/*.avif", "/*.woff", "/*.woff2", "/*.mp4", "/*.pdf"],
  onError: "bypass",
};
