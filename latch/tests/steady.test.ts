import { describe, expect, it } from "vitest";
import { BODY_NEEDS, RING_LINE, STEADY_STEPS, TOO_MUCH_LINE, WHO_LINE, handoffScript } from "../shared/steady";

describe("steady", () => {
  it("names AuDHD and CPTSD and refuses treatment", () => {
    expect(WHO_LINE).toMatch(/AuDHD means autism and ADHD together/);
    expect(WHO_LINE).toMatch(/CPTSD/);
    expect(WHO_LINE.toLowerCase()).toMatch(/does not treat autism, adhd, or cptsd/);
    expect(WHO_LINE.toLowerCase()).not.toMatch(/cure|exposure|emdr|process the trauma/);
  });

  it("keeps the stop physical and does not ask why", () => {
    expect(TOO_MUCH_LINE.toLowerCase()).toMatch(/does not|nothing here asks why/);
    const text = STEADY_STEPS.map((step) => `${step.label} ${step.detail}`).join(" ").toLowerCase();
    expect(text).toMatch(/feet on the floor/);
    expect(text).toMatch(/leave the room/);
    expect(text).not.toMatch(/why|what happened|trauma|trigger/);
  });

  it("turns body needs into one physical move", () => {
    expect(BODY_NEEDS.map((need) => need.move)).toEqual([
      "Turn one sound down, or step out",
      "Get a drink of water",
      "Go to the bathroom",
      "Leave the room",
    ]);
  });

  it("says what the ring will do before it rings", () => {
    expect(RING_LINE).toMatch(/same every time/);
    expect(RING_LINE).toMatch(/too much/);
  });

  it("names both sides of a switch", () => {
    const script = handoffScript("Reply to the landlord", "Get a drink of water", "Open the thread");
    expect(script.from).toBe("Reply to the landlord");
    expect(script.to).toBe("Get a drink of water");
    expect(script.firstMove).toBe("Open the thread");
    expect(handoffScript("  ", "Next", null).from).toBeNull();
  });
});
