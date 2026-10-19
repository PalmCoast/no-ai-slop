import { bomTotal, buildBom } from "./bom.ts";
import type { Answers, CostCompare } from "./types.ts";

/**
 * Published list prices, not a quote (checked Oct 19, 2026).
 * Standard: Microsoft's Windows Server 2025 pricing page, suggested MSRP for 16 core licenses.
 * User CAL: a reseller's published US list price (o365hq.com, one-time, commercial). Microsoft's pricing page lists no CAL price.
 * Keep in step with /windows-server-cal-math (shared/comparePages.ts).
 */
export const WINDOWS_PRICES_CHECKED = "October 19, 2026";
export const WINDOWS_SERVER_STANDARD_USD = 1176;
export const WINDOWS_USER_CAL_USD = 50;

export function microsoftCost(answers: Answers): CostCompare {
  const cals = answers.peopleCount * WINDOWS_USER_CAL_USD;
  const windowsTotalUsd = WINDOWS_SERVER_STANDARD_USD + cals;
  const hardwareUsd = bomTotal(buildBom(answers));
  const notes = [
    `Windows Server 2025 Standard: $${WINDOWS_SERVER_STANDARD_USD} suggested MSRP for 16 cores (Microsoft pricing page). User CAL: $${WINDOWS_USER_CAL_USD} each, a reseller's published list price (o365hq.com). Both checked ${WINDOWS_PRICES_CHECKED}; not a quote.`,
    "CALs are per person (or per device). Remote Desktop, Exchange, and SQL are extra. Windows Server 2025 Essentials (OEM only, up to 25 users / 50 devices) needs no base CAL, per Microsoft's 2025 licensing guide.",
    "Samba AD on Debian has no CAL. You still buy hardware, UPS, and disks. Email stays on Google Workspace or Microsoft 365 — do not self-host mail.",
    "If every PC is a Chromebook and files live in Drive, skip the office server and keep the Wi-Fi plan.",
  ];
  return {
    windowsServerLicenseUsd: WINDOWS_SERVER_STANDARD_USD,
    windowsCalUsd: cals,
    windowsTotalUsd,
    sambaLicenseUsd: 0,
    hardwareUsd,
    savingsUsd: windowsTotalUsd,
    notes,
  };
}
