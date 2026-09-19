import { bomTotal, buildBom } from "./bom.ts";
import type { Answers, CostCompare } from "./types.ts";

/** Street estimates, not a Microsoft quote. Standard 16-core license + User CALs. */
export const WINDOWS_SERVER_STANDARD_USD = 1176;
export const WINDOWS_USER_CAL_USD = 42;

export function microsoftCost(answers: Answers): CostCompare {
  const cals = answers.peopleCount * WINDOWS_USER_CAL_USD;
  const windowsTotalUsd = WINDOWS_SERVER_STANDARD_USD + cals;
  const hardwareUsd = bomTotal(buildBom(answers));
  const notes = [
    `Windows Server 2025 Standard is listed around $${WINDOWS_SERVER_STANDARD_USD} for 16 cores. User CALs are about $${WINDOWS_USER_CAL_USD} each.`,
    "CALs are per person (or per device). Remote Desktop, Exchange, and SQL are extra. Small Business Server and Essentials are gone.",
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
