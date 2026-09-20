import { buildHosts, buildNetworks, needsVlans } from "./addressing.ts";
import { bomTotal, buildBom } from "./bom.ts";
import { buildFiles } from "./configs.ts";
import { buildDirectory, buildShares } from "./directory.ts";
import { buildFirewall, buildVpn, buildWifi } from "./firewall.ts";
import { microsoftCost } from "./microsoft.ts";
import { buildNaming } from "./naming.ts";
import { clampPeople, validateAnswers } from "./questions.ts";
import { buildRunbook } from "./runbook.ts";
import type { Answers, NetworkPlan } from "./types.ts";

export function generatePlan(raw: Answers): NetworkPlan {
  const answers: Answers = {
    ...raw,
    businessName: raw.businessName.trim(),
    peopleCount: clampPeople(raw.headcount, raw.peopleCount),
    needs: [...new Set(raw.needs)],
  };
  const errors = validateAnswers(answers);
  if (errors.length) {
    throw new Error(errors.join(" "));
  }

  const naming = buildNaming(answers.businessName, answers.domain);
  const directory = buildDirectory(answers, naming);
  const networks = buildNetworks(answers);
  const hosts = buildHosts(answers, networks);
  const shares = buildShares(answers, naming);
  const firewall = buildFirewall(answers);
  const vpn = buildVpn(answers);
  const wifi = buildWifi(answers, naming);
  const bom = buildBom(answers);
  const microsoft = microsoftCost(answers);
  const runbook = buildRunbook(answers, naming, directory.mode);
  const warnings = buildWarnings(answers, directory.mode);

  const summary = summarize(answers, naming, directory.mode, microsoft.savingsUsd, bomTotal(bom));

  const plan: NetworkPlan = {
    answers,
    naming,
    directory,
    networks,
    hosts,
    shares,
    firewall,
    vpn,
    wifi,
    bom,
    microsoft,
    runbook,
    files: [],
    warnings,
    summary,
  };
  plan.files = buildFiles(plan);
  return plan;
}

function summarize(
  answers: Answers,
  naming: { dnsDomain: string; realm: string },
  mode: string,
  savings: number,
  hardware: number,
): string {
  const vlan = needsVlans(answers) ? "VLAN-segmented" : "single-LAN";
  const dir =
    mode === "samba-ad"
      ? `Samba AD at ${naming.realm}`
      : mode === "workgroup"
        ? `Samba workgroup on ${naming.dnsDomain}`
        : `no local directory on ${naming.dnsDomain}`;
  return `${answers.peopleCount}-person ${vlan} shop with ${dir}. Hardware about $${hardware}. You skip about $${savings} in Windows Server licenses and CALs.`;
}

function buildWarnings(answers: Answers, mode: string): string[] {
  const warnings: string[] = [
    "Do not expose SMB, RDP, or the directory to the internet. VPN only.",
    ".local is mDNS. NetYard uses .lan on purpose.",
    "Email stays in Google Workspace or Microsoft 365. This plan does not replace Exchange.",
  ];
  if (mode === "samba-ad") {
    warnings.push("Samba AD is not a full Group Policy clone. It joins PCs, holds accounts, and serves files. That is the job.");
  }
  if (answers.gear === "thrifty" && needsVlans(answers)) {
    warnings.push("Consumer ISP gateways often cannot do VLANs. Budget the OpenWrt row or step up to UniFi.");
  }
  if (answers.needs.includes("pos")) {
    warnings.push("PCI is the processor's problem if card data never hits your file server. Keep POS on its own VLAN.");
  }
  if (answers.headcount === "office") {
    warnings.push("At 40+ people, put file data on a second box and keep dc01 as directory + DNS only.");
  }
  if (answers.sites === "two") {
    warnings.push("Give each site its own /24 inside 10.10.0.0/16 so DHCP never overlaps.");
  }
  return warnings;
}
