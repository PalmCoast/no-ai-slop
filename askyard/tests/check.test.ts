import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { FD_PRICE_LONG } from "../shared/brand";
import { SALE_APPS } from "../shared/catalog";
import {
  buildReport,
  decodeShareToken,
  demoReport,
  evidenceFromDocuments,
  fallbackCheck,
  isBlockedUrl,
  MODEL_LABEL,
  parseCheckQuery,
  shareDocument,
} from "../shared/check";
import { renderCheckCardPng, renderToolCardPng } from "../shared/check-card";
import { pageForPath, sitemapXml } from "../shared/seo";
import checkHandler from "../netlify/functions/check";
import cardHandler from "../netlify/functions/check-card";
import shareHandler from "../netlify/functions/check-share";
import { scrapePublicSite } from "../netlify/lib/scrape-site";

const root = dirname(fileURLToPath(import.meta.url));

describe("shop check parser", () => {
  it("splits a name and city and leaves URLs alone", () => {
    const named = parseCheckQuery("  Tide Electric,  Bunnell ");
    expect(named.ok && named.value).toMatchObject({ sourceKind: "name", name: "Tide Electric", city: "Bunnell", url: null });
    const site = parseCheckQuery("https://tide.example/hours");
    expect(site.ok && site.value.sourceKind).toBe("website");
    expect(site.ok && site.value.url).toBe("https://tide.example/hours");
    const facebook = parseCheckQuery("facebook.com/tide-electric");
    expect(facebook.ok && facebook.value.sourceKind).toBe("facebook");
    const maps = parseCheckQuery("https://www.google.com/maps/place/Tide");
    expect(maps.ok && maps.value.sourceKind).toBe("google");
  });

  it("rejects private and credentialed URLs", () => {
    expect(parseCheckQuery("http://127.0.0.1/secret").ok).toBe(false);
    expect(parseCheckQuery("http://169.254.169.254/latest/meta-data").ok).toBe(false);
    expect(parseCheckQuery("http://10.0.0.8/").ok).toBe(false);
    expect(parseCheckQuery("https://user:pass@tide.example/").ok).toBe(false);
    expect(isBlockedUrl(new URL("http://192.168.1.9/"))).toBe(true);
    expect(isBlockedUrl(new URL("https://203.0.113.10/"))).toBe(false);
  });
});

