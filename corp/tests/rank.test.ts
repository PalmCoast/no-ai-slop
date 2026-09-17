import { describe, expect, it } from "vitest";
import { rankSites, scoreProbe } from "../shared/rank";

describe("scoreProbe", () => {
  it("gives live custom-domain featured apps a high score", () => {
    const result = scoreProbe({
      ok: true,
      status: 200,
      ms: 120,
      host: "custom",
      featured: true,
      statusHint: "live",
      hasPrice: true,
    });
    expect(result.statusLabel).toBe("live");
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it("marks lab repos without pretending they are production", () => {
    const result = scoreProbe({
      ok: true,
      status: 0,
      ms: 0,
      host: "github",
      statusHint: "lab",
    });
    expect(result.statusLabel).toBe("lab");
    expect(result.score).toBe(12);
  });

  it("marks failed probes as down", () => {
    const result = scoreProbe({
      ok: false,
      status: 404,
      ms: 80,
      host: "netlify",
      statusHint: "live",
    });
    expect(result.statusLabel).toBe("down");
  });
});

describe("rankSites", () => {
  it("orders by score and stamps 1-based ranks", () => {
    const ranked = rankSites(
      [
        {
          slug: "slow",
          name: "Slow",
          url: "https://slow.example",
          description: "d",
          host: "netlify",
          category: "saas",
          statusHint: "live",
        },
        {
          slug: "fast",
          name: "Fast",
          url: "https://fast.example",
          description: "d",
          host: "custom",
          category: "flagship",
          featured: true,
          statusHint: "live",
        },
      ],
      [
        { slug: "slow", url: "https://slow.example", ok: true, status: 200, ms: 2400 },
        { slug: "fast", url: "https://fast.example", ok: true, status: 200, ms: 90 },
      ],
    );
    expect(ranked[0].slug).toBe("fast");
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
  });
});
