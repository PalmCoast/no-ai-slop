import { needsVlans } from "./addressing.ts";
import type { Answers, FirewallRule, Naming, VpnPlan, WifiPlan } from "./types.ts";
import { ssidBase } from "./naming.ts";

export function buildFirewall(answers: Answers): FirewallRule[] {
  const rules: FirewallRule[] = [
    { from: "WAN", to: "any LAN", action: "deny", ports: "all", reason: "No inbound from the internet unless you later publish WireGuard." },
    { from: "Staff", to: "WAN", action: "allow", ports: "80, 443, 53, 123", reason: "Browsing, DNS, time." },
    { from: "Staff", to: "Servers", action: "allow", ports: "53, 88, 135, 139, 389, 445, 464, 636, 3268, 3269", reason: "DNS, Kerberos, LDAP, SMB for domain join and files." },
  ];

  if (answers.needs.includes("guestWifi")) {
    rules.push(
      { from: "Guest", to: "WAN", action: "allow", ports: "80, 443, 53", reason: "Visitors get internet, not the shop." },
      { from: "Guest", to: "Staff", action: "deny", ports: "all", reason: "Guest cannot see PCs or printers." },
      { from: "Guest", to: "Servers", action: "deny", ports: "all", reason: "Guest cannot reach the directory or files." },
    );
  }

  if (answers.needs.includes("cameras")) {
    rules.push(
      { from: "IoT", to: "WAN", action: "deny", ports: "all", reason: "Cameras stay local. Allow 123/NTP only if the NVR needs it." },
      { from: "IoT", to: "Staff", action: "deny", ports: "all", reason: "Cameras do not initiate to PCs." },
      { from: "Staff", to: "IoT", action: "allow", ports: "80, 443, 554, 8000, 37777", reason: "View the NVR. Lock this to the Office group if the firewall can." },
    );
  }

  if (answers.needs.includes("pos")) {
    rules.push(
      { from: "POS", to: "WAN", action: "allow", ports: "443", reason: "Processor and gateway only. Pin destinations if you have them." },
      { from: "POS", to: "Staff", action: "deny", ports: "all", reason: "Card gear does not talk to office PCs." },
      { from: "POS", to: "Servers", action: "deny", ports: "all", reason: "Keep card data off the file server." },
    );
  }

  rules.push({
    from: "Mgmt",
    to: "WAN",
    action: "deny",
    ports: "all",
    reason: "Switches and APs do not browse the web. Allow vendor update hosts later if you must.",
  });

  if (!needsVlans(answers) && answers.needs.includes("guestWifi")) {
    return rules.filter((rule) => ["WAN", "Staff", "Guest"].some((zone) => rule.from.startsWith(zone) || rule.to.includes(zone)));
  }
  return rules;
}

export function buildVpn(answers: Answers): VpnPlan | null {
  const wanted = answers.needs.includes("vpn") || answers.sites !== "one";
  if (!wanted) return null;
  const peerCount =
    answers.sites === "two" ? Math.max(2, Math.ceil(answers.peopleCount / 8)) : Math.min(answers.peopleCount, 12);
  return {
    kind: "wireguard",
    listenPort: 51820,
    serverAddress: "10.10.80.1/24",
    peerCount,
    notes:
      answers.sites === "two"
        ? "Site-to-site tunnel between the two firewalls, plus a user profile for anyone who travels."
        : "User VPN on the firewall. Peers land in 10.10.80.0/24 and may reach Staff and Servers, not Guest or POS.",
  };
}

export function buildWifi(answers: Answers, naming: Naming): WifiPlan {
  const base = ssidBase(naming.businessName);
  const ssids = [
    {
      name: `${base}`,
      vlan: "Staff",
      security: "WPA2/WPA3-Enterprise if Samba AD, else WPA3-Personal",
      notes: "Staff laptops and phones.",
    },
  ];
  if (answers.needs.includes("guestWifi")) {
    ssids.push({
      name: `${base}-Guest`,
      vlan: "Guest",
      security: "WPA2-Personal, client isolation on, daily password OK",
      notes: "No access to Staff, Servers, printers, or cameras.",
    });
  }
  if (answers.needs.includes("cameras")) {
    ssids.push({
      name: `${base}-IoT`,
      vlan: "IoT",
      security: "WPA2-Personal, hidden SSID optional",
      notes: "Cameras and plugs only. Do not put phones here.",
    });
  }
  const apCount = Math.max(1, Math.ceil(answers.peopleCount / 15));
  return { ssids, apCount };
}
