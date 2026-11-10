declare const Netlify: { env: { get(name: string): string | undefined } } | undefined;

export function env(name: string): string | undefined {
  if (typeof Netlify !== "undefined") {
    const value = Netlify.env.get(name);
    if (value && value.trim()) return value.trim();
  }
  const fallback = process.env[name];
  return fallback && fallback.trim() ? fallback.trim() : undefined;
}
