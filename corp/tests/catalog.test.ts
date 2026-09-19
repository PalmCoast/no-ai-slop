import { describe, expect, it } from "vitest";
import { HIVE_SITES } from "../shared/portfolio";
import { HIVE_BOTS } from "../shared/bots";
import { BUZZ_SEED } from "../shared/buzz-seed";
import { CONSULT_STRIPE_RATES } from "../shared/consult";
import { CALENDLY_URL } from "../shared/brand";

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
    expect(HIVE_SITES.find((s) => s.slug === "first-deploy")?.price).toBe("$1,500 setup, then $250/mo");
    expect(HIVE_SITES.find((s) => s.slug === "first-deploy")?.name).toBe("First Deploy AI");
    expect(urls).toContain("https://flick.firstdeploy.ai/");
    expect(urls).toContain("https://jobproof.firstdeploy.ai/");
    expect(urls).toContain("https://askyard.firstdeploy.ai/");
    expect(urls).toContain("https://writehive.netlify.app/");
    expect(urls).toContain("https://bot-lock.netlify.app/");
    expect(urls).toContain("https://hivebriefcase.netlify.app/");
    expect(urls).toContain("https://stateside-jobs.netlify.app/");
    expect(HIVE_SITES.filter((s) => s.host === "netlify").length).toBeGreaterThanOrEqual(12);
  });

  it("does not include known-dead guessed hostnames", () => {
    const urls = HIVE_SITES.map((s) => s.url).join(" ");
    expect(urls).not.toContain("clawlock-security.netlify.app");
    expect(urls).not.toContain("agenthiveinc-hivebriefcase.netlify.app");
    expect(urls).not.toContain("commandcrm.netlify.app");
    expect(urls).not.toContain("mcp-rust-three.vercel.app");
    expect(urls).not.toContain("firstdeploy.dev");
  });
});

describe("swarm roster", () => {
  it("keeps twelve named Grok bots", () => {
    expect(HIVE_BOTS).toHaveLength(12);
    expect(HIVE_BOTS.some((b) => b.name === "Grok" && b.featured)).toBe(true);
  });
});

describe("consult rails", () => {
  it("keeps Calendly and Stripe buy links, not a grey embed", () => {
    expect(CALENDLY_URL).toBe("https://calendly.com/coltsinsider/30min");
    expect(CONSULT_STRIPE_RATES.map((rate) => rate.href)).toEqual([
      "https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h",
      "https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g",
      "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i",
    ]);
    expect(CONSULT_STRIPE_RATES.map((rate) => rate.amount)).toEqual(["$75", "$150", "$625 of $1,250"]);
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
});
