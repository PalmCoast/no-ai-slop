import { describe, expect, it, beforeEach } from "vitest";
import { answerAs } from "../shared/answer.ts";
import { briefOf } from "../shared/brief.ts";
import { screenCall } from "../shared/calls.ts";
import { phoneKey, samePhone } from "../shared/phone.ts";
import { OPERATOR_CONTACTS, OPERATOR_SECRET } from "../shared/private.ts";
import { FORWARD_RULE, PUBLIC_CONTACTS } from "../shared/public.ts";
import { nextSlots } from "../shared/slots.ts";
import { standUp } from "../shared/standup.ts";
import { danielTemplate, templateLeaks } from "../shared/template.ts";
import { resetDesk } from "../netlify/lib/store.ts";
import screen from "../netlify/functions/screen.ts";
import chat from "../netlify/functions/chat.ts";
import book from "../netlify/functions/book.ts";
import standup from "../netlify/functions/standup.ts";
import templateFn from "../netlify/functions/template.ts";

const NOW = new Date("2026-10-01T16:01:00.000Z");

describe("phone", () => {
  it("matches the consult line across formats and leaves a country code alone", () => {
    expect(samePhone("+1 (320) 335-6186", "3203356186")).toBe(true);
    expect(samePhone("+91 98400 11122", "+1 320 335 6186")).toBe(false);
    expect(phoneKey("+91 98400 11122")).toBe("919840011122");
  });
});

describe("the line", () => {
  it("rings a contact even when the words look like a mill", () => {
    const result = screenCall({
      from: "+1 320-335-6186",
      said: "It's the shop line about a warranty question from a client.",
      contacts: PUBLIC_CONTACTS,
      now: NOW,
    });
    expect(result.action).toBe("ring");
    expect(result.contactName).toBe("First Deploy consult");
    expect(result.spam).toBe(false);
  });

  it("books a real quote from an unfamiliar country code", () => {
    const result = screenCall({
      from: "+91 98400 11122",
      said: "HVAC quote for Thursday. Can we book 30 minutes?",
      contacts: PUBLIC_CONTACTS,
      now: NOW,
    });
    expect(result.action).toBe("book");
    expect(result.spam).toBe(false);
    expect(result.slot?.iso).toBe("2026-10-01T19:00:00.000Z");
  });

  it("blocks a press-1 mill from a US number", () => {
    const result = screenCall({
      from: "+1 305 555 0199",
      said: "Press 1 to be removed from our calling list.",
      contacts: PUBLIC_CONTACTS,
      now: NOW,
    });
    expect(result.action).toBe("block");
    expect(result.spamId).toBe("press1");
    expect(result.say.startsWith("This is Graham, Daniel's line.")).toBe(true);
  });

  it("alerts when the work has stopped and still offers the hold", () => {
    const result = screenCall({
      from: "+1 904 555 0144",
      said: "The site is down and the crew is dark. Can we book a call?",
      contacts: OPERATOR_CONTACTS,
      now: NOW,
    });
    expect(result.action).toBe("alert");
    expect(result.urgent).toBe(true);
    expect(result.offerBooking).toBe(true);
  });

  it("takes a quote as a note", () => {
    const result = screenCall({
      from: "+1 386 555 0177",
      said: "Tell Daniel the quote is $4,200.",
      contacts: PUBLIC_CONTACTS,
      now: NOW,
    });
    expect(result.action).toBe("note");
  });

  it("does not treat a country as the reason", () => {
    expect(FORWARD_RULE).toContain("A country code is not a reason.");
  });
});

describe("slots", () => {
  it("offers 3:00 and 4:00 ET on the Thursday the line was cut", () => {
    const slots = nextSlots(NOW, 2);
    expect(slots.map((slot) => slot.iso)).toEqual(["2026-10-01T19:00:00.000Z", "2026-10-01T20:00:00.000Z"]);
    expect(slots[0].label).toContain("3:00");
    expect(slots[0].label).toContain("ET");
  });
});

describe("answers", () => {
  it("keeps GuyThread's wedding, gift, and flex calls", () => {
    const wedding = answerAs("What do I wear to an outdoor October wedding?");
    expect(wedding.headline).toContain("Navy suit");
    expect(wedding.price).toBeTruthy();
    expect(wedding.reason.length).toBeGreaterThan(10);
    const gift = answerAs("Anniversary is Saturday. About $100. She loves to cook.");
    expect(gift.headline).toContain("Dutch oven");
    const flex = answerAs("Jacobs or Puka at flex? Half-PPR.");
    expect(flex.headline).toBe("Start Puka.");
  });

  it("states the line rule and the standup price", () => {
    const rule = answerAs("Block the spam mills from India");
    expect(rule.headline).toContain("country code");
    const price = answerAs("What does it cost to stand up another shop");
    expect(price.price).toContain("$1,750");
    expect(price.spoken.startsWith("This is Graham, Daniel's line.")).toBe(true);
  });
});

