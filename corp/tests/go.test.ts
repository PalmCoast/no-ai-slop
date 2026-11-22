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
  POSTHOG_COOKIE,
  POSTHOG_HOST,
  POSTHOG_KEY,
  captureGoEvents,
  classifyUa,
  distinctIdFromRequest,
  goClickProperties,
} from "../shared/go-gate";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

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

describe("/go tracker", () => {
  it("is a first-class function path", () => {
    expect(config).toMatchObject({ path: "/go/:name" });
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

  it("302s a browser UA to the same destination goTarget already builds", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const waits: Promise<unknown>[] = [];
    const res = await handler(
      req("/go/ads-engine", { headers: { "user-agent": BROWSER_UA } }),
      context("ads-engine", waits) as never,
    );
    await Promise.all(waits);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(goTarget("ads-engine", "direct"));
    expect(res.headers.get("set-cookie")).toMatch(new RegExp(`^${ANON_COOKIE}=anon_`));
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
        req(c.path, { headers: { "user-agent": BROWSER_UA, ...(c.headers || {}) } }),
        context(c.name, waits) as never,
      );
      await Promise.all(waits);
      expect(res.status, c.path).toBe(302);
      expect(res.headers.get("location"), c.path).toBe(goTarget(c.name, c.from));
    }
  });

  it("fires buy_click and go_click for a human hit, not for a bot", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const waits: Promise<unknown>[] = [];
    const res = await handler(
      req("/go/ads-engine?from=ads&utm_source=li", {
        headers: {
          "user-agent": BROWSER_UA,
          referer: "https://agenthiveinc.com/ads/index.html",
          cookie: `${POSTHOG_COOKIE}=${encodeURIComponent(JSON.stringify({ distinct_id: "ph-test-123" }))}`,
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
      expect(ev.properties.slug).toBe("ads-engine");
      expect(ev.properties.destination_host).toBe("buy.stripe.com");
      expect(ev.properties.client_reference_id).toBe("ah_ads_ads-engine");
      expect(ev.properties.utm_campaign).toBe("ads-engine");
      expect(ev.properties.utm_source).toBe("agenthiveinc.com");
      expect(ev.properties.utm_medium).toBe("hub");
      expect(ev.properties.utm_content).toBe("ads");
      expect(ev.properties.referer).toBe("https://agenthiveinc.com/ads/index.html");
      expect(ev.properties.via).toBe("server_go");
    }
    expect(res.headers.get("set-cookie")).toBeNull();
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
        }),
        hung as never,
        20,
      ),
    ).rejects.toThrow();
    expect(hung).toHaveBeenCalledTimes(1);
  });
});
