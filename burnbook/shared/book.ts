import { cents, formatUsd } from "./money.ts";

export const JOBS = ["coding", "support", "sales", "research", "ops", "finance", "other"] as const;

export type Job = (typeof JOBS)[number];

export const JOB_LABEL: Record<Job, string> = {
  coding: "Coding",
  support: "Support",
  sales: "Sales",
  research: "Research",
  ops: "Ops",
  finance: "Finance",
  other: "Other",
};

export type CutKind = "cancel" | "drop-seats" | "duplicate" | "rebuild" | "cap" | "keep";

export type VendorInput = {
  id: string;
  name: string;
  monthlyUsd: number;
  seats: number;
  activeSeats: number;
  job: Job;
  finishedJobs: number;
  reworkHours: number;
};

export type BookInput = {
  company: string;
  monthLabel: string;
  reworkRateUsd: number;
  vendors: VendorInput[];
};

export type Cut = {
  kind: CutKind;
  /** Dollars this action names. Vendor invoice for cancel, seats, duplicate, and cap. Labor for rebuild. */
  saveUsd: number;
  vendorSaveUsd: number;
  laborSaveUsd: number;
  line: string;
};

export type VendorResult = {
  id: string;
  name: string;
  job: Job;
  monthlyUsd: number;
  seats: number;
  activeSeats: number;
  idleSeats: number;
  idleWasteUsd: number;
  finishedJobs: number;
  costPerJobUsd: number | null;
  reworkHours: number;
  reworkUsd: number;
  cut: Cut;
};

export type BookResult = {
  company: string;
  monthLabel: string;
  reworkRateUsd: number;
  vendors: VendorResult[];
  burnUsd: number;
  idleWasteUsd: number;
  reworkUsd: number;
  vendorSaveUsd: number;
  laborSaveUsd: number;
  keepUsd: number;
  vendorRunRateUsd: number;
  laborRunRateUsd: number;
};

export function isJob(value: string): value is Job {
  return (JOBS as readonly string[]).includes(value);
}

export function isBlank(vendor: VendorInput): boolean {
  return (
    vendor.name.trim() === "" &&
    !(vendor.monthlyUsd > 0) &&
    !(vendor.seats > 0) &&
    !(vendor.activeSeats > 0) &&
    !(vendor.finishedJobs > 0) &&
    !(vendor.reworkHours > 0)
  );
}

export function blankVendor(id: string): VendorInput {
  return {
    id,
    name: "",
    monthlyUsd: 0,
    seats: 0,
    activeSeats: 0,
    job: "other",
    finishedJobs: 0,
    reworkHours: 0,
  };
}

function cleanVendor(vendor: VendorInput): VendorInput {
  const seats = Math.max(0, Math.floor(vendor.seats));
  const activeSeats = Math.min(seats, Math.max(0, Math.floor(vendor.activeSeats)));
  return {
    id: vendor.id.trim() || "vendor",
    name: vendor.name.trim() || "Untitled vendor",
    monthlyUsd: cents(Math.max(0, vendor.monthlyUsd)),
    seats,
    activeSeats,
    job: isJob(vendor.job) ? vendor.job : "other",
    finishedJobs: Math.max(0, Math.floor(vendor.finishedJobs)),
    reworkHours: cents(Math.max(0, vendor.reworkHours)),
  };
}

function uniqueIds(vendors: VendorInput[]): VendorInput[] {
  const counts = new Map<string, number>();
  return vendors.map((vendor) => {
    const base = vendor.id.trim() || "vendor";
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    return { ...vendor, id: seen === 0 ? base : `${base}-${seen + 1}` };
  });
}

