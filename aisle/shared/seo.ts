import {
  ADDRESS_COUNTRY,
  ADDRESS_LINE,
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  BRAND_COMPANY,
  BRAND_NAME,
  BRAND_PARENT,
  BRAND_PLACE,
  BRAND_URL,
  COMPANY_URL,
  CONTACT_EMAIL,
  HERO_H1,
  HERO_WHAT,
  LEGAL_NAME,
  LINKEDIN_URL,
  PARENT_URL,
  POSTAL_CODE,
  PUBLISH_PRICE,
  STREET_ADDRESS,
  TAGLINE,
} from "./brand.ts";

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  bodyHtml: string;
  noindex?: boolean;
};

export const PAGE_SEO: SeoPage[] = [
  {
    path: "/",
    title: "Aisle — one spec, every shop that has it",
    description: `${HERO_H1} ${HERO_WHAT} Publish the aisle for ${PUBLISH_PRICE}.`,
    h1: HERO_H1,
    bodyHtml: `<main id="route-home" class="section"><div class="container"><h1>${HERO_H1}</h1><p class="lede">${HERO_WHAT}</p><p>${TAGLINE} ${BRAND_NAME} is a ${BRAND_PARENT} product from ${BRAND_COMPANY} in ${BRAND_PLACE}.</p></div></main>`,
  },
  {
    path: "/build",
    title: "Build an aisle | Aisle",
    description: "Type a product spec. See the shops whose listings actually match, and the near misses with a reason.",
    h1: "Build an aisle",
    bodyHtml: `<main id="route-build" class="section"><div class="container"><h1>Build an aisle</h1><p class="lede">The spec stays on the page. Each shop that clears it gets a column.</p></div></main>`,
  },
  {
    path: "/shop/brown-wool",
    title: "Brown Wool — brown wool sweaters",
    description: "A shop for one thing: brown wool sweaters. Cotton, navy, and wool blends stay in the near-miss row.",
    h1: "Brown Wool",
    bodyHtml: `<main id="route-brown-wool" class="section"><div class="container"><h1>Brown Wool</h1><p class="lede">Every brown wool sweater on the shelf. Cotton, navy, and blends stay in the near-miss row.</p></div></main>`,
  },
  {
    path: "/shop/flange-tube",
    title: "Flange Tube — 4 inch aluminum tube with a flange",
    description: "A shop for one thing: 4 inch aluminum tube with a flange. Steel, pipe, and plain ends stay in the near-miss row.",
    h1: "Flange Tube",
    bodyHtml: `<main id="route-flange-tube" class="section"><div class="container"><h1>Flange Tube</h1><p class="lede">4 inch aluminum tube with a flange. Steel, pipe, and plain ends stay in the near-miss row.</p></div></main>`,
  },
  {
    path: "/publish",
    title: "Publish an aisle for $29 | Aisle",
    description: `Put your shop name on a catalog for one spec. ${PUBLISH_PRICE} includes the door, the shelf sheet, and a one-page brief.`,
    h1: "Publish this aisle",
    bodyHtml: `<main id="route-publish" class="section"><div class="container"><h1>Publish this aisle</h1><p class="lede">${PUBLISH_PRICE} once. Your name on the door, a CSV of every match and near miss, and a short brief.</p></div></main>`,
  },
  {
    path: "/door",
    title: "Your aisle | Aisle",
    description: "A buyer-facing catalog for one spec, with a column for each shop that has it.",
    h1: "Your aisle",
    bodyHtml: `<main id="route-door" class="section"><div class="container"><h1>Your aisle</h1><p class="lede">One spec, the shops that stock it, and the listings that missed.</p></div></main>`,
  },
  {
    path: "/thanks",
    title: "Aisle published | Aisle",
    description: "Stripe confirmation for an Aisle publish.",
    h1: "The aisle is published",
    bodyHtml: `<main id="route-thanks" class="section"><div class="container"><h1>The aisle is published</h1><p class="lede">Open the door and download the shelf sheet.</p></div></main>`,
    noindex: true,
  },
];

