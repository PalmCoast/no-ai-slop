import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@netlify/blobs", () => ({
  getStore: () => ({ setJSON: () => Promise.resolve() }),
}));
import handler, { config } from "../netlify/functions/go";
import { GO_LINKS, goTarget } from "../shared/go-links";
import {
  ANON_COOKIE,
  BOT_FORBIDDEN_BODY,
  BOT_RE,
  GO_OK_COOKIE,
  POSTHOG_COOKIE,
  POSTHOG_HOST,
  POSTHOG_KEY,
  captureGoEvents,
  classifyUa,
  distinctIdFromRequest,
  goClickProperties,
  hasGoOkCookie,
  isHiveHost,
  isSameSiteReferer,
  resolveGoGate,
} from "../shared/go-gate";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const SITE_REFERER = "https://agenthiveinc.com/consult";
const GO_OK_HEADER = `${GO_OK_COOKIE}=1`;

type WaitFn = (p: Promise<unknown>) => void;

function context(name: string, waits?: Promise<unknown>[]): { params: { name: string }; geo: { country?: { code: string } }; waitUntil: WaitFn } {
  return {
    params: { name },
    geo: { country: { code: "US" } },
    waitUntil: (p) => {
      waits?.push(p);
    },
  };
}

function req(path: string, init: RequestInit = {}): Request {
  return new Request(`https://agenthiveinc.com${path}`, init);
}

function cookiesOf(res: Response): string[] {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const raw = res.headers.get("set-cookie");
  return raw ? [raw] : [];
}

describe("/go tracker", () => {
  it("is a first-class function path that accepts GET and POST", () => {
    expect(config).toMatchObject({ path: "/go/:name" });
    expect(config.method).toEqual(["GET", "POST"]);
  });

  it("hands First Deploy to the firstdeploy.ai tracker with from=x", () => {
    expect(goTarget("first-deploy", "x")).toBe("https://firstdeploy.ai/go/start?from=x");
  });

  it("tags Stripe links with client_reference_id and utm_source=x", () => {
    const u = new URL(goTarget("concierge", "x")!);
    expect(u.origin + u.pathname).toBe(GO_LINKS.concierge.url);
    expect(u.searchParams.get("client_reference_id")).toBe("ah_x_concierge");
    expect(u.searchParams.get("utm_source")).toBe("x");
  });

  it("404s unknown names", () => {
    expect(goTarget("nope", "x")).toBeNull();
  });

  it("sends the ad sprint buttons to the retargeted $150 audit checkout, and keeps the monthly engine link", () => {
    const sprint = new URL(goTarget("ads-sprint", "ads")!);
    const monthly = new URL(goTarget("ads-engine", "ads")!);
    expect(sprint.origin + sprint.pathname).toBe("https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g");
    expect(sprint.searchParams.get("client_reference_id")).toBe("ah_ads_ads-sprint");
    expect(sprint.searchParams.get("utm_campaign")).toBe("ads-sprint");
    expect(monthly.origin + monthly.pathname).toBe("https://buy.stripe.com/4gM9ATa6U2mD36tbuq2ZO1M");
    expect(monthly.searchParams.get("client_reference_id")).toBe("ah_ads_ads-engine");
    expect(monthly.searchParams.get("utm_source")).toBe("agenthiveinc.com");
    expect(GO_LINKS["ads-sprint"].kind).toBe("stripe");
    expect(GO_LINKS["ads-engine"].kind).toBe("stripe");
  });

  it("sends Burn Book to the $750 packet checkout", () => {
    const packet = new URL(goTarget("burn-book", "x")!);
    expect(packet.origin + packet.pathname).toBe("https://buy.stripe.com/7sYcN5a6Ud1hcH3eGC2ZO1O");
    expect(packet.searchParams.get("client_reference_id")).toBe("ah_x_burn-book");
    expect(packet.searchParams.get("utm_campaign")).toBe("burn-book");
    expect(GO_LINKS["burn-book"].kind).toBe("stripe");
    expect(GO_LINKS["burn-book"].label).toContain("$750");
  });

  it("adds /go routes for the $75 consult, $625 pack, and ainexus $2,500 / $6,500 offers", () => {
    const consult = new URL(goTarget("consult-30", "consult")!);
    expect(consult.origin + consult.pathname).toBe("https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h");
    expect(consult.searchParams.get("client_reference_id")).toBe("ah_consult_consult-30");
    expect(consult.searchParams.get("utm_campaign")).toBe("consult-30");

    const deposit = new URL(goTarget("deposit", "home")!);
    const pack = new URL(goTarget("pack", "home")!);
    expect(deposit.origin + deposit.pathname).toBe("https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i");
    expect(pack.origin + pack.pathname).toBe("https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i");
    expect(deposit.searchParams.get("client_reference_id")).toBe("ah_home_deposit");
    expect(pack.searchParams.get("client_reference_id")).toBe("ah_home_pack");

    const tier1 = new URL(goTarget("ainexus-tier1", "ext-ainexus360-com")!);
    const tier2 = new URL(goTarget("ainexus-tier2", "ext-ainexus360-com")!);
    expect(tier1.origin + tier1.pathname).toBe("https://buy.stripe.com/dRm8wPgvif9pfTfaqm2ZO0S");
    expect(tier2.origin + tier2.pathname).toBe("https://buy.stripe.com/fZueVd2EsbXd22p2XU2ZO0T");
    expect(tier1.searchParams.get("client_reference_id")).toBe("ah_ext-ainexus360-com_ainexus-tier1");
    expect(tier2.searchParams.get("client_reference_id")).toBe("ah_ext-ainexus360-com_ainexus-tier2");
    expect(GO_LINKS["consult-30"].kind).toBe("stripe");
    expect(GO_LINKS.deposit.kind).toBe("stripe");
    expect(GO_LINKS.pack.kind).toBe("stripe");
    expect(GO_LINKS["ainexus-tier1"].kind).toBe("stripe");
    expect(GO_LINKS["ainexus-tier2"].kind).toBe("stripe");
  });
});