describe("template", () => {
  it("ships the Team Bot recipe without contacts or the operator secret", () => {
    const template = danielTemplate();
    expect(template.source).toBe("spacexai-team-bots-2026-09-28");
    expect(template.recipe).toBe(true);
    expect(template.credentials).toBe("not-included");
    expect(template.contacts).toBe("not-included");
    expect(template.plugins.every((plugin) => plugin.secret === false)).toBe(true);
    expect(templateLeaks(template, OPERATOR_CONTACTS, [OPERATOR_SECRET])).toEqual([]);
    expect(JSON.stringify(template)).not.toContain("reedhive@agentmail.to");
    expect(JSON.stringify(template)).not.toContain(OPERATOR_SECRET);
  });

  it("names the next being after the surname they typed", () => {
    const stood = standUp({ surname: "nguyen", operator: "Lan Nguyen", shop: "Lan Electric", place: "Orlando" });
    expect(stood.ok).toBe(true);
    if (!stood.ok) return;
    expect(stood.being).toBe("Nguyen");
    expect(stood.template.disclosure).toBe("This is Nguyen, Lan Nguyen's line.");
    expect(templateLeaks(stood.template, OPERATOR_CONTACTS, [OPERATOR_SECRET])).toEqual([]);
  });

  it("refuses a surname that is not a name", () => {
    expect(standUp({ surname: "x", operator: "Pat" }).ok).toBe(false);
    expect(standUp({ surname: "Nguyen<script>", operator: "Pat" }).ok).toBe(false);
    expect(standUp({ surname: "Nguyen", operator: "P" }).ok).toBe(false);
  });
});

describe("functions", () => {
  beforeEach(() => resetDesk());

  it("screens through the desk and keeps the home number off the template", async () => {
    const blocked = await screen(
      new Request("http://graham.test/api/screen", {
        method: "POST",
        body: JSON.stringify({ from: "+15095550199", said: "Press 1. Extended warranty." }),
      }),
    );
    const blockedBody = (await blocked.json()) as { result: { action: string; contactName?: string } };
    expect(blockedBody.result.action).toBe("ring");
    expect(blockedBody.result.contactName).toBe("Home desk");

    const mill = await screen(
      new Request("http://graham.test/api/screen", {
        method: "POST",
        body: JSON.stringify({ from: "+91 80 5555 0100", said: "Your car warranty is about to expire. Press 1." }),
      }),
    );
    const millBody = (await mill.json()) as { result: { action: string; spam: boolean } };
    expect(millBody.result.action).toBe("block");
    expect(millBody.result.spam).toBe(true);

    const recipe = await templateFn(new Request("http://graham.test/api/template"));
    const recipeBody = (await recipe.json()) as { template: { contacts: string } };
    expect(recipe.status).toBe(200);
    expect(recipeBody.template.contacts).toBe("not-included");
    expect(JSON.stringify(recipeBody)).not.toContain("5095550199");
  });

  it("answers, holds a slot, and stands a being up", async () => {
    const chatRes = await chat(
      new Request("http://graham.test/api/chat", {
        method: "POST",
        body: JSON.stringify({ question: "Jacobs or Puka at flex?" }),
      }),
    );
    const chatBody = (await chatRes.json()) as { answer: { headline: string } };
    expect(chatBody.answer.headline).toBe("Start Puka.");

    const open = await book(new Request("http://graham.test/api/book"));
    const openBody = (await open.json()) as { slots: { iso: string }[] };
    const held = await book(
      new Request("http://graham.test/api/book", {
        method: "POST",
        body: JSON.stringify({ name: "Reed", topic: "Launch scoreboard", slot: openBody.slots[0].iso }),
      }),
    );
    const heldBody = (await held.json()) as { hold: { name: string }; brief: { holds: number } };
    expect(heldBody.hold.name).toBe("Reed");
    expect(heldBody.brief.holds).toBe(1);
    expect(briefOf({ notes: [], alerts: [], bookings: [{}] }).line).toBe("1 held");

    const stood = await standup(
      new Request("http://graham.test/api/standup", {
        method: "POST",
        body: JSON.stringify({ surname: "Brooks", operator: "Brooks", place: "Dallas" }),
      }),
    );
    const stoodBody = (await stood.json()) as { being: string; price: string; template: { credentials: string } };
    expect(stood.status).toBe(200);
    expect(stoodBody.being).toBe("Brooks");
    expect(stoodBody.price).toContain("$1,750");
    expect(stoodBody.template.credentials).toBe("not-included");
  });
});
