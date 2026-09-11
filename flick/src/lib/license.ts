import { isPlausibleLicense, normalizeKey } from "../../shared/license";

const LICENSE_KEY = "flick_license";

export function getLicense(): string | null {
  try {
    const key = normalizeKey(localStorage.getItem(LICENSE_KEY));
    return isPlausibleLicense(key) ? key : null;
  } catch {
    return null;
  }
}

export function setLicense(raw: string): string {
  const key = normalizeKey(raw);
  localStorage.setItem(LICENSE_KEY, key);
  return key;
}

export function clearLicense(): void {
  localStorage.removeItem(LICENSE_KEY);
}
