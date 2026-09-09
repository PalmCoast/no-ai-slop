export function env(name: string): string | undefined {
  // `Netlify` is provided by the Functions runtime and `netlify dev`; absent under vitest.
  const fromNetlify = typeof Netlify !== "undefined" ? Netlify.env.get(name) : undefined;
  if (fromNetlify !== undefined && fromNetlify !== "") return fromNetlify;
  const fromProcess = process.env[name];
  return fromProcess === "" ? undefined : fromProcess;
}

export function envInt(name: string, fallback: number): number {
  const raw = env(name);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function isProduction(): boolean {
  return env("CONTEXT") === "production";
}

export function adminEmails(): Set<string> {
  return new Set(
    (env("ADMIN_EMAILS") ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}
