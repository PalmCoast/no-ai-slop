import { buildNaming, suggestDomain } from "./naming.ts";
import type { Answers, DesktopMix, GearTier, HeadcountBand, Need, SiteShape } from "./types.ts";
import { DESKTOP_MIXES, GEAR_TIERS, HEADCOUNT_BANDS, NEEDS, SITE_SHAPES } from "./types.ts";

export const HEADCOUNT_META: Record<
  HeadcountBand,
  { label: string; range: string; defaultPeople: number; min: number; max: number }
> = {
  solo: { label: "1–8 people", range: "Desk, truck, or one room", defaultPeople: 4, min: 1, max: 8 },
  crew: { label: "9–20 people", range: "Small shop or office", defaultPeople: 12, min: 9, max: 20 },
  shop: { label: "21–40 people", range: "Busy floor plus office", defaultPeople: 28, min: 21, max: 40 },
  office: { label: "41–80 people", range: "Two rooms or a small building", defaultPeople: 50, min: 41, max: 80 },
};

export const NEED_META: Record<Need, { label: string; hint: string }> = {
  files: { label: "Shared files", hint: "Company drive, scans, job folders" },
  printers: { label: "Shared printers", hint: "One queue, not USB on someone's desk" },
  guestWifi: { label: "Guest Wi-Fi", hint: "Customers and vendors stay off staff PCs" },
  cameras: { label: "Cameras / IoT", hint: "NVR, thermostats, doorbells isolated" },
  vpn: { label: "Remote access", hint: "Work from home or a second truck laptop" },
  pos: { label: "Card / POS", hint: "Keep payment gear off the staff VLAN" },
};

export const DESKTOP_META: Record<DesktopMix, { label: string; hint: string }> = {
  windows: { label: "Windows PCs", hint: "They can join a Samba domain" },
  mac: { label: "Mostly Macs", hint: "Kerberos + file shares, no Windows GPO" },
  mixed: { label: "Windows and Mac", hint: "Domain join the PCs, bind the Macs" },
  chrome: { label: "Chromebooks / iPads", hint: "You may not need a directory at all" },
};

export const SITE_META: Record<SiteShape, { label: string; hint: string }> = {
  one: { label: "One shop", hint: "Single public IP, one firewall" },
  two: { label: "Two sites", hint: "WireGuard between the shops" },
  remote: { label: "People work from home", hint: "User VPN back to the office" },
};

export const GEAR_META: Record<GearTier, { label: string; hint: string }> = {
  thrifty: { label: "Thrifty", hint: "Keep the ISP modem, add a used mini PC" },
  unifi: { label: "UniFi", hint: "Cloud Gateway + PoE switch + APs" },
  opnsense: { label: "Business firewall", hint: "OPNsense on a 4-NIC box, UniFi for Wi-Fi" },
};

export const DEMO_ANSWERS: Answers = {
  businessName: "Coastal Plumbing",
  domain: "coastalplumbing.lan",
  headcount: "crew",
  peopleCount: 12,
  needs: ["files", "printers", "guestWifi", "vpn"],
  desktops: "windows",
  sites: "one",
  gear: "unifi",
};

export function defaultAnswers(): Answers {
  return {
    businessName: "",
    domain: "",
    headcount: "crew",
    peopleCount: HEADCOUNT_META.crew.defaultPeople,
    needs: ["files", "guestWifi"],
    desktops: "windows",
    sites: "one",
    gear: "unifi",
  };
}

export function clampPeople(band: HeadcountBand, people: number): number {
  const meta = HEADCOUNT_META[band];
  if (!Number.isFinite(people)) return meta.defaultPeople;
  return Math.min(meta.max, Math.max(meta.min, Math.round(people)));
}

export function withBusinessName(answers: Answers, businessName: string): Answers {
  const next = businessName.slice(0, 48);
  const auto = !answers.domain || answers.domain === suggestDomain(answers.businessName);
  return {
    ...answers,
    businessName: next,
    domain: auto ? suggestDomain(next) : answers.domain,
  };
}

export function isNeed(value: string): value is Need {
  return (NEEDS as readonly string[]).includes(value);
}

export function isBand(value: string): value is HeadcountBand {
  return (HEADCOUNT_BANDS as readonly string[]).includes(value);
}

export function isDesktop(value: string): value is DesktopMix {
  return (DESKTOP_MIXES as readonly string[]).includes(value);
}

export function isSite(value: string): value is SiteShape {
  return (SITE_SHAPES as readonly string[]).includes(value);
}

export function isGear(value: string): value is GearTier {
  return (GEAR_TIERS as readonly string[]).includes(value);
}

export function validateAnswers(answers: Answers): string[] {
  const errors: string[] = [];
  if (answers.businessName.trim().length < 2) errors.push("Give the shop a name.");
  const naming = buildNaming(answers.businessName, answers.domain);
  if (!naming.dnsDomain.includes(".")) errors.push("Internal domain needs a suffix such as .lan.");
  if (naming.netbios.length < 1 || naming.netbios.length > 15) errors.push("NetBIOS name must be 1–15 characters.");
  if (answers.needs.length === 0) errors.push("Pick at least one job the network has to do.");
  return errors;
}
