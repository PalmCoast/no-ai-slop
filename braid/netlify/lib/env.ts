import { STAMP_SITE } from "../../src/offer.ts";

/** Netlify injects `Netlify` at runtime. Unit tests fall back to process.env. */
export function env(name: string): string | undefined {
  const value = typeof Netlify !== "undefined" ? Netlify.env.get(name) : process.env[name];
  return value === undefined || value === "" ? undefined : value;
}

/** Where Stripe should send the buyer back. */
export function siteUrl(req: Request): string {
  const configured = env("SITE_URL");
  if (configured) return configured.replace(/\/$/, "");
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}

/** Host written into the public stamp URL. Stable across preview deploys. */
export function publicOrigin(): string {
  return (env("SITE_URL") ?? STAMP_SITE).replace(/\/$/, "");
}
