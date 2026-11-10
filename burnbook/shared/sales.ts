import { BRAND_URL, COMPANY, PACKET_LABEL, PARENT_NAME, PAYMENT_LINK, PLACE } from "./brand.ts";

export const SALES_SUBJECT = "Burn Book board packet, $750 paid in full";

export const SALES_NOTE = [
  "Burn Book is the ledger for a team that already pays for agents.",
  "",
  "Open the book and type last month's vendors, seats, finished jobs, and the hours spent fixing the output. It prices idle seats, a second tool on the same job, and the rework. The ledger stays in the browser.",
  "",
  `The board packet is ${PACKET_LABEL}, paid in full:`,
  PAYMENT_LINK,
  "",
  "That charge is the memo, one letter per cut, this month times twelve (labeled as a repeat, not a prediction), and the plain-text and JSON files. It does not include someone making the cuts. That work is " +
    PARENT_NAME +
    ".",
  "",
  "Northline in the sample is a worked example.",
  "",
  `${COMPANY}, ${PLACE}.`,
  `${BRAND_URL}sales`,
].join("\n");

/** Post this from @FirstDeployAI. The buy link is the live Stripe charge. */
export const LAUNCH_POST = [
  "Burn Book prices last month's AI bill against the jobs it finished. Idle seats, a second tool on the same job, and the hours spent fixing the output.",
  "",
  `The ledger stays in the browser. The board packet is ${PACKET_LABEL}, paid in full.`,
  "",
  PAYMENT_LINK,
].join("\n");
