import { checkPublicPage, defaultLookup, type CheckResult } from "../../shared/fetch-check.ts";

const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const LIMIT = 12;

export function allowCheck(ip: string, now = Date.now()): boolean {
  const key = ip || "unknown";
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

function json(body: CheckResult, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function handle(req: Request, ip = "unknown"): Promise<Response> {
  if (req.method !== "POST") {
    return json(
      {
        status: "blocked",
        url: "",
        httpStatus: null,
        links: [],
        note: "Send the page URL as JSON.",
      },
      405,
    );
  }

  if (!allowCheck(ip)) {
    return json(
      {
        status: "limited",
        url: "",
        httpStatus: null,
        links: [],
        note: "Too many checks from this network. Wait a minute.",
      },
      429,
    );
  }

  const text = await req.text();
  if (text.length > 4_000) {
    return json(
      { status: "blocked", url: "", httpStatus: null, links: [], note: "Send a shorter url." },
      400,
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text) as unknown;
  } catch {
    return json(
      { status: "blocked", url: "", httpStatus: null, links: [], note: "Send a url." },
      400,
    );
  }

  const url = payload && typeof payload === "object" && "url" in payload ? payload.url : "";
  if (typeof url !== "string" || url.trim().length === 0) {
    return json(
      { status: "blocked", url: "", httpStatus: null, links: [], note: "Send a url." },
      400,
    );
  }

  const checked = await checkPublicPage(url, { fetch, lookup: defaultLookup });
  const status = checked.status === "blocked" ? 400 : 200;
  return json(checked, status);
}
