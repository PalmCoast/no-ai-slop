import { isDemoLicense, isWellFormedLicense, normalizeKey } from "../../shared/license";
import { FREE_CLIP_LIMIT, FREE_MAX_BYTES, FREE_MAX_DURATION_MS } from "../../shared/plans";
import { HttpError } from "./http";
import { consumeFreeSlot, getFreeSlot, getLicenseRecord } from "./licenses";
import { demoPaymentsAllowed } from "./stripe";

export function licenseFromRequest(req: Request): string {
  return normalizeKey(req.headers.get("x-flick-license"));
}

export function deviceFromRequest(req: Request): string {
  return (req.headers.get("x-flick-device") ?? "").trim().toLowerCase();
}

function isDeviceId(value: string): boolean {
  return /^[a-z0-9]{8,32}$/.test(value);
}

export async function seatForRequest(req: Request): Promise<{
  plan: "street" | "monthly" | "founder" | "demo";
  canPublish: boolean;
  freeRemaining: number;
  email?: string;
}> {
  const key = licenseFromRequest(req);
  if (key && isDemoLicense(key) && demoPaymentsAllowed()) {
    const rec = await getLicenseRecord(key);
    if (rec) return { plan: "demo", canPublish: true, freeRemaining: FREE_CLIP_LIMIT, email: rec.email };
  }
  if (key && isWellFormedLicense(key)) {
    const rec = await getLicenseRecord(key);
    if (rec && rec.plan !== "demo") {
      return { plan: rec.plan, canPublish: true, freeRemaining: FREE_CLIP_LIMIT, email: rec.email };
    }
  }
  const device = deviceFromRequest(req);
  const used = device && isDeviceId(device) ? await getFreeSlot(device) : null;
  const freeRemaining = used ? 0 : FREE_CLIP_LIMIT;
  return { plan: "street", canPublish: freeRemaining > 0, freeRemaining };
}

export async function assertCanPublish(req: Request, input: { durationMs: number; size: number }): Promise<"street" | LicensePlanPaid> {
  const key = licenseFromRequest(req);
  if (key && isPlausible(key)) {
    if (isDemoLicense(key) && !demoPaymentsAllowed()) {
      throw new HttpError(401, "demo_disabled", "Demo licenses stay in the rehearsal hall. Buy Lights or Marquee to publish for real.");
    }
    const rec = await getLicenseRecord(key);
    if (!rec) throw new HttpError(401, "bad_license", "That license is not on the board. Check the key, or buy Lights.");
    return rec.plan === "demo" ? "monthly" : rec.plan;
  }

  if (input.durationMs > FREE_MAX_DURATION_MS) {
    throw new HttpError(402, "paywall", "Street pass is two minutes. Lights and Marquee go to fifteen.");
  }
  if (input.size > FREE_MAX_BYTES) {
    throw new HttpError(402, "paywall", "Street pass is 25 MB. Lights and Marquee take the full 100 MB.");
  }
  const device = deviceFromRequest(req);
  if (!isDeviceId(device)) {
    throw new HttpError(400, "need_device", "Missing device id for the free street pass.");
  }
  const slot = await getFreeSlot(device);
  if (slot) {
    throw new HttpError(402, "paywall", "You already used the free street pass on this device. Lights is $19/month. Marquee is $99 once.");
  }
  return "street";
}

export async function consumeStreetPass(req: Request, clipId: string): Promise<void> {
  const device = deviceFromRequest(req);
  if (!isDeviceId(device)) return;
  const ok = await consumeFreeSlot(device, clipId);
  if (!ok) throw new HttpError(402, "paywall", "You already used the free street pass on this device.");
}

type LicensePlanPaid = "monthly" | "founder";

function isPlausible(key: string): boolean {
  return isWellFormedLicense(key) || isDemoLicense(key);
}
