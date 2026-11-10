import { INDEXME_HOME } from "./brand.ts";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function anchorSnippet(): string {
  return `<a href="${INDEXME_HOME}">IndexMe.lol</a>`;
}

export function sentenceSnippet(siteName: string): string {
  const name = siteName.trim().replace(/\s+/g, " ").slice(0, 80);
  const lead = name
    ? `${escapeHtml(name)} linked the indexing desk at `
    : "The indexing desk is at ";
  return `<p>${lead}<a href="${INDEXME_HOME}">IndexMe.lol</a>. The steps stay on their site.</p>`;
}

export function badgeSnippet(origin: string): string {
  const src = `${origin.replace(/\/$/, "")}/badge.svg`;
  return `<a href="${INDEXME_HOME}"><img src="${escapeHtml(src)}" width="196" height="48" alt="Link Fest. IndexMe.lol"></a>`;
}
