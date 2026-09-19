export function stripeSecret(): string | undefined {
  return typeof Netlify !== "undefined" ? Netlify.env.get("STRIPE_SECRET_KEY") : process.env.STRIPE_SECRET_KEY;
}

export function stripeWebhookSecret(): string | undefined {
  return typeof Netlify !== "undefined" ? Netlify.env.get("STRIPE_WEBHOOK_SECRET") : process.env.STRIPE_WEBHOOK_SECRET;
}

export function demoBidsAllowed(): boolean {
  const flag = typeof Netlify !== "undefined" ? Netlify.env.get("ALLOW_DEMO_PAYMENTS") : process.env.ALLOW_DEMO_PAYMENTS;
  const context = typeof Netlify !== "undefined" ? Netlify.env.get("CONTEXT") : process.env.CONTEXT;
  if (context === "production" && stripeSecret()) return false;
  return flag === "true" || !stripeSecret();
}

export function originFrom(req: Request): string {
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}
