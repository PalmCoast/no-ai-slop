import { needsVlans } from "./addressing.ts";
import type { Answers, DirectoryMode, Naming, RunbookStep } from "./types.ts";

export function buildRunbook(answers: Answers, naming: Naming, mode: DirectoryMode): RunbookStep[] {
  const steps: RunbookStep[] = [
    {
      title: "Write the plan on paper",
      detail: `Print NETYARD-PLAN.md. Confirm the shop name ${naming.businessName}, internal domain ${naming.dnsDomain}, and the shopping list before you buy anything.`,
    },
    {
      title: "Rack the edge",
      detail:
        answers.gear === "opnsense"
          ? "Install OPNsense. WAN from the ISP. LAN toward the switch. Put the ISP modem in bridge mode."
          : answers.gear === "unifi"
            ? "Adopt the Cloud Gateway. ISP modem in bridge mode. Create the VLANs from networks.csv before you plug in APs."
            : "Leave the ISP box for a day if it already works. You will replace DHCP later so two DHCP servers never run at once.",
    },
    {
      title: "Switch and APs",
      detail: needsVlans(answers)
        ? "Tag Staff, Guest, IoT, POS, Servers, and Mgmt on the trunk to the firewall. APs sit on Mgmt. Each SSID uses the VLAN in the Wi-Fi table."
        : "Flat LAN is fine for a handful of PCs. If you enabled Guest, that SSID must be a different subnet or you have not isolated anyone.",
    },
    {
      title: "Office server",
      detail:
        mode === "none"
          ? "Skip Debian. Point DHCP DNS at the firewall and 1.1.1.1."
          : `Install Debian 12 on dc01. Static IP from hosts.csv. Copy install-office-server.sh. Run it as root with ADMIN_PASS set. The box becomes ${naming.dcFqdn}.`,
    },
    {
      title: "DHCP and DNS",
      detail:
        mode === "samba-ad"
          ? `Firewall DHCP for Staff/Guest/IoT/POS. Option 6 (DNS) and option 15 (domain) must be ${naming.dcFqdn}'s IP. Do not let the firewall be DNS for domain-joined PCs.`
          : "Firewall handles DHCP and DNS. Add reservations from hosts.csv.",
    },
  ];

  if (mode === "samba-ad") {
    steps.push({
      title: "Join a Windows PC",
      detail: `Set the PC DNS to dc01. System Properties → Change → Domain ${naming.realm}. Sign in as ${naming.netbios}\\Administrator once, then a real user from users.csv.`,
    });
  }
  if (answers.needs.includes("files")) {
    steps.push({
      title: "Map drives",
      detail: "Company → \\\\dc01\\Company, home → \\\\dc01\\Users\\%username%. On Macs, smb://dc01/Company with a directory account.",
    });
  }
  if (answers.needs.includes("printers")) {
    steps.push({
      title: "Printers",
      detail: "Give the printer a reservation. Add it in CUPS. Share it. Windows finds it in the directory after the next policy refresh.",
    });
  }
  if (answers.needs.includes("vpn") || answers.sites !== "one") {
    steps.push({
      title: "WireGuard",
      detail: "Install wg0.conf on the firewall, not on the DC. One key pair per laptop. Peers may reach Staff and Servers only.",
    });
  }
  steps.push(
    {
      title: "Backup",
      detail: "restic to the USB disk nightly. Restores are tested on day two, not on the day the SSD dies. Take the disk home on Friday.",
    },
    {
      title: "Handoff",
      detail: "One admin password in a password manager, one printed recovery sheet in the safe, and a named person who can restore files on Monday.",
    },
  );
  return steps;
}
