/**
 * 2026 HHS poverty guidelines, 48 contiguous states and DC.
 * Federal Register, Jan 15, 2026 (2026-00755). Alaska and Hawaii are higher.
 */
const FPL_2026_DOLLARS = [0, 15960, 21640, 27320, 33000, 38680, 44360, 50040, 55720];
const EXTRA_DOLLARS = 5680;

export const FPL_YEAR = 2026;
export const FPL_SOURCE = "2026 HHS poverty guidelines, 48 contiguous states and the District of Columbia.";

export function fplCents(household: number): number {
  const n = Math.max(1, Math.min(20, Math.floor(household)));
  const dollars = n <= 8 ? FPL_2026_DOLLARS[n] : FPL_2026_DOLLARS[8] + (n - 8) * EXTRA_DOLLARS;
  return dollars * 100;
}

export function assistanceBand(incomeCents: number, household: number): "qualify" | "above" {
  return incomeCents <= fplCents(household) * 4 ? "qualify" : "above";
}

export function fplPercent(incomeCents: number, household: number): number {
  const line = fplCents(household);
  if (line <= 0) return 0;
  return Math.round((incomeCents / line) * 100);
}
