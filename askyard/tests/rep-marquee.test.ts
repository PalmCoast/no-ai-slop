import { describe, expect, it } from "vitest";
import { applyVote, buildReport, meterLabel, parseRepQuery, scoreFromVotes, toneFor } from "../shared/rep";
import {
  applyBid,
  centsToDollars,
  dollarsToCents,
  MARQUEE_FLOOR_CENTS,
  minNextBidCents,
  parseBid,
  rankMarquee,
  SEED_MARQUEE,
} from "../shared/marquee";
import { SEED_QUESTIONS } from "../shared/ask";
import { SALE_APPS } from "../shared/catalog";
import { MARQUEE_URL } from "../shared/brand";

describe("reputation meter", () => {
  it("scores helpful answers as strong and flags watch words", () => {
    expect(parseRepQuery("  AskYard!! ")).toBe("askyard");
    expect(scoreFromVotes(74, 6, 0, 3)).toBeGreaterThanOrEqual(80);
    expect(meterLabel(40, 2)).toBe("watch");
    expect(toneFor("Shop accused in a lawsuit over a scam")).toBe("watch");
    expect(toneFor("Crew showed up on time")).toBe("good");
  });

  it("builds a report from board votes without roasting", () => {
    const report = buildReport({ query: "AskYard", board: SEED_QUESTIONS, now: new Date("2026-09-19T12:00:00.000Z") });
    expect(report.helpful).toBeGreaterThan(0);
    expect(report.label).toMatch(/strong|steady|quiet|watch/);
    expect(report.summary).not.toMatch(/rate my|hot or not/i);
    const voted = applyVote(SEED_QUESTIONS, "stop-missing-night-calls", "helpful");
    const night = voted.find((item) => item.slug === "stop-missing-night-calls");
    expect(night?.helpful).toBe((SEED_QUESTIONS.find((item) => item.slug === "stop-missing-night-calls")?.helpful ?? 0) + 1);
  });
});

describe("marquee name-your-price auction", () => {
  it("rejects a bid under the live crown plus a dollar", () => {
    expect(dollarsToCents("$251")).toBe(25100);
    expect(centsToDollars(25100)).toBe("$251.00");
    expect(minNextBidCents(SEED_MARQUEE)).toBe(25100);
    const low = parseBid("20", SEED_MARQUEE);
    expect("error" in low).toBe(true);
    const ok = parseBid(251, SEED_MARQUEE);
    expect(ok).toEqual({ cents: 25100 });
  });

  it("puts a higher bid on top and keeps the previous name on the chart", () => {
    const next = applyBid(SEED_MARQUEE, { name: "Vanity Labs", bidCents: 40000 });
    const ranked = rankMarquee(next);
    expect(ranked[0].name).toBe("Vanity Labs");
    expect(ranked[0].bidCents).toBe(40000);
    expect(ranked.some((row) => row.name === "First Deploy AI")).toBe(true);
    expect(MARQUEE_FLOOR_CENTS).toBe(2000);
  });

  it("lists Marquee on the shelf at a named bid, not a fixed Stripe Price", () => {
    const app = SALE_APPS.find((item) => item.slug === "marquee");
    expect(app?.url).toBe(MARQUEE_URL);
    expect(app?.price).toMatch(/You name the bid/);
  });
});