function compareKeeper(a: VendorInput, b: VendorInput, order: VendorInput[]): number {
  const aDone = a.finishedJobs > 0 ? 0 : 1;
  const bDone = b.finishedJobs > 0 ? 0 : 1;
  if (aDone !== bDone) return aDone - bDone;
  const aCost = a.finishedJobs > 0 ? a.monthlyUsd / a.finishedJobs : Number.POSITIVE_INFINITY;
  const bCost = b.finishedJobs > 0 ? b.monthlyUsd / b.finishedJobs : Number.POSITIVE_INFINITY;
  if (aCost !== bCost) return aCost - bCost;
  if (a.finishedJobs !== b.finishedJobs) return b.finishedJobs - a.finishedJobs;
  if (a.monthlyUsd !== b.monthlyUsd) return a.monthlyUsd - b.monthlyUsd;
  return order.findIndex((item) => item.id === a.id) - order.findIndex((item) => item.id === b.id);
}

function perJob(vendor: VendorInput): string | null {
  if (vendor.finishedJobs <= 0) return null;
  return formatUsd(vendor.monthlyUsd / vendor.finishedJobs);
}

function duplicateLine(loser: VendorInput, keeper: VendorInput): string {
  const keeperCost = perJob(keeper);
  const loserCost = perJob(loser);
  const bill = formatUsd(loser.monthlyUsd);
  if (keeperCost && loserCost) {
    return `Cancel ${loser.name}. ${keeper.name} already covers ${loser.job} at ${keeperCost} a finished job. ${loser.name} is ${loserCost}. Monthly bill to stop: ${bill}.`;
  }
  if (keeperCost) {
    return `Cancel ${loser.name}. ${keeper.name} finished jobs in ${loser.job} at ${keeperCost} each. ${loser.name} finished none. Monthly bill to stop: ${bill}.`;
  }
  return `Cancel ${loser.name}. ${keeper.name} is the lower bill for ${loser.job}. Monthly bill to stop: ${bill}.`;
}

function cutFor(vendor: VendorInput, keeper: VendorInput | undefined, reworkRateUsd: number, reworkUsd: number, idleWasteUsd: number): Cut {
  const bill = formatUsd(vendor.monthlyUsd);
  if (vendor.monthlyUsd > 0 && vendor.finishedJobs === 0 && vendor.activeSeats === 0) {
    return {
      kind: "cancel",
      saveUsd: vendor.monthlyUsd,
      vendorSaveUsd: vendor.monthlyUsd,
      laborSaveUsd: 0,
      line: `${vendor.name} finished nothing this month and no seat was active. Cancel it. Monthly bill to stop: ${bill}.`,
    };
  }
  if (keeper && vendor.monthlyUsd > 0) {
    return {
      kind: "duplicate",
      saveUsd: vendor.monthlyUsd,
      vendorSaveUsd: vendor.monthlyUsd,
      laborSaveUsd: 0,
      line: duplicateLine(vendor, keeper),
    };
  }
  if (vendor.seats >= 1 && idleWasteUsd >= 100) {
    return {
      kind: "drop-seats",
      saveUsd: idleWasteUsd,
      vendorSaveUsd: idleWasteUsd,
      laborSaveUsd: 0,
      line: `Drop ${vendor.name} from ${vendor.seats} seats to ${vendor.activeSeats}. ${vendor.seats - vendor.activeSeats} seats were idle. Monthly dollars on those seats: ${formatUsd(idleWasteUsd)}.`,
    };
  }
  if (reworkUsd >= 100 && vendor.monthlyUsd > 0 && reworkUsd >= cents(vendor.monthlyUsd * 0.25)) {
    return {
      kind: "rebuild",
      saveUsd: reworkUsd,
      vendorSaveUsd: 0,
      laborSaveUsd: reworkUsd,
      line: `${vendor.name} finished ${vendor.finishedJobs} jobs. Rework on them cost ${formatUsd(reworkUsd)} at ${formatUsd(reworkRateUsd)} an hour, against a ${bill} bill. Rebuild the flow before adding budget.`,
    };
  }
  if (vendor.finishedJobs === 0 && vendor.monthlyUsd >= 200 && vendor.activeSeats > 0) {
    const half = cents(vendor.monthlyUsd * 0.5);
    return {
      kind: "cap",
      saveUsd: half,
      vendorSaveUsd: half,
      laborSaveUsd: 0,
      line: `${vendor.name} has an active seat and finished nothing. Hold next month to ${formatUsd(half)}, half of ${bill}, and review if a job gets finished.`,
    };
  }
  return {
    kind: "keep",
    saveUsd: 0,
    vendorSaveUsd: 0,
    laborSaveUsd: 0,
    line: `Keep ${vendor.name}. Nothing on this row cleared a cut.`,
  };
}

