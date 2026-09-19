import { describeCidr, offsetAddress } from "./cidr.ts";
import type { Answers, ReservedHost, VlanNet } from "./types.ts";

export function needsVlans(answers: Answers): boolean {
  const extra = answers.needs.some((need) => need === "guestWifi" || need === "cameras" || need === "pos");
  return extra || answers.headcount !== "solo" || answers.gear !== "thrifty";
}

export function buildNetworks(answers: Answers): VlanNet[] {
  const vlan = needsVlans(answers);
  const nets: VlanNet[] = [];

  if (!vlan) {
    nets.push(net("Staff", "PCs, phones, printers", null, "192.168.10.0/24"));
    if (answers.needs.includes("guestWifi")) {
      nets.push(net("Guest", "Internet only for visitors", null, "192.168.30.0/24"));
    }
    return nets;
  }

  nets.push(net("Staff", "Trusted PCs and phones", 10, "10.10.10.0/24"));
  nets.push(net("Servers", "Directory, files, print, backup", 20, "10.10.20.0/24"));
  if (answers.needs.includes("guestWifi")) {
    nets.push(net("Guest", "Customer and vendor Wi-Fi, internet only", 30, "10.10.30.0/24"));
  }
  if (answers.needs.includes("cameras")) {
    nets.push(net("IoT", "Cameras, NVR, thermostats", 40, "10.10.40.0/24"));
  }
  if (answers.needs.includes("pos")) {
    nets.push(net("POS", "Card terminals isolated from staff PCs", 50, "10.10.50.0/24"));
  }
  nets.push(net("Mgmt", "Firewall, switches, APs, ILO/IPMI", 90, "10.10.90.0/24", { dhcp: false }));
  return nets;
}

function net(
  name: string,
  purpose: string,
  vlan: number | null,
  cidr: string,
  opts: { dhcp?: boolean } = {},
): VlanNet {
  const info = describeCidr(cidr);
  const dhcp = opts.dhcp !== false && name !== "Mgmt" && name !== "Servers";
  const serverDhcp = name === "Servers" ? false : dhcp;
  return {
    name,
    purpose,
    vlan,
    cidr: info.cidr,
    network: info.network,
    prefix: info.prefix,
    gateway: info.gateway,
    dhcpStart: serverDhcp ? info.dhcpStart : null,
    dhcpEnd: serverDhcp ? info.dhcpEnd : null,
    usable: info.usable,
  };
}

export function buildHosts(answers: Answers, networks: VlanNet[]): ReservedHost[] {
  const hosts: ReservedHost[] = [];
  const staff = networks.find((n) => n.name === "Staff");
  const servers = networks.find((n) => n.name === "Servers") ?? staff;
  const mgmt = networks.find((n) => n.name === "Mgmt");
  const iot = networks.find((n) => n.name === "IoT");
  if (!staff || !servers) return hosts;

  hosts.push({
    name: "firewall",
    role: "Edge / DHCP / VPN",
    address: staff.gateway,
    vlan: label(staff),
    notes: "Default gateway on every VLAN (.1)",
  });

  const directory = answers.desktops === "chrome" && !answers.needs.includes("files") ? false : true;
  if (directory) {
    hosts.push({
      name: "dc01",
      role: answers.desktops === "windows" || answers.desktops === "mixed" ? "Samba AD DC + DNS" : "Linux file/DNS box",
      address: offsetAddress(servers.network, 10),
      vlan: label(servers),
      notes: "NTP source for the shop. Do not give it a public IP.",
    });
  }

  if (answers.needs.includes("files") && answers.headcount !== "solo") {
    hosts.push({
      name: "files01",
      role: "File share (same box as dc01 under 20 people)",
      address: offsetAddress(servers.network, 10),
      vlan: label(servers),
      notes: answers.headcount === "office" ? "Split this onto a second Debian box." : "Same host as dc01 until the shop grows.",
    });
  }

  if (answers.needs.includes("printers")) {
    hosts.push({
      name: "printer01",
      role: "Main printer",
      address: offsetAddress(staff.network, 20),
      vlan: label(staff),
      notes: "DHCP reservation. CUPS publishes the queue.",
    });
  }

  if (iot) {
    hosts.push({
      name: "nvr01",
      role: "Camera recorder",
      address: offsetAddress(iot.network, 10),
      vlan: label(iot),
      notes: "No path to staff file shares. View through the NVR UI on Staff.",
    });
  }

  if (mgmt) {
    hosts.push({
      name: "switch01",
      role: "Core switch",
      address: offsetAddress(mgmt.network, 2),
      vlan: label(mgmt),
      notes: "Management VLAN only.",
    });
    hosts.push({
      name: "ap01",
      role: "First access point",
      address: offsetAddress(mgmt.network, 10),
      vlan: label(mgmt),
      notes: "APs live on Mgmt; SSIDs tag Staff/Guest/IoT.",
    });
  }

  return hosts;
}

function label(net: VlanNet): string {
  return net.vlan ? `VLAN ${net.vlan} ${net.name}` : net.name;
}
