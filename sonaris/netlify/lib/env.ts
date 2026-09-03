/**
 * Environment access for functions. Netlify injects the global `Netlify`
 * object at runtime; unit tests and the local stub harness fall back to
 * `process.env`.
 */

// The `Netlify` global type comes from @netlify/functions (serverless-functions-api).

export function env(name: string): string | undefined {
  const v = typeof Netlify !== "undefined" ? Netlify.env.get(name) : process.env[name];
  return v === undefined || v === "" ? undefined : v;
}

export function isLocalDev(): boolean {
  return env("NETLIFY_DEV") === "true" || env("SONARIS_LOCAL") === "true";
}

/** Directory of the Sonaris project (where `memory/` and `skill/` live). */
export function projectRoot(): string {
  return env("SONARIS_ROOT") ?? process.cwd();
}
