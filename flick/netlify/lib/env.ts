export function env(name: string): string | undefined {
  const g = globalThis as unknown as { Netlify?: { env: { get(name: string): string | undefined } } };
  const fromNetlify = g.Netlify?.env.get(name);
  if (fromNetlify !== undefined && fromNetlify !== "") return fromNetlify;
  const fromProcess = process.env[name];
  return fromProcess === "" ? undefined : fromProcess;
}

export function isProduction(): boolean {
  return env("CONTEXT") === "production";
}
