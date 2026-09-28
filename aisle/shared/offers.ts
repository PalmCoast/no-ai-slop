export const PUBLISH_CENTS = 2900;
export const PUBLISH_LABEL = "$29";
export const PUBLISH_NAME = "Publish this aisle";

export function validShopName(name: string): boolean {
  const clean = name.trim();
  if (clean.length < 2 || clean.length > 48) return false;
  if (/https?:\/\//i.test(clean)) return false;
  return true;
}

export function validQuery(query: string): boolean {
  const clean = query.trim();
  return clean.length >= 3 && clean.length <= 180;
}
