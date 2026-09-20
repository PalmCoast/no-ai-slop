import { needsVlans } from "./addressing.ts";
import type { Answers, BomItem } from "./types.ts";

export function apCount(people: number): number {
  return Math.max(1, Math.ceil(people / 15));
}

export function switchPorts(answers: Answers): number {
  const cameras = answers.needs.includes("cameras") ? 8 : 0;
  const printers = answers.needs.includes("printers") ? 2 : 0;
  const pos = answers.needs.includes("pos") ? 4 : 0;
  const servers = 4;
  const aps = apCount(answers.peopleCount);
  const raw = answers.peopleCount + cameras + printers + pos + servers + aps;
  return raw <= 8 ? 8 : raw <= 16 ? 16 : raw <= 24 ? 24 : 48;
}

export function buildBom(answers: Answers): BomItem[] {
  const aps = apCount(answers.peopleCount);
  const ports = switchPorts(answers);
  const items: BomItem[] = [];

  if (answers.gear === "thrifty") {
    items.push(
      { item: "Keep the ISP gateway, put it in bridge mode if it can", qty: 1, unitUsd: 0, tier: "thrifty", notes: "If it cannot VLAN, add a $60 OpenWrt box later." },
      { item: `Used gigabit switch, ${ports}-port`, qty: 1, unitUsd: ports <= 8 ? 25 : 70, tier: "thrifty", notes: "Unmanaged is fine until you need VLANs." },
      { item: "Used Wi-Fi 6 access point (UniFi U6 Lite / equivalent)", qty: aps, unitUsd: 55, tier: "thrifty", notes: "Skip mesh extenders. They split the network." },
    );
  } else if (answers.gear === "unifi") {
    items.push(
      {
        item: answers.headcount === "solo" ? "UniFi Cloud Gateway Ultra" : "UniFi Cloud Gateway Max or UDM SE",
        qty: 1,
        unitUsd: answers.headcount === "solo" ? 129 : 299,
        tier: "unifi",
        notes: "DHCP, DNS forwarder, VPN, VLAN routing in one box.",
      },
      {
        item: `UniFi Lite / Standard switch, ${Math.max(ports, 16)}-port PoE`,
        qty: 1,
        unitUsd: Math.max(ports, 16) <= 16 ? 199 : 379,
        tier: "unifi",
        notes: "PoE for APs and cameras.",
      },
      { item: "UniFi U7 Lite or U6+", qty: aps, unitUsd: 109, tier: "unifi", notes: "One AP per ~15 people, or per room with walls." },
    );
  } else {
    items.push(
      { item: "OPNsense appliance, 4 NICs (Protectli / Qotom class)", qty: 1, unitUsd: 420, tier: "opnsense", notes: "WAN, LAN, optional DMZ, optional HA later." },
      { item: `PoE switch, ${Math.max(ports, 24)}-port (UniFi or equivalent)`, qty: 1, unitUsd: 379, tier: "opnsense", notes: "Let OPNsense route; the switch only tags VLANs." },
      { item: "UniFi U7 Lite or U6+", qty: aps, unitUsd: 109, tier: "opnsense", notes: "Controller can be the UniFi Network app, not a Cloud Key." },
    );
  }

  const serverUsd = answers.headcount === "office" ? 650 : answers.headcount === "shop" ? 480 : 280;
  items.push(
    {
      item: answers.headcount === "office" ? "Dell / HP tower, 32 GB RAM, 2×1 TB SSD" : "Mini PC or used SFF, 16 GB RAM, 512 GB SSD + 1 TB SSD",
      qty: 1,
      unitUsd: serverUsd,
      tier: "any",
      notes: "Debian 12. Second disk is for /srv file data, not the OS.",
    },
    { item: "USB 3 enclosure + 4 TB drive for nightly restic", qty: 1, unitUsd: 95, tier: "any", notes: "Take it off-site once a week. Do not skip this." },
    { item: "UPS 750–1000 VA", qty: 1, unitUsd: answers.gear === "thrifty" ? 70 : 120, tier: "any", notes: "Firewall and the office server on battery, not the espresso machine." },
  );

  if (answers.needs.includes("cameras")) {
    items.push({ item: "8-channel NVR or a spare mini PC with Frigate", qty: 1, unitUsd: 180, tier: "any", notes: "Put it on the IoT VLAN. Record locally." });
  }
  if (needsVlans(answers) && answers.gear === "thrifty") {
    items.push({
      item: "OpenWrt / travel router with VLAN support (if ISP modem cannot)",
      qty: 1,
      unitUsd: 70,
      tier: "thrifty",
      notes: "Guest Wi-Fi without VLANs is a shared LAN. Do not do that.",
    });
  }
  return items;
}

export function bomTotal(items: BomItem[]): number {
  return items.reduce((sum, row) => sum + row.qty * row.unitUsd, 0);
}
