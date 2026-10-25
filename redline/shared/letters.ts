import { assistanceBand, fplCents, fplPercent, FPL_SOURCE } from "./fpl";
import { formatUsd } from "./money";
import { EMERGENCY_VISITS } from "./rates";
import { type Flag, type ReviewedLine, sumCents } from "./review";

export type LetterInput = {
  hospital: string;
  patient: string;
  account: string;
  serviceDate: string;
  payer: string;
  lines: readonly ReviewedLine[];
  patientOwesCents: number | null;
  eobAllowedCents: number | null;
  permission: {
    patient: boolean;
    hospital: boolean;
    insurer: boolean;
    assistance: boolean;
  };
  household: number | null;
  incomeCents: number | null;
};

export type Packet = {
  hospital: string | null;
  insurer: string | null;
  assistance: string | null;
  script: string | null;
};

function names(input: LetterInput): { patient: string; hospital: string; account: string; when: string } {
  return {
    patient: input.patient.trim() || "the patient",
    hospital: input.hospital.trim() || "the hospital",
    account: input.account.trim() || "the account on the bill",
    when: input.serviceDate.trim() || "the date of service on the bill",
  };
}

function flagged(lines: readonly ReviewedLine[]): ReviewedLine[] {
  return lines.filter((line) => line.flags.length > 0);
}

function lineHeading(line: ReviewedLine): string {
  const code = line.code ? ` (${line.code})` : "";
  const qty = line.quantity > 1 ? `, quantity ${line.quantity}` : "";
  return `${line.description}${code}${qty}`;
}

function describeFlag(flag: Flag): string {
  return flag.note;
}

function moneyBlock(input: LetterInput): { billed: number; ask: number; savings: number } {
  return {
    billed: sumCents(input.lines, (line) => line.billedCents),
    ask: sumCents(input.lines, (line) => line.askCents),
    savings: sumCents(input.lines, (line) => line.savingsCents),
  };
}

function listLines(lines: readonly ReviewedLine[]): string {
  return lines
    .map((line, index) => {
      const notes = line.flags.map((flag) => describeFlag(flag)).join(" ");
      const source = line.referenceNote ? ` Reference: ${line.referenceNote}` : "";
      return `${index + 1}. ${lineHeading(line)}, billed ${formatUsd(line.billedCents)}, ask ${formatUsd(line.askCents)}. ${notes}${source}`;
    })
    .join("\n");
}

function assistanceParagraph(input: LetterInput): string | null {
  if (!input.permission.assistance) return null;
  if (input.household == null || input.incomeCents == null) {
    return "Please send the financial assistance application. I will fill in household size and income. If this hospital is tax-exempt, apply the financial assistance policy under 26 USC 501(r) before this account goes to collections.";
  }
  const percent = fplPercent(input.incomeCents, input.household);
  const guideline = formatUsd(fplCents(input.household));
  const band = assistanceBand(input.incomeCents, input.household);
  if (band === "qualify") {
    return `Household size is ${input.household}. Annual income is ${formatUsd(input.incomeCents)}, about ${percent}% of the poverty guideline (${guideline}). ${FPL_SOURCE} Alaska and Hawaii use higher figures. If this hospital is tax-exempt, I am asking you to apply the financial assistance policy under 26 USC 501(r) before this account goes to collections.`;
  }
  return `Household size is ${input.household}. Annual income is ${formatUsd(input.incomeCents)}, about ${percent}% of the poverty guideline (${guideline}). ${FPL_SOURCE} That is over 400%, so I am not asking for charity care from that test. I am still asking you to correct the lines in this letter.`;
}

export function buildPacket(input: LetterInput): Packet {
  if (!input.permission.patient) return { hospital: null, insurer: null, assistance: null, script: null };
  const { patient, hospital, account, when } = names(input);
  const money = moneyBlock(input);
  const lines = flagged(input.lines);
  const list = lines.length > 0 ? listLines(lines) : "I do not see a duplicate or a multiple over the reference in the lines Redline read. I am still asking for a full itemized bill.";
  const eob =
    input.eobAllowedCents != null
      ? `The explanation of benefits shows an allowed amount of ${formatUsd(input.eobAllowedCents)}. Please honor the lower of that figure and the line-level ask of ${formatUsd(money.ask)}.`
      : "";
  const balance =
    input.patientOwesCents != null ? `The bill shows a patient balance of ${formatUsd(input.patientOwesCents)}.` : "";
  const emergency = input.lines.some((line) => line.code && EMERGENCY_VISITS.has(line.code))
    ? "This visit looks like emergency care. If any clinician was out of network, the No Surprises Act limits the bill to the in-network cost share. Please apply that before you ask me to pay."
    : "";
  const aid = assistanceParagraph(input);
  const closing =
    "Reference dollars are national figures Redline keeps on file. Each cited line says what the figure is. Confirm the current CMS addendum before treating a reference as the Medicare payment for this ZIP code. The ask is 1.5 times the reference, or $0.00 where the line looks duplicated, already inside a panel, or like a second visit level. It is the number in this letter. It is not a court judgment.\n\nPlease do not send this account to collections while this dispute is open.\n\nPrepared for the patient to send. Redline did not file this letter.\n\nSignature: ______________________________";

  const hospitalLetter = input.permission.hospital
    ? [
        `${hospital}`,
        `Billing department`,
        ``,
        `I am writing about account ${account} for ${patient}, date of service ${when}.`,
        ``,
        `Please send a full itemized bill with CPT or HCPCS codes if any charge is missing a code.`,
        ``,
        `I am asking you to reduce charges of ${formatUsd(money.billed)} to ${formatUsd(money.ask)}. That is ${formatUsd(money.savings)} off the charges.`,
        balance,
        eob,
        emergency,
        ``,
        list,
        ``,
        aid ?? "",
        ``,
        closing,
      ]
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : null;

  const insurerLetter =
    input.permission.insurer && input.payer.trim()
      ? [
          `${input.payer.trim()}`,
          `Appeals`,
          ``,
          `I am ${patient}. This is an appeal on account ${account} at ${hospital}, date of service ${when}.`,
          ``,
          `The hospital bill has lines I have asked them to remove or reprice. Please reprocess the claim after those corrections, and send the allowed amount and the patient responsibility in writing.`,
          ``,
          `Charges on the bill: ${formatUsd(money.billed)}. The ask I sent the hospital: ${formatUsd(money.ask)}.`,
          eob,
          ``,
          list,
          ``,
          closing,
        ]
          .join("\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim()
      : null;

  const assistance =
    input.permission.assistance && aid
      ? [`${hospital}`, `Financial assistance`, ``, `Account ${account} for ${patient}, date of service ${when}.`, ``, aid, ``, `Charges ${formatUsd(money.billed)}. Ask ${formatUsd(money.ask)}.`, balance, ``, closing]
          .join("\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim()
      : null;

  const short = lines
    .slice(0, 6)
    .map((line) => lineHeading(line))
    .join("; ");
  const script = input.permission.hospital
    ? [
        `Billing office for ${hospital}, account ${account}.`,
        ``,
        `I am ${patient}. I am disputing the bill for ${when}.`,
        ``,
        `Please do not send this account to collections while the dispute is open.`,
        ``,
        short ? `The lines I need removed or repriced: ${short}.` : `I am asking for a full itemized bill with codes.`,
        ``,
        `My ask is ${formatUsd(money.ask)} on charges of ${formatUsd(money.billed)}. Please email the itemized bill and the decision.`,
      ].join("\n")
    : null;

  return { hospital: hospitalLetter, insurer: insurerLetter, assistance, script };
}