export function runBook(input: BookInput): BookResult {
  const company = input.company.trim() || "Your company";
  const monthLabel = input.monthLabel.trim() || "This month";
  const reworkRateUsd = cents(Math.max(0, Number.isFinite(input.reworkRateUsd) ? input.reworkRateUsd : 0));
  const prepared = uniqueIds(
    input.vendors.filter((vendor) => !isBlank(vendor)).map((vendor) => cleanVendor(vendor)),
  );

  const priced = prepared.filter((vendor) => vendor.monthlyUsd > 0);
  const byJob = new Map<Job, VendorInput[]>();
  for (const vendor of priced) {
    const group = byJob.get(vendor.job) ?? [];
    group.push(vendor);
    byJob.set(vendor.job, group);
  }
  const keeperOf = new Map<string, VendorInput>();
  for (const group of byJob.values()) {
    if (group.length < 2) continue;
    const ranked = [...group].sort((a, b) => compareKeeper(a, b, prepared));
    const keeper = ranked[0];
    for (const loser of ranked.slice(1)) keeperOf.set(loser.id, keeper);
  }

  const vendors: VendorResult[] = prepared.map((vendor) => {
    const idleSeats = Math.max(0, vendor.seats - vendor.activeSeats);
    const idleWasteUsd = vendor.seats >= 1 ? cents((idleSeats / vendor.seats) * vendor.monthlyUsd) : 0;
    const reworkUsd = cents(vendor.reworkHours * reworkRateUsd);
    const costPerJobUsd = vendor.finishedJobs > 0 ? cents(vendor.monthlyUsd / vendor.finishedJobs) : null;
    return {
      id: vendor.id,
      name: vendor.name,
      job: vendor.job,
      monthlyUsd: vendor.monthlyUsd,
      seats: vendor.seats,
      activeSeats: vendor.activeSeats,
      idleSeats,
      idleWasteUsd,
      finishedJobs: vendor.finishedJobs,
      costPerJobUsd,
      reworkHours: vendor.reworkHours,
      reworkUsd,
      cut: cutFor(vendor, keeperOf.get(vendor.id), reworkRateUsd, reworkUsd, idleWasteUsd),
    };
  });

  const burnUsd = cents(vendors.reduce((sum, vendor) => sum + vendor.monthlyUsd, 0));
  const idleWasteUsd = cents(vendors.reduce((sum, vendor) => sum + vendor.idleWasteUsd, 0));
  const reworkUsd = cents(vendors.reduce((sum, vendor) => sum + vendor.reworkUsd, 0));
  const vendorSaveUsd = cents(vendors.reduce((sum, vendor) => sum + vendor.cut.vendorSaveUsd, 0));
  const laborSaveUsd = cents(vendors.reduce((sum, vendor) => sum + vendor.cut.laborSaveUsd, 0));

  return {
    company,
    monthLabel,
    reworkRateUsd,
    vendors,
    burnUsd,
    idleWasteUsd,
    reworkUsd,
    vendorSaveUsd,
    laborSaveUsd,
    keepUsd: cents(burnUsd - vendorSaveUsd),
    vendorRunRateUsd: cents(vendorSaveUsd * 12),
    laborRunRateUsd: cents(laborSaveUsd * 12),
  };
}
