import { PAGE_DESCRIPTION, SITE_NAME } from "./brand.ts";
import { FEST_LINKS } from "./board.ts";
import { escapeHtml } from "./credit.ts";

export function festFallbackHtml(): string {
  const items = FEST_LINKS.map(
    (link) =>
      `<li><a href="${escapeHtml(link.url)}">${escapeHtml(link.name)}</a>: ${escapeHtml(link.line)}</li>`,
  ).join("");
  return `<main id="board"><h1>Link to us. We link back.</h1><p>${escapeHtml(PAGE_DESCRIPTION)}</p><p>${escapeHtml(SITE_NAME)} links out. Each name below is a real href.</p><ul>${items}</ul></main>`;
}

export function festJsonLd(): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: SITE_NAME,
    url: "https://linkfest.indexme.lol/",
    description: PAGE_DESCRIPTION,
    isPartOf: {
      "@type": "WebSite",
      name: "IndexMe.lol",
      url: "https://indexme.lol/",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: FEST_LINKS.map((link, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: link.name,
        url: link.url,
      })),
    },
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
