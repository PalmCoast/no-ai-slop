export type Claim = {
  shopName: string;
  query: string;
  demo: boolean;
  at: string;
};

const KEY = "aisle-claims";

export function readClaims(): Claim[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Claim[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveClaim(claim: Claim) {
  const next = readClaims().filter((item) => item.query !== claim.query || item.shopName !== claim.shopName);
  next.unshift(claim);
  localStorage.setItem(KEY, JSON.stringify(next.slice(0, 20)));
}

export function claimFor(query: string, shopName: string): Claim | null {
  return readClaims().find((item) => item.query === query && item.shopName === shopName) ?? null;
}
