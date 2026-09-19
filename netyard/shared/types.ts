export const HEADCOUNT_BANDS = ["solo", "crew", "shop", "office"] as const;
export type HeadcountBand = (typeof HEADCOUNT_BANDS)[number];

export const NEEDS = ["files", "printers", "guestWifi", "cameras", "vpn", "pos"] as const;
export type Need = (typeof NEEDS)[number];

export const DESKTOP_MIXES = ["windows", "mac", "mixed", "chrome"] as const;
export type DesktopMix = (typeof DESKTOP_MIXES)[number];

export const SITE_SHAPES = ["one", "two", "remote"] as const;
export type SiteShape = (typeof SITE_SHAPES)[number];

export const GEAR_TIERS = ["thrifty", "unifi", "opnsense"] as const;
export type GearTier = (typeof GEAR_TIERS)[number];

export const DIRECTORY_MODES = ["none", "workgroup", "samba-ad"] as const;
export type DirectoryMode = (typeof DIRECTORY_MODES)[number];

export type Answers = {
  businessName: string;
  domain: string;
  headcount: HeadcountBand;
  peopleCount: number;
  needs: Need[];
  desktops: DesktopMix;
  sites: SiteShape;
  gear: GearTier;
};

export type Naming = {
  businessName: string;
  dnsDomain: string;
  realm: string;
  netbios: string;
  dcHostname: string;
  dcFqdn: string;
  siteName: string;
};

export type VlanNet = {
  name: string;
  purpose: string;
  vlan: number | null;
  cidr: string;
  network: string;
  prefix: number;
  gateway: string;
  dhcpStart: string | null;
  dhcpEnd: string | null;
  usable: number;
};

export type ReservedHost = {
  name: string;
  role: string;
  address: string;
  vlan: string;
  notes: string;
};

export type SharePlan = {
  name: string;
  path: string;
  group: string;
  permission: string;
  purpose: string;
};

export type DirectoryPlan = {
  mode: DirectoryMode;
  why: string;
  realm: string | null;
  adminUser: string;
  passwordPolicy: string;
  groups: string[];
};

export type FirewallRule = {
  from: string;
  to: string;
  action: "allow" | "deny";
  ports: string;
  reason: string;
};

export type VpnPlan = {
  kind: "wireguard";
  listenPort: number;
  serverAddress: string;
  peerCount: number;
  notes: string;
};

export type WifiPlan = {
  ssids: { name: string; vlan: string; security: string; notes: string }[];
  apCount: number;
};

export type BomItem = {
  item: string;
  qty: number;
  unitUsd: number;
  tier: GearTier | "any";
  notes: string;
};

export type CostCompare = {
  windowsServerLicenseUsd: number;
  windowsCalUsd: number;
  windowsTotalUsd: number;
  sambaLicenseUsd: number;
  hardwareUsd: number;
  savingsUsd: number;
  notes: string[];
};

export type RunbookStep = {
  title: string;
  detail: string;
};

export type GeneratedFile = {
  filename: string;
  mime: string;
  contents: string;
};

export type NetworkPlan = {
  answers: Answers;
  naming: Naming;
  directory: DirectoryPlan;
  networks: VlanNet[];
  hosts: ReservedHost[];
  shares: SharePlan[];
  firewall: FirewallRule[];
  vpn: VpnPlan | null;
  wifi: WifiPlan;
  bom: BomItem[];
  microsoft: CostCompare;
  runbook: RunbookStep[];
  files: GeneratedFile[];
  warnings: string[];
  summary: string;
};