describe("shop check report", () => {
  it("labels model rows as prompts and sends IndexMe with UTMs", () => {
    const report = buildReport({ sourceKind: "name", name: "Tide Electric", city: "Bunnell", url: null }, null);
    expect(report.evidenceLabel).toBe("Not a live scrape");
    expect(report.models.map((model) => model.name)[0]).toBe("Grok");
    expect(report.models.every((model) => model.label === MODEL_LABEL)).toBe(true);
    expect(report.prompt).toMatch(/Tide Electric in Bunnell/);
    expect(report.prompt).not.toMatch(/Grok says|according to Grok/i);
    const indexme = new URL(report.ctas.indexme);
    expect(indexme.origin).toBe("https://buy.stripe.com");
    expect(indexme.pathname).toBe("/4gMcN52Ese5ldL7cyu2ZO1a");
    expect(indexme.searchParams.get("utm_content")).toBe("indexme-pro");
    const studio = new URL(report.ctas.indexmeStudio);
    expect(studio.pathname).toBe("/aFa00jfre2mD8qN5622ZO1b");
    const consult = new URL(report.ctas.consultPay);
    expect(consult.pathname).toBe("/fZufZh92Qf9p5eB2XU2ZO1h");
    expect(indexme.searchParams.get("utm_source")).toBe("askyard");
    expect(indexme.searchParams.get("utm_medium")).toBe("check");
    expect(indexme.searchParams.get("utm_campaign")).toBe("shop-visibility");
    const desk = new URL(report.ctas.firstDeploy);
    expect(desk.origin).toBe("https://firstdeploy.ai");
    expect(desk.hash).toBe("#check");
    expect(report.ctas.firstDeployPrice).toBe(FD_PRICE_LONG);
    expect(report.ctas.indexmePrice).toBe(SALE_APPS.find((app) => app.slug === "indexme")?.price);
    expect(JSON.stringify(report.ctas)).not.toMatch(/linktr\.ee/i);
    expect(report.gaps.map((gap) => gap.id)).toEqual(["no-website"]);
    expect(JSON.stringify(report)).not.toMatch(/14 apps|\$70k/);
  });

  it("reads phone, hours, sitemap, IndexNow, and CAL language from a live page", () => {
    const evidence = evidenceFromDocuments({
      html: `<!doctype html><html><head>
        <script type="application/ld+json">{"@type":"LocalBusiness","telephone":"(386) 555-0148","openingHours":"Mo-Fr 08:00-17:00"}</script>
        <link rel="sitemap" href="/sitemap.xml" />
        </head><body><p>IndexNow key is published. We still buy Windows Server CALs.</p></body></html>`,
      robots: "User-agent: *\n",
      sitemapStatus: 404,
      sitemapBody: "",
      finalUrl: "https://tide.example/",
    });
    const report = buildReport(
      { sourceKind: "website", name: "Tide Electric", city: "Bunnell", url: "https://tide.example/" },
      evidence,
    );
    expect(report.evidenceLabel).toBe("Live scrape");
    expect(report.phone).toBe("(386) 555-0148");
    expect(report.hours).toContain("08:00");
    expect(report.sitemap).toBe("found");
    expect(report.indexnow).toBe("found");
    expect(report.gaps.map((gap) => gap.id)).toEqual(["windows-cal"]);
    expect(report.ctas.netyard).toMatch(/^https:\/\/netyard\.firstdeploy\.ai\//);
    const decoded = decodeShareToken(report.token ?? "");
    expect(decoded?.token).toBe(report.token);
    expect(decoded?.phone).toBe(report.phone);
    expect(decoded?.ctas.netyard).toBe(report.ctas.netyard);
  });

  it("flags a missing sitemap and IndexNow key without inventing a model answer", () => {
    const evidence = evidenceFromDocuments({
      html: "<html><body><p>Call the shop.</p></body></html>",
      robots: "User-agent: *\nDisallow:\n",
      sitemapStatus: 404,
      sitemapBody: "missing",
      finalUrl: "https://tide.example/",
    });
    const report = buildReport(
      { sourceKind: "website", name: "Tide Electric", city: "", url: "https://tide.example/" },
      evidence,
    );
    expect(report.gaps.map((gap) => gap.id)).toEqual(["no-sitemap", "no-indexnow", "missing-phone", "missing-hours"]);
    expect(report.note).toMatch(/invented a different business/);
    expect(report.models.every((model) => model.href.includes(encodeURIComponent(report.prompt)))).toBe(true);
  });

  it("keeps the Harbor HVAC card fictional", () => {
    const report = demoReport();
    expect(report.demo).toBe(true);
    expect(report.name).toBe("Harbor HVAC");
    expect(report.city).toBe("Palm Coast, FL");
    expect(report.evidenceLabel).toBe("Demo shop");
    expect(report.sharePath).toBe("/check/harbor-hvac");
    expect(report.gaps.map((gap) => gap.id)).toContain("demo-fictional");
    expect(JSON.stringify(report)).not.toMatch(/14 apps|\$70k/);
    const html = shareDocument(report);
    expect(html).toContain("https://askyard.firstdeploy.ai/check/harbor-hvac.png");
    expect(html).toContain('content="noindex, follow"');
    expect(html).toContain("Opened with this prompt");
    expect(html).toContain("agenthiveinc.com");
    expect(html).not.toMatch(/linktr\.ee|14 apps|\$70k/);
  });
});

describe("shop check card image", () => {
  it("writes a 1200x630 PNG for the demo and the tool", () => {
    for (const png of [renderCheckCardPng(demoReport()), renderToolCardPng()]) {
      expect(png[0]).toBe(137);
      expect(png[1]).toBe(80);
      expect(png[2]).toBe(78);
      expect(png[3]).toBe(71);
      const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
      expect(view.getUint32(16)).toBe(1200);
      expect(view.getUint32(20)).toBe(630);
    }
  });

  it("keeps the share card on cream and steel", () => {
    const css = readFileSync(join(root, "../src/styles.css"), "utf8");
    const card = css.slice(css.indexOf(".shop-card"));
    expect(card).toContain("#f6edd8");
    expect(card).toContain("#1c1915");
    expect(card).toContain("#5c564c");
    expect(card).not.toMatch(/#e4b84a|#ffd56a|#f0a500|orange/i);
  });
});

describe("shop check handlers", () => {
  it("returns a name-only report and blocks a private host", async () => {
    const ok = await checkHandler(
      new Request("https://askyard.firstdeploy.ai/api/check", {
        method: "POST",
        body: JSON.stringify({ query: "Tide Electric in Bunnell" }),
      }),
    );
    expect(ok.status).toBe(200);
    const body = (await ok.json()) as { report: { name: string; gaps: Array<{ id: string }> } };
    expect(body.report.name).toBe("Tide Electric");
    expect(body.report.gaps[0].id).toBe("no-website");

    const blocked = await checkHandler(
      new Request("https://askyard.firstdeploy.ai/api/check", {
        method: "POST",
        body: JSON.stringify({ query: "http://169.254.169.254/latest/meta-data" }),
      }),
    );
    expect(blocked.status).toBe(400);
  });

  it("serves the demo PNG and a share page", async () => {
    const image = await cardHandler(new Request("https://askyard.firstdeploy.ai/api/check-card?demo=harbor-hvac"));
    expect(image.headers.get("content-type")).toBe("image/png");
    const bytes = new Uint8Array(await image.arrayBuffer());
    expect(bytes[0]).toBe(137);

    const report = fallbackCheck("https://tide.example/");
    if ("error" in report) throw new Error(report.error);
    const share = await shareHandler(new Request(`https://askyard.firstdeploy.ai/s/${report.token}`), {
      params: { token: report.token ?? "" },
    } as never);
    expect(share.status).toBe(200);
    const html = await share.text();
    expect(html).toContain("og:image");
    expect(html).toContain("tide.example");
    expect(html).toContain("1 gap on the public record");
    expect(html).toContain("noindex");
  });

  it("does not follow a redirect onto a link-local address", async () => {
    const evidence = await scrapePublicSite("https://shop.example/", {
      lookupHost: async () => ["203.0.113.10"],
      fetchImpl: async (input) => {
        const url = new URL(String(input));
        if (url.hostname === "shop.example") {
          return new Response(null, { status: 302, headers: { location: "http://169.254.169.254/latest/meta-data" } });
        }
        return new Response("nope", { status: 500 });
      },
    });
    expect(evidence.blocked).toBe(true);
    expect(evidence.fetched).toBe(false);
  });
});

describe("shop check seo", () => {
  it("publishes /check with a card image and keeps the demo out of the sitemap", () => {
    const page = pageForPath("/check");
    expect(page.ogImage).toBe("https://askyard.firstdeploy.ai/check/og.png");
    expect(page.noindex).toBeUndefined();
    const demo = pageForPath("/check/harbor-hvac");
    expect(demo.noindex).toBe(true);
    expect(demo.ogImage).toBe("https://askyard.firstdeploy.ai/check/harbor-hvac.png");
    expect(sitemapXml()).toContain("https://askyard.firstdeploy.ai/check");
    expect(sitemapXml()).not.toContain("harbor-hvac");
    expect(page.bodyHtml).toContain("$1,500");
    expect(page.bodyHtml).not.toMatch(/14 apps|\$70k/);
  });
});
