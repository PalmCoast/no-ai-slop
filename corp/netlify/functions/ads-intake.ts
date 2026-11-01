import type { Config, Context } from "@netlify/functions";
import { hiveStore } from "../lib/store.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Fields = {
  name: string;
  email: string;
  productUrl: string;
  note: string;
  honeypot: string;
};

function clip(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, max);
}

async function readFields(req: Request): Promise<Fields> {
  const contentType = req.headers.get("content-type") || "";
  const raw: Record<string, string> = {};
  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("bad-json");
    for (const [key, value] of Object.entries(body)) raw[key] = clip(value, 4000);
  } else {
    const form = await req.formData();
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") raw[key] = clip(value, 4000);
    }
  }
  return {
    name: clip(raw.name, 120),
    email: clip(raw.email, 200),
    productUrl: clip(raw.product_url || raw.productUrl, 500),
    note: clip(raw.note, 2000),
    honeypot: clip(raw["bot-field"] || raw.bot_field, 200),
  };
}

function validUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function respond(asJson: boolean, ok: boolean, error: string, status: number): Response {
  const headers = { "cache-control": "no-store" };
  if (!asJson) {
    return new Response(null, {
      status: 303,
      headers: {
        ...headers,
        location: ok ? "/ads/thanks" : "/ads?intake=error#intake",
      },
    });
  }
  return Response.json(ok ? { ok: true } : { ok: false, error }, { status, headers });
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { "cache-control": "no-store" } });
  }
  const asJson = (req.headers.get("content-type") || "").includes("application/json");
  let fields: Fields;
  try {
    fields = await readFields(req);
  } catch {
    return respond(asJson, false, "Send name, email, and a product URL.", 400);
  }
  if (fields.honeypot) return respond(asJson, true, "", 200);
  if (!fields.name || !EMAIL_RE.test(fields.email) || !validUrl(fields.productUrl)) {
    return respond(asJson, false, "Name, email, and a full product or store URL are required.", 400);
  }

  const ts = new Date().toISOString();
  const rand = Math.random().toString(36).slice(2, 8);
  const key = `ads-intake/${ts.slice(0, 10)}/${ts}_${rand}`;
  const record = {
    form: "ads-intake",
    name: fields.name,
    email: fields.email,
    productUrl: fields.productUrl,
    note: fields.note,
    ts,
    ua: (req.headers.get("user-agent") || "").slice(0, 400),
    country: context.geo?.country?.code || null,
  };
  try {
    await hiveStore().setJSON(key, record);
  } catch (error) {
    console.error("ads-intake: blob write failed", error);
    return respond(asJson, false, "Could not store that. Try again in a moment.", 500);
  }
  return respond(asJson, true, "", 200);
};

export const config: Config = {
  path: "/api/ads-intake",
  method: "POST",
};
