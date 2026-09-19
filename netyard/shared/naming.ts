import type { Naming } from "./types.ts";

const NETBIOS_FORBIDDEN = /[\\/:*?"<>|.\s]/g;

export function slugFromBusinessName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return slug || "shop";
}

export function suggestDomain(businessName: string): string {
  return `${slugFromBusinessName(businessName)}.lan`;
}

export function sanitizeDomain(input: string): string {
  const raw = input.trim().toLowerCase().replace(/\.local$/i, ".lan");
  const labels = raw
    .split(".")
    .map((label) => label.replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, ""))
    .filter(Boolean);
  if (labels.length === 0) return "shop.lan";
  if (labels.length === 1) labels.push("lan");
  if (labels[0]!.match(/^[0-9]/)) labels[0] = `s${labels[0]}`;
  return labels.slice(0, 3).join(".");
}

export function netbiosFromDomain(domain: string): string {
  const head = domain.split(".")[0] ?? "SHOP";
  let name = head.toUpperCase().replace(NETBIOS_FORBIDDEN, "").slice(0, 15);
  if (!name) name = "SHOP";
  if (/^[0-9]/.test(name)) name = `S${name}`.slice(0, 15);
  return name;
}

export function buildNaming(businessName: string, domainInput: string): Naming {
  const dnsDomain = sanitizeDomain(domainInput || suggestDomain(businessName));
  const netbios = netbiosFromDomain(dnsDomain);
  const dcHostname = "dc01";
  return {
    businessName: businessName.trim() || "Shop",
    dnsDomain,
    realm: dnsDomain.toUpperCase(),
    netbios,
    dcHostname,
    dcFqdn: `${dcHostname}.${dnsDomain}`,
    siteName: "Office-1",
  };
}

export function ssidBase(businessName: string): string {
  const words = businessName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  const cleaned = words.replace(/[^A-Za-z0-9]/g, "").slice(0, 16);
  return cleaned || "Shop";
}