describe("bot classification (mirrors firstdeploy.ai)", () => {
  it("treats empty UA, Googlebot, curl/, and python-requests as bots", () => {
    expect(classifyUa("").bot).toBe(true);
    expect(classifyUa("Googlebot/2.1 (+http://www.google.com/bot.html)").bot).toBe(true);
    expect(classifyUa("curl/8.5.0").bot).toBe(true);
    expect(classifyUa("python-requests/2.32.3").bot).toBe(true);
    expect(BOT_RE.test("curl/8.5.0")).toBe(true);
    expect(BOT_RE.test("python-requests/2.32.3")).toBe(true);
  });

  it("includes firstdeploy.ai's quora link token and leaves browser UAs human", () => {
    expect(BOT_RE.source).toContain("quora link");
    expect(classifyUa(BROWSER_UA).kind).toBe("human");
    expect(classifyUa("Mozilla/5.0 (compatible; Quora Link Preview/1.0)").bot).toBe(true);
  });

  it("lets the ah-clicktest UA through as a test, not a bot", () => {
    expect(classifyUa("ah-clicktest/1.0").kind).toBe("test");
    expect(classifyUa("ah-clicktest/1.0").bot).toBe(false);
  });
});

describe("same-site referer and ah_go_ok cookie", () => {
  it("treats agenthiveinc.com, subdomains, and this site's Netlify hosts as hive hosts", () => {
    expect(isHiveHost("agenthiveinc.com")).toBe(true);
    expect(isHiveHost("www.agenthiveinc.com")).toBe(true);
    expect(isHiveHost("infrastructure.agenthiveinc.com")).toBe(true);
    expect(isHiveHost("dashing-cascaron-ddd950.netlify.app")).toBe(true);
    expect(isHiveHost("deploy-preview-140--dashing-cascaron-ddd950.netlify.app")).toBe(true);
    expect(isHiveHost("ainexus360.com")).toBe(false);
    expect(isHiveHost("firstdeploy.ai")).toBe(false);
    expect(isHiveHost("x.com")).toBe(false);
  });

  it("counts a same-site Referer, including prod host against a preview host", () => {
    const preview = new URL("https://deploy-preview-140--dashing-cascaron-ddd950.netlify.app/go/deposit");
    expect(isSameSiteReferer("https://agenthiveinc.com/consult", preview)).toBe(true);
    expect(isSameSiteReferer("https://deploy-preview-140--dashing-cascaron-ddd950.netlify.app/", preview)).toBe(true);
    expect(isSameSiteReferer("https://ainexus360.com/", preview)).toBe(false);
    expect(isSameSiteReferer("https://firstdeploy.ai/", preview)).toBe(false);
    expect(isSameSiteReferer("https://x.com/agenthive", preview)).toBe(false);
    expect(isSameSiteReferer("", preview)).toBe(false);
  });

  it("resolves cookie, same-site referer, and POST confirm, and rejects a bare GET", () => {
    const url = new URL("https://agenthiveinc.com/go/ads-sprint");
    expect(resolveGoGate(req("/go/ads-sprint", { headers: { "user-agent": BROWSER_UA } }), url)).toBeNull();
    expect(
      resolveGoGate(req("/go/ads-sprint", { headers: { "user-agent": BROWSER_UA, referer: SITE_REFERER } }), url),
    ).toBe("referer");
    expect(
      resolveGoGate(req("/go/ads-sprint", { headers: { "user-agent": BROWSER_UA, cookie: GO_OK_HEADER } }), url),
    ).toBe("cookie");
    expect(
      resolveGoGate(req("/go/ads-sprint", { method: "POST", headers: { "user-agent": BROWSER_UA } }), url),
    ).toBe("confirm");
    expect(hasGoOkCookie(req("/go/x", { headers: { cookie: GO_OK_HEADER } }))).toBe(true);
    expect(hasGoOkCookie(req("/go/x"))).toBe(false);
  });
});

