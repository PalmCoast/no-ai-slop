import { describe, expect, it } from "vitest";
import { filterQuery, money, toBrief, toCsv } from "../shared/match";
import { parsePasted } from "../shared/shelf";
import { SHOPS } from "../shared/shops";

describe("multi-shop shelf", () => {
  it("keeps brown wool sweaters and explains the misses", () => {
    const result = filterQuery("brown wool sweater");
    expect(result.matches.map((item) => item.listing.id).sort()).toEqual([
      "etsy-pullover",
      "everlane-crew",
      "jcrew-brown",
      "quince-crew",
      "quince-turtle",
    ]);
    expect(result.near.find((item) => item.listing.id === "llbean-blend")?.reasons).toEqual(["wool blend, not wool"]);
    expect(result.near.find((item) => item.listing.id === "uniqlo-cotton")?.reasons).toEqual(["cotton, not wool"]);
    expect(result.near.find((item) => item.listing.id === "jcrew-navy")?.reasons).toEqual(["navy, not brown"]);
    expect(result.near.find((item) => item.listing.id === "alexmill-cardigan")?.reasons).toEqual(["cardigan, not sweater"]);
    expect(result.dropped.map((item) => item.listing.id).sort()).toEqual([
      "filson-shirt",
      "naadam-camel",
      "toddsnyder-polo",
      "uniqlo-navy-cotton",
    ]);
    expect(new Set(result.matches.map((item) => item.listing.merchant)).size).toBeGreaterThanOrEqual(4);
  });

  it("keeps 4 inch aluminum tube with a flange and drops the lookalikes", () => {
    const result = filterQuery("4 inch aluminum tube with a flange");
    expect(result.matches.map((item) => item.listing.id).sort()).toEqual([
      "grainger-both",
      "grainger-flange",
      "mcmaster-flange",
      "metals-cut",
      "zoro-mm",
    ]);
    expect(result.near.find((item) => item.listing.id === "amazon-plain")?.reasons).toContain("no flange");
    expect(result.near.find((item) => item.listing.id === "homedepot-steel")?.reasons[0]).toMatch(/steel/);
    expect(result.near.find((item) => item.listing.id === "grainger-pipe")?.reasons).toEqual(["pipe, not tube"]);
    expect(result.near.find((item) => item.listing.id === "mcmaster-3in")?.reasons[0]).toMatch(/3 inch/);
    expect(result.near.find((item) => item.listing.id === "fastenal-long")?.reasons[0]).toMatch(/1\.5 inch/);
    expect(result.near.find((item) => item.listing.id === "msc-rod")?.reasons).toEqual(["rod, not tube"]);
    expect(result.near.find((item) => item.listing.id === "mcmaster-fitting")?.reasons).toEqual(["flange, not tube"]);
    expect(result.dropped).toHaveLength(0);
  });

  it("folds a pasted listing into the same filter", () => {
    const extra = parsePasted("Acme Metals | 4 inch aluminum tube with a flange | $41.50 | https://example.com/tube");
    expect(extra).toHaveLength(1);
    expect(extra[0]?.priceCents).toBe(4150);
    const result = filterQuery("4 inch aluminum tube with a flange", extra);
    expect(result.matches.some((item) => item.listing.merchant === "Acme Metals")).toBe(true);
  });

  it("writes a shelf sheet and a brief for the two sample doors", () => {
    for (const shop of SHOPS) {
      const result = filterQuery(shop.query);
      const csv = toCsv(result);
      expect(csv.startsWith("status,merchant,title,price,reason,url\n")).toBe(true);
      expect(csv).toContain("match,");
      expect(csv).toContain(result.matches[0]?.listing.href ?? "");
      const brief = toBrief(shop.name, result);
      expect(brief).toContain(`# ${shop.name}`);
      expect(brief).toContain(`Matches: ${result.matches.length}`);
    }
    expect(money(8640)).toBe("$86.40");
  });
});
