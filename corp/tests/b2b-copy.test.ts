import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as C from "../shared/b2bCopy";
import { PAGE_SEO, sitemapXml } from "../shared/seo";

const all = JSON.stringify(C);

describe("COPY.md sections (approved 2026-11-27)", () => {
  it("labels the case study right next to the numbers", () => {
    const html = C.CASE_STUDY_HTML;
    expect(html.indexOf("Example teardown (illustrative numbers)")).toBeLessThan(html.indexOf("$6,800"));
    expect(html).toMatch(/^<p class="cx-label"><strong>Example teardown \(illustrative numbers\)\.<\/strong>/);
    expect(html.match(/<caption>Example teardown \(illustrative numbers\)<\/caption>/g)).toHaveLength(2);
    expect(html).toContain("$6,800");
    expect(html).toContain("$2,150");
    expect(html).toContain("not a client result");
  });
  it("keeps prices and drops forbidden claims", () => {
    expect(C.LADDER_HTML).toContain("$2,500");
    expect(C.LADDER_HTML).toContain("$3,500/month");
    expect(all).not.toMatch(/\$70k|\$70,000|Smith Trucking|buy\.stripe\.com|\/go\/(sprint|retainer)|up front|paid at checkout|One button to pay/i);
  });
  it("ships the AI bill page with NDA, retention, redaction and FAQ, in sitemap and llms.txt", () => {
    expect(PAGE_SEO.some((p) => p.path === "/send-your-bill")).toBe(true);
    expect(sitemapXml()).toContain("https://agenthiveinc.com/send-your-bill</loc>");
    expect(readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8")).toContain("https://agenthiveinc.com/send-your-bill");
    expect(C.BILL_NDA_CLAUSE).toMatch(/2 years/);
    expect(C.BILL_RETENTION_HTML).toMatch(/Deleted within 7 days of delivery/);
    expect(C.BILL_REDACT_HTML).toMatch(/AWS Bedrock/);
    expect(C.BILL_FAQ).toHaveLength(7);
    expect(C.B2B_TRUST_LINE).toMatch(/20\+ years/);
  });
});
