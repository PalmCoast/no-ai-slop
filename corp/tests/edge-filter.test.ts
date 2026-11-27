import { afterEach, describe, expect, it } from "vitest";

// analytics-filter.ts (Netlify Edge). Reads env via the Netlify global; unset = built-in rules only.
type Env = Record<string, string>;
const setEnv = (env: Env) => {
  (globalThis as unknown as { Netlify?: unknown }).Netlify = { env: { get: (k: string) => env[k] } };
};
setEnv({});
const mod = await import("../netlify/edge-functions/analytics-filter.ts");
const ipMatches = mod.ipMatches as (ip: string, entry: string) => boolean;
const fn = mod.default as (req: Request, ctx: { ip?: string; next: () => Promise<Response> }) => Promise<Response | undefined>;
const page = () => new Response("<html><head></head><body>x</body></html>", { headers: { "content-type": "text/html" } });
const call = (path: string, ua: string, o: { ip?: string; method?: string; next?: () => Response } = {}) =>
  fn(new Request("https://agenthiveinc.com" + path, { method: o.method || "GET", headers: { "user-agent": ua }, body: o.method === "POST" ? "a=1" : undefined }), {
    ip: o.ip || "73.1.2.3",
    next: async () => (o.next || page)(),
  });
const CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";

afterEach(() => setEnv({}));

describe("edge analytics-filter", () => {
  it("410s scanner paths and leaves real pages alone", async () => {
    for (const p of ["/wp-admin/", "/.env", "/.git/config", "/index.php"]) expect((await call(p, CHROME))?.status).toBe(410);
    for (const p of ["/", "/consult", "/concierge", "/x/", "/go/sprint", "/go/triage?from=home-hero"]) expect(await call(p, CHROME)).toBeUndefined();
  });
  it("never touches normal browsers on money paths, tracking params or form POSTs", async () => {
    const paths = [
      "/thanks?session_id=cs_live_a1B2c3D4e5F6",
      "/consult/thanks?session_id=cs_live_b1&product=sprint",
      "/?utm_source=x&utm_medium=social&utm_campaign=b2b&utm_content=hero%20cta",
      "/?fbclid=IwZXh0bgNhZW0CMTEAAR2x-Kd_9mS4lQ_aem_AbCd",
      "/?gclid=Cj0KCQiA4L67BhDUARIsADWrl7G2x_aBcD-EfGh&gbraid=0AAAAA9_ab&wbraid=CkQ_x",
      "/?formtest=1",
    ];
    for (const ua of [CHROME, IOS]) {
      for (const p of paths) expect(await call(p, ua)).toBeUndefined();
      expect(await call("/", ua, { method: "POST" })).toBeUndefined();
    }
  });
  it("serves search and AI crawlers (tagged, never blocked)", async () => {
    for (const ua of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    ]) {
      const r = await call("/consult", ua);
      expect(r?.status).toBe(200);
      expect(r?.headers.get("x-ah-traffic")).toBe("crawler");
      expect(await r?.text()).toContain("window.__PH_SKIP=1");
    }
  });
  it("403s scanner user agents and attack queries", async () => {
    for (const ua of ["sqlmap/1.8.11#stable", "Mozilla/5.00 (Nikto/2.5.0)", "Fuzz Faster U Fool v2.1.0"]) expect((await call("/", ua))?.status).toBe(403);
    for (const q of ["?id=1%20UNION%20SELECT%201", "?x=${jndi:ldap://e/a}", "?f=../../etc/passwd"]) expect((await call("/" + q, CHROME))?.status).toBe(403);
  });
  it("keeps /go redirects intact for tagged clients", async () => {
    const r = await call("/go/sprint", "curl/8.5", { next: () => new Response(null, { status: 302, headers: { location: "https://example.test/pay" } }) });
    expect(r?.status).toBe(302);
    expect(r?.headers.get("location")).toBe("https://example.test/pay");
  });
  it("opt-out token comes only from env; unset means no opt-out", async () => {
    expect(await call("/?ah_internal=", CHROME)).toBeUndefined();
    setEnv({ ANALYTICS_OPTOUT_TOKEN: "long-random-token" });
    expect((await call("/?ah_internal=long-random-token", CHROME))?.headers.get("set-cookie")).toMatch(/^ah_noanalytics=1;/);
    expect(await call("/?ah_internal=long-random", CHROME)).toBeUndefined();
  });
  it("matches cmd only as a whole query parameter name", async () => {
    expect(await call("/?recmd=1", CHROME)).toBeUndefined();
    expect((await call("/?cmd=id", CHROME))?.status).toBe(403);
    expect((await call("/?a=1&cmd=id", CHROME))?.status).toBe(403);
  });
  it("WARP ranges skip tracking for the request but never set the cookie; only the token does", async () => {
    for (const ip of ["104.28.5.6", "2a09:bac5:1::1"]) {
      const r = await call("/", CHROME, { ip });
      expect(r?.headers.get("x-ah-traffic")).toBe("internal");
      expect(r?.headers.get("set-cookie")).toBeNull();
      expect(await r?.text()).toContain("window.__PH_SKIP=1");
    }
    setEnv({ ANALYTICS_OPTOUT_TOKEN: "long-random-token" });
    expect((await call("/?ah_internal=long-random-token", CHROME, { ip: "104.28.5.6" }))?.headers.get("set-cookie")).toMatch(/^ah_noanalytics=1;/);
  });
  it("INTERNAL_IPS uses exact IPs and real v4/v6 CIDR, never prefixes", async () => {
    expect(ipMatches("73.1.2.30", "73.1.2.3")).toBe(false);
    expect(ipMatches("73.1.2.3", "73.1.2.3")).toBe(true);
    expect(ipMatches("73.12.200.1", "73.12.0.0/16")).toBe(true);
    expect(ipMatches("73.13.0.1", "73.12.0.0/16")).toBe(false);
    expect(ipMatches("2600:1700:abcd:1::5", "2600:1700:abcd::/48")).toBe(true);
    expect(ipMatches("2600:1700:abce::5", "2600:1700:abcd::/48")).toBe(false);
    expect(ipMatches("104.28.5.6", "104.28.")).toBe(false);
    setEnv({ INTERNAL_IPS: "73.1.2.3, 2600:1700:abcd::/48" });
    expect(await call("/", CHROME, { ip: "73.1.2.30" })).toBeUndefined();
    expect((await call("/", CHROME, { ip: "2600:1700:abcd:9::1" }))?.headers.get("x-ah-traffic")).toBe("internal");
  });
});
