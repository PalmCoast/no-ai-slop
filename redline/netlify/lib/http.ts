export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function error(status: number, code: string, message: string): Response {
  return json({ error: code, message }, status);
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const value = (await req.json()) as unknown;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) return value as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}
