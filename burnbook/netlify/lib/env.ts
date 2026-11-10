/**
 * Environment access for functions. Netlify injects `Netlify` at runtime;
 * unit tests fall back to process.env.
 */
export function env(name: string): string | undefined {
  const v = typeof Netlify !== "undefined" ? Netlify.env.get(name) : process.env[name];
  return v === undefined || v === "" ? undefined : v;
}
