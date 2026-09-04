/**
 * GET /api/license?session_id=cs_…  → verifies the Checkout Session is paid and
 *                                     mints (or returns) the license key
 * GET /api/license?key=SONARIS-…    → { valid, plan, issuedAt }
 */
import type { Config } from "@netlify/functions";
import { validateLicense } from "../lib/auth";
import { error, json } from "../lib/http";
import { mintLicenseForSession, sessionIsPaid, stripe } from "../lib/stripe";

export default async (req: Request) => {
  if (req.method !== "GET") return error(405, "method_not_allowed", "Use GET.");
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const key = url.searchParams.get("key");

  if (sessionId) {
    const s = stripe();
    if (!s) return error(409, "stripe_not_configured", "Stripe is not configured; demo licenses come from POST /api/checkout.");
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return error(400, "bad_session", "Malformed session id.");
    try {
      const session = await s.checkout.sessions.retrieve(sessionId);
      if (!sessionIsPaid(session)) return json({ paid: false, status: session.payment_status }, { status: 402 });
      const rec = await mintLicenseForSession(session);
      return json({ paid: true, licenseKey: rec.key, plan: rec.plan, issuedAt: rec.issuedAt, email: rec.email ?? null });
    } catch (e) {
      return error(502, "stripe_error", (e as Error).message);
    }
  }

  if (key !== null) {
    const check = await validateLicense(key);
    return json({
      valid: check.valid,
      plan: check.plan ?? null,
      issuedAt: check.issuedAt ?? null,
      demo: check.demo ?? false,
      reason: check.valid ? null : check.reason,
    });
  }

  return error(400, "missing_param", "Pass ?key= or ?session_id=.");
};

export const config: Config = {
  path: "/api/license",
  method: ["GET"],
};
