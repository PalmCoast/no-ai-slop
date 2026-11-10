import { describe, expect, it } from "vitest";
import { HIVE_SITES } from "../shared/portfolio";
import { GO_LINKS } from "../shared/go-links";
import { HIVE_BOTS } from "../shared/bots";
import { BUZZ_SEED, scrubBuzzEdition, type BuzzEdition } from "../shared/buzz-seed";
import { CONSULT_STRIPE_RATES } from "../shared/consult";
import { BOOK_HREF } from "../shared/brand";
import { CONCIERGE_PRICE, CONCIERGE_STRIPE_URL } from "../shared/concierge";

describe("portfolio catalog", () => {
  it("has unique slugs and https urls", () => {
    const slugs = HIVE_SITES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const site of HIVE_SITES) {
      expect(site.url.startsWith("https://")).toBe(true);
    }
  });

  it("lists every hive-map commercial site plus verified Netlify apps", () => {
    const urls = HIVE_SITES.map((s) => s.url);
    expect(urls).toContain("https://firstdeploy.ai/");
    expect(HIVE_SITES.find((s) => s.slug === "first-deploy")?.price).toBe("$150 burn-audit hour, then a $1,250 operator pack ($625 deposit) or Concierge at $2,000/mo");
    expect(HIVE_SITES.find((s) => s.slug === "first-deploy")?.name).toBe("First Deploy AI");
    expect(urls).toContain("https://flick.firstdeploy.ai/");
    expect(urls).toContain("https://writehive.netlify.app/");
    expect(urls).toContain("https://bot-lock.netlify.app/");
    expect(urls).toContain("https://hivebriefcase.netlify.app/");
    expect(urls).toContain("https://stateside-jobs.netlify.app/");
    expect(HIVE_SITES.filter((s) => s.host === "netlify").length).toBeGreaterThanOrEqual(10);
  });

  it("does not link the retired trade sites", () => {
    const text = JSON.stringify(HIVE_SITES) + JSON.stringify(GO_LINKS);
    for (const host of ["send-tonight", "check.firstdeploy.ai", "desk-check-fd", "firstdeploy-noshows", "firstdeploy-quotes", "firstdeploy-quiz", "jobproof", "askyard", "marquee.firstdeploy.ai", "netyard", "hillmirror"]) {
      expect(text.toLowerCase()).not.toContain(host);
    }
  });

  it("does not include known-dead guessed hostnames", () => {
    const urls = HIVE_SITES.map((s) => s.url).join(" ");
    expect(urls).not.toContain("clawlock-security.netlify.app");
    expect(urls).not.toContain("agenthiveinc-hivebriefcase.netlify.app");
    expect(urls).not.toContain("commandcrm.netlify.app");
    expect(urls).not.toContain("mcp-rust-three.vercel.app");
    expect(urls).not.toContain("firstdeploy.dev");
  });

  it("leaves out products dropped from the top-10 lineup", () => {
    const text = JSON.stringify(HIVE_SITES).toLowerCase();
    for (const name of ["claudefarm", "askyard", "guythread", "braid", "hillmirror", "socketsnap", "aipricingcalculators", "ai pricing calculators", "clawlock", "deskaudit"]) {
      expect(text).not.toContain(name);
    }
  });
});

describe("swarm roster", () => {
  it("keeps twelve named Grok bots", () => {
    expect(HIVE_BOTS).toHaveLength(12);
    expect(HIVE_BOTS.some((b) => b.name === "Grok" && b.featured)).toBe(true);
  });
});

describe("consult rails", () => {
  it("keeps the shop line and Stripe buy links, not a grey embed", () => {
    expect(BOOK_HREF).toBe("https://calendly.com/coltsinsider/30min");
    expect(CONSULT_STRIPE_RATES.map((rate) => rate.href)).toEqual([
      "https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h",
      "https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g",
      "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i",
    ]);
    expect(CONSULT_STRIPE_RATES.map((rate) => rate.amount)).toEqual(["$75", "$150", "$625 of $1,250"]);
    expect(CONCIERGE_PRICE).toBe("$2,000/mo");
    expect(CONCIERGE_STRIPE_URL).toBe("https://buy.stripe.com/6oUeVd7YM3qH0Ylbuq2ZO1u");
  });
});

describe("buzz seed", () => {
  it("ships a cited briefing so The Buzz is never empty", () => {
    expect(BUZZ_SEED.stories.length).toBeGreaterThanOrEqual(5);
    expect(BUZZ_SEED.takeaways.length).toBeGreaterThanOrEqual(4);
    for (const story of BUZZ_SEED.stories) {
      expect(story.url.startsWith("https://")).toBe(true);
    }
  });

  it("turns a kept-it line into We kept it and never starts a sentence with kept", () => {
    const token = String.fromCharCode(71, 114, 111, 107);
    const edition: BuzzEdition = {
      weekOf: "2026-09-15",
      generatedAt: "2026-09-17T18:00:00.000Z",
      author: "AgentHive Inc",
      headline: "Notes",
      dek: `${token} kept it because the source was public.`,
      takeaways: [],
      stories: [
        {
          title: "A note",
          url: "https://example.com/a",
          source: "Example",
          why: `Done. ${token} kept the file name in the summary.`,
          tags: [],
        },
      ],
      hiveNote: `${token} kept it.`,
      method: "seed",
    };
    const out = scrubBuzzEdition(edition);
    expect(out.dek).toBe("We kept it because the source was public.");
    expect(out.hiveNote).toBe("We kept it.");
    expect(out.stories[0]?.why).toBe("Done. Kept the file name in the summary.");
    const blob = [out.dek, out.hiveNote, out.headline, ...out.stories.map((story) => story.why)].join(" ");
    expect(blob).not.toMatch(new RegExp(token, "i"));
    expect(blob).not.toMatch(/(^|[.!?]\s+)kept\b/);
  });
});
