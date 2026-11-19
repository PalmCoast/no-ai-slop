import type { Config } from "@netlify/functions";
import { handleWebhook } from "../lib/webhook";

export default function stripeWebhook(req: Request): Promise<Response> {
  return handleWebhook(req);
}

export const config: Config = {
  path: "/api/stripe-webhook",
  method: "POST",
};
