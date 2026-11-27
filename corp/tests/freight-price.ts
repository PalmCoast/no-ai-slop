/** $2,500 is a stale Concierge price on AgentHive, except in the approved Freight Ops AI Agent phrases (AI visibility packet 2026-11-20). */
export const FREIGHT_PRICE_PHRASES = [
  "$2,500 to start through Stripe, scoped per brokerage",
  "$2,500, invoiced after your triage call, scoped per brokerage",
  "a $2,500 freight AI agent proof",
  "a $2,500 two-week proof of a custom AI agent for freight",
];
export function stripFreightPrice(text: string): string {
  return FREIGHT_PRICE_PHRASES.reduce((t, phrase) => t.split(phrase).join(""), text);
}
