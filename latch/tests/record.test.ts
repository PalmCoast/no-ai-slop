import { describe, expect, it } from "vitest";
import { handle } from "../netlify/lib/api";
import { signToken, verifyToken } from "../netlify/lib/sign";
import { commitNow, emptyState, pauseTimer, setLicense, startCustomTimer, startTimer, tickTimer } from "../shared/latch";
import { generateDemoKey, isPlausibleLicense } from "../shared/license";
import { DEMO_NOTE, FREE_LINE, MAKER_NOTE, PRICE_CENTS, PRICE_DETAIL, PUBLIC_COPY } from "../shared/offer";
import { exportLog, recordTime, summaryLine } from "../shared/record";

const T0 = new Date(2026, 8, 28, 9, 0, 0).getTime();

function licensedTask() {
  return setLicense(commitNow(emptyState(), "Reply to the landlord", "now-1", null, "unused", T0), generateDemoKey(() => 0));
}

describe("the offer", () => {
  it("gives the timer away, prices the record once, and does not make a treatment claim", () => {
    expect(PRICE_CENTS).toBe(2900);
    expect(PRICE_DETAIL).toContain("$29 once");
    expect(PRICE_DETAIL).toContain("No subscription");
    expect(FREE_LINE).toContain("free");
    expect(MAKER_NOTE).toContain("my experience");
    expect(MAKER_NOTE).toContain("does not treat ADHD");
    const copy = PUBLIC_COPY.toLowerCase();
    expect(copy).not.toMatch(/cure|clinically proven|guaranteed|treatment for adhd/);
  });
});

describe("the record", () => {
  it("keeps a finished timer only when the record is unlocked", () => {
    const open = tickTimer(startTimer(commitNow(emptyState(), "Reply to the landlord", "now-1", null, "x", T0), "fifteen", T0, "fence-1"), T0 + 15_000);
    expect(recordTime(open, T0 + 15_000)).toBe(open);

    const done = tickTimer(startTimer(licensedTask(), "fifteen", T0, "fence-1"), T0 + 15_000);
    const kept = recordTime(done, T0 + 15_000);
    expect(kept.log).toHaveLength(1);
    expect(kept.log[0]).toMatchObject({ id: "fence-1", title: "Reply to the landlord", seconds: 15, parked: 0 });
    expect(summaryLine(kept.log, T0)).toBe("Under a minute on 1 task. 0 thoughts parked.");
    expect(exportLog(kept.log)).toContain("Reply to the landlord");
    expect(exportLog(kept.log)).not.toContain("cure");
  });

  it("keeps a stopped timer after 15 seconds and skips a misclick", () => {
    const running = startTimer(licensedTask(), "ten", T0, "fence-2");
    const short = recordTime(pauseTimer(running, T0 + 5_000), T0 + 5_000);
    expect(short.log).toHaveLength(0);
    const kept = recordTime(pauseTimer(running, T0 + 20_000), T0 + 20_000);
    expect(kept.log[0]?.seconds).toBe(20);
  });

  it("rejects a custom length outside 1 to 90 minutes", () => {
    const state = licensedTask();
    expect(startCustomTimer(state, 0, T0)).toBe(state);
    expect(startCustomTimer(state, 91, T0)).toBe(state);
    expect(startCustomTimer(state, 45, T0, "fence-3").timer?.durationSec).toBe(45 * 60);
  });
});

describe("checkout", () => {
  it("issues a demo key without charging, and does not echo the task", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const res = await handle(
      new Request("http://127.0.0.1:5183/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "secret task about the landlord" }),
      }),
    );
    const body = (await res.json()) as { demo: boolean; licenseKey: string; message: string };
    expect(res.status).toBe(200);
    expect(body.demo).toBe(true);
    expect(body.message).toBe(DEMO_NOTE);
    expect(isPlausibleLicense(body.licenseKey)).toBe(true);
    expect(JSON.stringify(body)).not.toContain("secret task");

    const check = await handle(
      new Request("http://127.0.0.1:5183/api/license", {
        method: "POST",
        body: JSON.stringify({ key: body.licenseKey.toLowerCase() }),
      }),
    );
    expect(await check.json()).toMatchObject({ valid: true, demo: true });
  });

  it("signs a paid token that the browser can store", () => {
    const token = signToken("cs_test_123", "test-secret");
    expect(verifyToken(token, "test-secret")).toBe(true);
    expect(verifyToken(token, "other-secret")).toBe(false);
    expect(isPlausibleLicense(token)).toBe(true);
    expect(verifyToken(`${token}x`, "test-secret")).toBe(false);
  });
});
