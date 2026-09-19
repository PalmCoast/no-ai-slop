import { describe, expect, it } from "vitest";
import { config as ask } from "../netlify/functions/ask";
import { config as board } from "../netlify/functions/board";
import { config as hunt } from "../netlify/functions/hunt";
import { config as tally } from "../netlify/functions/tally";
import { config as huntWeekly } from "../netlify/functions/hunt-weekly";
import { fallbackAnswer } from "../netlify/lib/draft";

describe("function routes", () => {
  it("serves ask, board, hunt, and tally on first-class /api paths", () => {
    expect(ask).toMatchObject({ path: "/api/ask", method: "POST" });
    expect(board).toMatchObject({ path: "/api/board", method: "GET" });
    expect(hunt).toMatchObject({ path: "/api/hunt", method: "GET" });
    expect(tally).toMatchObject({ path: "/api/tally", method: "POST" });
  });

  it("refreshes the hunt on a published daily schedule", () => {
    expect(huntWeekly).toMatchObject({ schedule: "@daily" });
  });
});

describe("draft fallback", () => {
  it("still names a priced offer when the gateway is cold", () => {
    const text = fallbackAnswer("How do I stop missing night calls?");
    expect(text).toMatch(/First Deploy AI|after-hours|AskYard/);
    expect(text).toMatch(/\$1,500|\$250|free 30|JobProof|Consult/);
  });
});
