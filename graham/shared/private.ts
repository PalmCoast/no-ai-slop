import type { Contact } from "./calls.ts";

/**
 * Operator-only. Never imported by the public pages.
 * The home-desk number is a reserved 555, used to prove the template strips it.
 */
export const OPERATOR_CONTACTS: Contact[] = [
  { name: "Reed", phones: [], emails: ["reedhive@agentmail.to"] },
  { name: "First Deploy consult", phones: ["+13203356186"], emails: ["daniel@agenthiveinc.com"] },
  { name: "Home desk", phones: ["+15095550199"], emails: [] },
];

export const OPERATOR_SECRET = "sk-test-graham-do-not-ship";