export const NOT_FOUND_SEO: SeoPage = {
  path: "/404",
  title: "Page not found | Aisle",
  description: "That path is not an Aisle page. Start a spec, open Brown Wool, or open Flange Tube.",
  h1: "This page is not an aisle",
  bodyHtml: `<main id="route-404" class="section"><div class="container"><h1>This page is not an aisle</h1><p>Home, the builder, Brown Wool, Flange Tube, and publish are live.</p></div></main>`,
  noindex: true,
};

export function sitemapXml(): string {
  const urls = PAGE_SEO.filter((page) => !page.noindex).map((page) => `  <url><loc>${canonicalFor(page.path)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function canonicalFor(path: string): string {
  if (path === "/") return `${BRAND_URL}/`;
  return `${BRAND_URL}${path}`;
}

export function pageForPath(pathname: string): SeoPage {
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "") || "/";
  return PAGE_SEO.find((page) => page.path === path) ?? NOT_FOUND_SEO;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${BRAND_URL}/#app`,
        name: BRAND_NAME,
        url: `${BRAND_URL}/`,
        applicationCategory: "ShoppingApplication",
        offers: { "@type": "Offer", price: "29.00", priceCurrency: "USD" },
        description: `${TAGLINE} ${HERO_WHAT}`,
        provider: {
          "@type": "Organization",
          name: BRAND_COMPANY,
          legalName: LEGAL_NAME,
          url: COMPANY_URL,
          email: CONTACT_EMAIL,
          address: {
            "@type": "PostalAddress",
            streetAddress: STREET_ADDRESS,
            addressLocality: ADDRESS_LOCALITY,
            addressRegion: ADDRESS_REGION,
            postalCode: POSTAL_CODE,
            addressCountry: ADDRESS_COUNTRY,
          },
          sameAs: [LINKEDIN_URL, PARENT_URL, COMPANY_URL],
        },
      },
    ],
  };
}

export function applyRouteHtml(html: string, page: SeoPage): string {
  const canonical = canonicalFor(page.path === "/404" ? "/404" : page.path);
  const robots = page.noindex ? "noindex, follow" : "index, follow";
  let next = html;
  next = replaceOnce(next, /<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  next = replaceMeta(next, "name", "description", page.description);
  next = replaceMeta(next, "name", "robots", robots);
  if (page.noindex) {
    next = next.replace(/<link\s+rel="canonical"[^>]*>/i, "");
    next = next.replace(/<meta\s+property="og:url"[^>]*>/i, "");
  } else {
    next = replaceLink(next, "canonical", canonical);
    next = replaceMeta(next, "property", "og:url", canonical);
  }
  next = replaceMeta(next, "property", "og:title", page.title);
  next = replaceMeta(next, "property", "og:description", page.description);
  next = replaceMeta(next, "name", "twitter:title", page.title);
  next = replaceMeta(next, "name", "twitter:description", page.description);
  const json = `<script type="application/ld+json">${JSON.stringify(organizationJsonLd())}</script>`;
  if (next.includes('type="application/ld+json"')) {
    next = next.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, json);
  } else {
    next = next.replace("</head>", `    ${json}\n  </head>`);
  }
  next = next.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${page.bodyHtml}</div>`);
  return next;
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function replaceOnce(html: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(html)) throw new Error(`SEO apply failed: missing ${pattern}`);
  return html.replace(pattern, replacement);
}

function replaceMeta(html: string, attr: "name" | "property", key: string, content: string): string {
  const pattern = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*\\/?>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function replaceLink(html: string, rel: string, href: string): string {
  const pattern = new RegExp(`<link\\s+rel="${rel}"\\s+href="[^"]*"\\s*\\/?>`, "i");
  const tag = `<link rel="${rel}" href="${href}" />`;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

export { ADDRESS_LINE };
