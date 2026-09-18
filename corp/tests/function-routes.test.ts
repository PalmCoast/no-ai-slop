import { describe, expect, it } from "vitest";
import { config as buzz } from "../netlify/functions/buzz";
import { config as rank } from "../netlify/functions/rank";
import { config as refresh } from "../netlify/functions/refresh";
import { config as buzzWeekly } from "../netlify/functions/buzz-weekly";
import { config as rankWeekly } from "../netlify/functions/rank-weekly";

describe("function routes", () => {
  it("serves Buzz and Rank as first-class /api paths so the SPA catch-all cannot win", () => {
    expect(buzz).toMatchObject({ path: "/api/buzz", method: "GET" });
    expect(rank).toMatchObject({ path: "/api/rank", method: "GET" });
    expect(refresh).toMatchObject({ path: "/api/refresh", method: "POST" });
  });

  it("keeps weekly bots on published production schedules", () => {
    expect(buzzWeekly).toMatchObject({ schedule: "@weekly" });
    expect(rankWeekly).toMatchObject({ schedule: "@weekly" });
  });
});
