import type { RawLine } from "../shared/review";

async function send<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await response.json().catch(() => null)) as (T & { message?: string }) | null;
  if (!response.ok) throw new Error(data?.message || "Request failed.");
  return data as T;
}

export type Offer = {
  priceCents: number;
  priceLabel: string;
  demo: boolean;
  seller: string;
};

export function getOffer(): Promise<Offer> {
  return send<Offer>("/api/offer");
}

export function startCheckout(email: string): Promise<{ demo: boolean; url?: string; licenseKey?: string; message?: string }> {
  return send("/api/checkout", { email: email || undefined });
}

export function confirmSession(sessionId: string): Promise<{ licenseKey: string }> {
  return send("/api/confirm", { sessionId });
}

export function restorePass(email: string): Promise<{ licenseKey: string }> {
  return send("/api/restore", { email });
}

export function checkLicense(key: string): Promise<{ valid: boolean; demo?: boolean }> {
  return send("/api/license", { key });
}

export function readWithModel(text: string): Promise<{ lines: RawLine[] }> {
  return send("/api/read", { text });
}
