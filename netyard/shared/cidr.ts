export type CidrInfo = {
  cidr: string;
  network: string;
  broadcast: string;
  prefix: number;
  mask: string;
  wildcard: string;
  gateway: string;
  firstUsable: string;
  lastUsable: string;
  dhcpStart: string;
  dhcpEnd: string;
  usable: number;
  total: number;
};

function ipToInt(ip: string): number {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }
  return ((parts[0]! << 24) >>> 0) + (parts[1]! << 16) + (parts[2]! << 8) + parts[3]!;
}

function intToIp(value: number): string {
  const n = value >>> 0;
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

export function parseCidr(cidr: string): { networkInt: number; prefix: number } {
  const [ip, prefixRaw] = cidr.split("/");
  const prefix = Number(prefixRaw);
  if (!ip || !Number.isInteger(prefix) || prefix < 8 || prefix > 30) {
    throw new Error(`Invalid CIDR: ${cidr}`);
  }
  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return { networkInt: (ipInt & mask) >>> 0, prefix };
}

export function maskFromPrefix(prefix: number): string {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return intToIp(mask);
}

export function describeCidr(cidr: string): CidrInfo {
  const { networkInt, prefix } = parseCidr(cidr);
  const hostBits = 32 - prefix;
  const total = 2 ** hostBits;
  const usable = Math.max(total - 2, 0);
  const broadcastInt = networkInt + total - 1;
  const firstUsableInt = networkInt + 1;
  const lastUsableInt = broadcastInt - 1;
  const gatewayInt = firstUsableInt;
  const reservedEnd = Math.min(networkInt + 49, lastUsableInt - 20);
  const dhcpStartInt = Math.min(reservedEnd + 1, lastUsableInt);
  const dhcpEndInt = Math.max(dhcpStartInt, lastUsableInt - 5);
  return {
    cidr: `${intToIp(networkInt)}/${prefix}`,
    network: intToIp(networkInt),
    broadcast: intToIp(broadcastInt),
    prefix,
    mask: maskFromPrefix(prefix),
    wildcard: intToIp((~ipToInt(maskFromPrefix(prefix))) >>> 0),
    gateway: intToIp(gatewayInt),
    firstUsable: intToIp(firstUsableInt),
    lastUsable: intToIp(lastUsableInt),
    dhcpStart: intToIp(dhcpStartInt),
    dhcpEnd: intToIp(dhcpEndInt),
    usable,
    total,
  };
}

export function offsetAddress(network: string, offset: number): string {
  return intToIp(ipToInt(network) + offset);
}

export function inRange(ip: string, start: string, end: string): boolean {
  const n = ipToInt(ip);
  return n >= ipToInt(start) && n <= ipToInt(end);
}