describe("/go handler bot gate and human 302", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("404s an unknown slug without a Location", async () => {
    const res = await handler(req("/go/nope", { headers: { "user-agent": BROWSER_UA } }), context("nope") as never);
    expect(res.status).toBe(404);
    expect(res.headers.get("location")).toBeNull();
  });

  it.each([
    ["Googlebot/2.1", "Googlebot/2.1 (+http://www.google.com/bot.html)"],
    ["curl/", "curl/8.5.0"],
    ["python-requests", "python-requests/2.32.3"],
    ["empty UA", ""],
  ])("returns 403 and no Location for %s", async (_label, ua) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await handler(req("/go/ads-engine", { headers: { "user-agent": ua } }), context("ads-engine") as never);
    expect(res.status).toBe(403);
    expect(await res.text()).toBe(BOT_FORBIDDEN_BODY);
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("content-type")).toMatch(/text\/plain/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the click-through interstitial for a browser UA with no referer and no cookie", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await handler(req("/go/ads-engine", { headers: { "user-agent": BROWSER_UA } }), context("ads-engine") as never);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("content-type")).toMatch(/text\/html/);
    const body = await res.text();
    expect(body).toContain("Continue to checkout");
    expect(body).toContain('method="POST"');
    expect(body).toContain('action="/go/ads-engine"');
    expect(body).not.toContain("buy.stripe.com");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the interstitial for a cross-site referer such as ainexus360.com, with no cookie", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await handler(
      req("/go/ainexus-tier2", { headers: { "user-agent": BROWSER_UA, referer: "https://ainexus360.com/" } }),
      context("ainexus-tier2") as never,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
    const body = await res.text();
    expect(body).toContain("Continue to checkout");
    expect(body).toContain('action="/go/ainexus-tier2"');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats a preview-host Referer as first-party when stamping from and client_reference_id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const waits: Promise<unknown>[] = [];
    const res = await handler(
      new Request("https://deploy-preview-140--dashing-cascaron-ddd950.netlify.app/go/deposit", {
        headers: {
          "user-agent": BROWSER_UA,
          referer: "https://deploy-preview-140--dashing-cascaron-ddd950.netlify.app/consult",
        },
      }),
      context("deposit", waits) as never,
    );
    await Promise.all(waits);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(goTarget("deposit", "consult"));
  });

  it("302s a browser UA with a same-site Referer to the same destination goTarget already builds", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const waits: Promise<unknown>[] = [];
    const res = await handler(
      req("/go/ads-engine", { headers: { "user-agent": BROWSER_UA, referer: SITE_REFERER } }),
      context("ads-engine", waits) as never,
    );
    await Promise.all(waits);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(goTarget("ads-engine", "consult"));
    expect(cookiesOf(res).some((c) => c.startsWith(`${GO_OK_COOKIE}=`))).toBe(true);
    expect(cookiesOf(res).some((c) => c.startsWith(`${ANON_COOKIE}=anon_`))).toBe(true);
  });

  it("302s a browser UA that only has the JS ah_go_ok cookie", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const waits: Promise<unknown>[] = [];
    const res = await handler(
      req("/go/ads-engine", { headers: { "user-agent": BROWSER_UA, cookie: GO_OK_HEADER } }),
      context("ads-engine", waits) as never,
    );
    await Promise.all(waits);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(goTarget("ads-engine", "direct"));
  });

  it("302s a POST confirm from the interstitial and keeps query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const waits: Promise<unknown>[] = [];
    const res = await handler(
      req("/go/deposit?from=home", { method: "POST", headers: { "user-agent": BROWSER_UA } }),
      context("deposit", waits) as never,
    );
    await Promise.all(waits);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(goTarget("deposit", "home"));
  });

  it("keeps from= query, referer-derived from, and every catalog slug's destination unchanged", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const cases: Array<{ path: string; name: string; headers?: Record<string, string>; from: string }> = [
      { path: "/go/ads-sprint?from=ads", name: "ads-sprint", from: "ads" },
      { path: "/go/ads-engine?from=ads", name: "ads-engine", from: "ads" },
      { path: "/go/first-deploy", name: "first-deploy", from: "direct" },
      { path: "/go/concierge", name: "concierge", from: "direct" },
      { path: "/go/indexme-pro", name: "indexme-pro", from: "direct" },
      { path: "/go/indexme-studio", name: "indexme-studio", from: "direct" },
      { path: "/go/flick", name: "flick", from: "direct" },
      { path: "/go/burn-book", name: "burn-book", from: "direct" },
      { path: "/go/consult-30", name: "consult-30", from: "direct" },
      { path: "/go/deposit", name: "deposit", from: "direct" },
      { path: "/go/pack", name: "pack", from: "direct" },
      { path: "/go/ainexus-tier1", name: "ainexus-tier1", from: "direct" },
      { path: "/go/ainexus-tier2", name: "ainexus-tier2", from: "direct" },
      {
        path: "/go/concierge",
        name: "concierge",
        headers: { referer: "https://x.com/agenthive/status/1" },
        from: "x",
      },
    ];
    for (const c of cases) {
      const waits: Promise<unknown>[] = [];
      const res = await handler(
        req(c.path, { headers: { "user-agent": BROWSER_UA, cookie: GO_OK_HEADER, ...(c.headers || {}) } }),
        context(c.name, waits) as never,
      );
      await Promise.all(waits);
      expect(res.status, c.path).toBe(302);
      expect(res.headers.get("location"), c.path).toBe(goTarget(c.name, c.from));
    }
  });

  it("fires buy_click and go_click for a human hit, not for a bot, with bot_verdict and client distinct_id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const waits: Promise<unknown>[] = [];
    const res = await handler(
      req("/go/ads-engine?from=ads&utm_source=li", {
        headers: {
          "user-agent": BROWSER_UA,
          referer: "https://agenthiveinc.com/ads/index.html",
          cookie: `${POSTHOG_COOKIE}=${encodeURIComponent(JSON.stringify({ distinct_id: "ph-test-123", $sesid: [1, "ses-abc"] }))}`,
        },
      }),
      context("ads-engine", waits) as never,
    );
    await Promise.all(waits);
    expect(res.status).toBe(302);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${POSTHOG_HOST}/batch/`);
    const body = JSON.parse(String(init.body)) as {
      api_key: string;
      batch: Array<{ event: string; distinct_id: string; properties: Record<string, unknown> }>;
    };
    expect(body.api_key).toBe(POSTHOG_KEY);
    expect(body.batch.map((e) => e.event).sort()).toEqual(["buy_click", "go_click"]);
    for (const ev of body.batch) {
      expect(ev.distinct_id).toBe("ph-test-123");
      expect(ev.properties.distinct_id).toBe("ph-test-123");
      expect(ev.properties.slug).toBe("ads-engine");
      expect(ev.properties.destination_host).toBe("buy.stripe.com");
      expect(ev.properties.client_reference_id).toBe("ah_ads_ads-engine");
      expect(ev.properties.utm_campaign).toBe("ads-engine");
      expect(ev.properties.utm_source).toBe("agenthiveinc.com");
      expect(ev.properties.utm_medium).toBe("hub");
      expect(ev.properties.utm_content).toBe("ads");
      expect(ev.properties.referer).toBe("https://agenthiveinc.com/ads/index.html");
      expect(ev.properties.via).toBe("server_go");
      expect(ev.properties.bot_verdict).toBe("human");
      expect(ev.properties.gate).toBe("referer");
      expect(ev.properties.$lib).toBe("agenthive-go");
      expect(ev.properties.$source).toBe("server_go");
      expect(ev.properties.$raw_user_agent).toBe(BROWSER_UA);
      expect(ev.properties.$session_id).toBe("ses-abc");
      expect(ev.properties.$current_url).toContain("/go/ads-engine");
    }
    expect(cookiesOf(res).some((c) => c.startsWith(`${ANON_COOKIE}=`))).toBe(false);
  });

  it("still 403s a bot UA even when it sends a same-site Referer, a cookie, or a POST", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const attempts: Request[] = [
      req("/go/ads-sprint", { headers: { "user-agent": "curl/8.5.0", referer: SITE_REFERER } }),
      req("/go/ads-sprint", { headers: { "user-agent": "Googlebot/2.1", cookie: GO_OK_HEADER } }),
      req("/go/ads-sprint", { method: "POST", headers: { "user-agent": "python-requests/2.32.3" } }),
    ];
    for (const r of attempts) {
      const res = await handler(r, context("ads-sprint") as never);
      expect(res.status).toBe(403);
      expect(res.headers.get("location")).toBeNull();
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("go analytics helpers", () => {
  it("prefers the PostHog cookie, then ah_go_id, then a generated anon id", () => {
    const ph = distinctIdFromRequest(
      req("/go/x", { headers: { cookie: `${POSTHOG_COOKIE}=${encodeURIComponent(JSON.stringify({ distinct_id: "abc" }))}` } }),
    );
    expect(ph).toEqual({ id: "abc", setCookie: null });
    const anon = distinctIdFromRequest(req("/go/x", { headers: { cookie: `${ANON_COOKIE}=anon_existing` } }));
    expect(anon).toEqual({ id: "anon_existing", setCookie: null });
    const generated = distinctIdFromRequest(req("/go/x"));
    expect(generated.id).toMatch(/^anon_/);
    expect(generated.setCookie).toMatch(new RegExp(`^${ANON_COOKIE}=`));
  });

  it("aborts a hung PostHog request at the timeout cap", async () => {
    const hung = vi.fn((_url: string, init: RequestInit) => {
      return new Promise((_, reject) => {
        const signal = init.signal as AbortSignal;
        signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
      });
    });
    await expect(
      captureGoEvents(
        "id-1",
        goClickProperties({
          slug: "ads-engine",
          from: "direct",
          dest: new URL(goTarget("ads-engine", "direct")!),
          requestUrl: new URL("https://agenthiveinc.com/go/ads-engine"),
          referer: "",
          kind: "human",
          gate: "cookie",
        }),
        hung as never,
        20,
      ),
    ).rejects.toThrow();
    expect(hung).toHaveBeenCalledTimes(1);
  });
});
