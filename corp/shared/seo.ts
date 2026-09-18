import {
  ADDRESS_COUNTRY,
  ADDRESS_LINE,
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  BRAND_NAME,
  BRAND_URL,
  CONTACT_EMAIL,
  CONSULT_DISPLAY,
  FD_NAME,
  FD_PRICE,
  FD_URL,
  INDEXME_NAME,
  INDEXME_URL,
  LEGAL_NAME,
  LINKEDIN_URL,
  POSTAL_CODE,
  STREET_ADDRESS,
} from "./brand.ts";

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  noindex?: boolean;
};

export const PAGE_SEO: SeoPage[] = [
  {
    path: "/",
    title: "AgentHive Inc — Palm Coast AI consultant who builds",
    description: `${BRAND_NAME} (${LEGAL_NAME}) is a Palm Coast AI consultant shop. ${FD_NAME} is the after-hours desk: ${FD_PRICE}. ${INDEXME_NAME} gets the page found.`,
    h1: "We ship the thing you can sell.",
  },
  {
    path: "/about",
    title: "About AgentHive Inc — AGENTHIVEINCCOM LLC, Palm Coast",
    description: `${BRAND_NAME} is the Palm Coast AI consultant shop behind ${FD_NAME}. Legal name ${LEGAL_NAME}. Contact daniel@agenthiveinc.com or ${CONSULT_DISPLAY}.`,
    h1: "About AgentHive Inc",
  },
  {
    path: "/buzz",
    title: "The Buzz — weekly AI and infra briefing | AgentHive Inc",
    description: `The Buzz is the AgentHive Inc weekly AI and infrastructure briefing from Palm Coast. Cited stories, then what to do.`,
    h1: "The Buzz",
  },
  {
    path: "/rankings",
    title: "Live app rankings | AgentHive Inc",
    description: `Public AgentHive Inc apps ranked on uptime, speed, and whether someone can buy them. ${FD_NAME} and ${INDEXME_NAME} lead the board.`,
    h1: "Live app rankings",
  },
  {
    path: "/build",
    title: "Custom builds via First Deploy AI | AgentHive Inc",
    description: `${FD_NAME} custom embeds: ${FD_PRICE}. Live this week or you do not pay the setup.`,
    h1: "One leak. Live this week.",
  },
];

export const NOT_FOUND_SEO: SeoPage = {
  path: "/404",
  title: "Page not found | AgentHive Inc",
  description: `That path is not an AgentHive Inc page. Home, About, The Buzz, and Rankings are live on agenthiveinc.com.`,
  h1: "This page is not on agenthiveinc.com",
  noindex: true,
};

export function canonicalFor(path: string): string {
  if (path === "/") return `${BRAND_URL}/`;
  return `${BRAND_URL}${path}`;
}

export function pageForPath(pathname: string): SeoPage {
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "") || "/";
  return PAGE_SEO.find((page) => page.path === path) ?? NOT_FOUND_SEO;
}

export function organizationJsonLd() {
  const orgId = `${BRAND_URL}/#organization`;
  const localId = `${BRAND_URL}/#localbusiness`;
  const addressId = `${BRAND_URL}/#address`;
  const address = {
    "@type": "PostalAddress",
    "@id": addressId,
    streetAddress: STREET_ADDRESS,
    addressLocality: ADDRESS_LOCALITY,
    addressRegion: ADDRESS_REGION,
    postalCode: POSTAL_CODE,
    addressCountry: ADDRESS_COUNTRY,
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: BRAND_NAME,
        legalName: LEGAL_NAME,
        url: `${BRAND_URL}/`,
        email: CONTACT_EMAIL,
        telephone: CONSULT_DISPLAY,
        address,
        sameAs: [LINKEDIN_URL, FD_URL, INDEXME_URL],
      },
      {
        "@type": "LocalBusiness",
        "@id": localId,
        name: BRAND_NAME,
        legalName: LEGAL_NAME,
        url: `${BRAND_URL}/`,
        image: `${BRAND_URL}/og.jpg`,
        email: CONTACT_EMAIL,
        telephone: CONSULT_DISPLAY,
        address,
        areaServed: "US",
        parentOrganization: { "@id": orgId },
        description: `${BRAND_NAME} is a Palm Coast AI consultant shop. ${FD_NAME} ships the after-hours desk. ${ADDRESS_LINE}.`,
      },
    ],
  };
}

export function applyRouteHtml(html: string, page: SeoPage): string {
  const canonical = canonicalFor(page.path === "/404" ? "/404" : page.path);
  const robots = page.noindex ? "noindex, nofollow" : "index, follow";
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
  const h1 = `<h1 class="display">${escapeHtml(page.h1)}</h1>`;
  next = next.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${h1}</div>`);
  return next;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function replaceOnce(html: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(html)) {
    throw new Error(`SEO apply failed: missing ${pattern}`);
  }
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
