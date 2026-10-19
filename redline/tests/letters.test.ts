import { describe, expect, it } from "vitest";
import { savePermission } from "../shared/case";
import { assistanceBand, fplCents } from "../shared/fpl";
import { buildPacket } from "../shared/letters";
import { parseBill, reviewLines } from "../shared/review";
import { SAMPLE_BILL } from "../shared/sample";

const parsed = parseBill(SAMPLE_BILL);
const lines = reviewLines(parsed.lines);

const base = {
  hospital: parsed.hospital,
  patient: parsed.patient,
  account: parsed.account,
  serviceDate: parsed.serviceDate,
  payer: parsed.payer,
  lines,
  patientOwesCents: parsed.patientOwesCents,
  eobAllowedCents: null as number | null,
  permission: { patient: true, hospital: true, insurer: true, assistance: true },
  household: 1,
  incomeCents: 3_000_000,
};

describe("letters", () => {
  it("names the duplicate and leaves the supply line out", () => {
    const packet = buildPacket(base);
    expect(packet.hospital).toContain("4482190");
    expect(packet.hospital).toContain("Jordan Hale");
    expect(packet.hospital).toContain("99284");
    expect(packet.hospital?.toLowerCase()).toContain("matching");
    expect(packet.hospital).not.toContain("PHARMACY");
    expect(packet.hospital).toContain("501(r)");
    expect(packet.insurer).toContain("Northwind PPO");
    expect(packet.script).toContain("do not send this account to collections");
    expect(packet.assistance).toContain("Financial assistance");
  });

  it("writes nothing until the patient gives permission", () => {
    const packet = buildPacket({ ...base, permission: { patient: false, hospital: true, insurer: true, assistance: true } });
    expect(packet.hospital).toBeNull();
    expect(packet.insurer).toBeNull();
    expect(packet.script).toBeNull();
  });

  it("skips the insurer letter when that box is off", () => {
    const packet = buildPacket({ ...base, permission: { ...base.permission, insurer: false } });
    expect(packet.insurer).toBeNull();
    expect(packet.hospital).toContain("99284");
  });

  it("says when income is over 400 percent of the guideline", () => {
    const packet = buildPacket({ ...base, incomeCents: 20_000_000 });
    expect(packet.hospital).toContain("over 400%");
    expect(packet.hospital).not.toContain("I am asking you to apply the financial assistance policy");
  });

  it("includes an EOB allowed amount when the patient typed one", () => {
    const packet = buildPacket({ ...base, eobAllowedCents: 500_000 });
    expect(packet.hospital).toContain("$5,000.00");
  });
});

describe("poverty guideline", () => {
  it("uses the 2026 figures", () => {
    expect(fplCents(1)).toBe(1_596_000);
    expect(fplCents(9)).toBe(6_140_000);
    expect(assistanceBand(fplCents(1) * 4, 1)).toBe("qualify");
    expect(assistanceBand(fplCents(1) * 4 + 1, 1)).toBe("above");
  });
});

describe("permission", () => {
  it("refuses a packet without the patient checkbox", () => {
    const bill = {
      id: "c1",
      createdAt: "2026-04-01T00:00:00.000Z",
      hospital: "Riverside",
      patient: "Jordan Hale",
      account: "1",
      serviceDate: "03/14/2026",
      payer: "Northwind",
      billingEmail: "",
      patientOwesCents: null,
      statedTotalCents: null,
      eobAllowedCents: null,
      lines: parsed.lines,
      sourceText: "",
      sourceLabel: "paste",
      status: "review" as const,
      permission: { patient: false, hospital: false, insurer: false, assistance: false, at: null },
      household: null,
      incomeCents: null,
      securedCents: 0,
      packetAt: null,
      events: [],
    };
    expect(savePermission(bill, { patient: false, hospital: true, insurer: false, assistance: false }, null, null, bill.createdAt)).toBeNull();
    const saved = savePermission(bill, { patient: true, hospital: true, insurer: true, assistance: false }, 2, null, bill.createdAt);
    expect(saved?.status).toBe("packet");
    expect(saved?.permission.patient).toBe(true);
  });
});
