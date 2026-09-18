import {
  ADDRESS_COUNTRY,
  ADDRESS_LINE,
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  BRAND_NAME,
  BRAND_URL,
  CONTACT_EMAIL,
  CALENDLY_URL,
  CONSULT_DISPLAY,
  FD_NAME,
  FD_PRICE,
  FD_PROMISE,
  FD_URL,
  INDEXME_BLURB,
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
  bodyHtml: string;
  noindex?: boolean;
};

export const PAGE_SEO: SeoPage[] = [
  {
    path: "/",
    title: "AgentHive Inc — Palm Coast AI consultant who builds",
    description: `${BRAND_NAME} (${LEGAL_NAME}) is a Palm Coast AI consultant who builds. ${FD_NAME} is ${FD_PRICE}. ${INDEXME_NAME}: ${INDEXME_BLURB}.`,
    h1: "We ship the thing you can sell.",
    bodyHtml: `<main id="route-home" class="section"><div class="container"><h1 class="display">We ship the thing you can sell.</h1><p class="lede">${BRAND_NAME} is a Palm Coast AI consultant who builds. We embed working software in the operation and leave it running.</p><p>${FD_NAME} is $1,500 setup — ${FD_PROMISE.toLowerCase()} — then $250/mo at firstdeploy.ai. ${INDEXME_NAME} is the ${INDEXME_BLURB} at indexme.lol.</p><p><a href="${FD_URL}">Start ${FD_NAME}</a> · <a href="${INDEXME_URL}">Open ${INDEXME_NAME}</a> · Consult ${CONSULT_DISPLAY}</p></div></main>`,
  },
  {
    path: "/about",
    title: "About AgentHive Inc — AGENTHIVEINCCOM LLC, Palm Coast",
    description: `${BRAND_NAME} is the Palm Coast AI consultant shop behind ${FD_NAME}. Legal name ${LEGAL_NAME}. Book ${CALENDLY_URL} or call ${CONSULT_DISPLAY}.`,
    h1: "About AgentHive Inc",
    bodyHtml: `<main id="route-about" class="section"><div class="container"><h1 class="display">About AgentHive Inc</h1><p class="lede">${BRAND_NAME} / ${LEGAL_NAME} is the Palm Coast AI consultant shop that builds and ships. Daniel Graham embeds working AI in real operations, then leaves it running.</p><p>Contact: <a href="${CALENDLY_URL}">Book 30 minutes</a>. ${FD_NAME} consult ${CONSULT_DISPLAY}. Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. Shop address ${ADDRESS_LINE}.</p><p>This page is the company record for ${BRAND_NAME} at agenthiveinc.com — not QpiAI, not an insurance hive, not an OSS org with a similar name.</p></div></main>`,
  },
  {
    path: "/buzz",
    title: "The Buzz — weekly AI and infra briefing | AgentHive Inc",
    description: `The Buzz is the AgentHive Inc weekly AI and infrastructure briefing from Palm Coast. Cited stories, then what to do.`,
    h1: "The Buzz",
    bodyHtml: `<main id="route-buzz" class="section"><div class="container"><h1 class="display">The Buzz</h1><p class="lede">Weekly AI and infrastructure briefing from ${BRAND_NAME} in Palm Coast. Cited stories, then what to do with them.</p><p>The live edition loads after this static floor. This URL is the briefing room, not the homepage and not the app rankings board.</p></div></main>`,
  },
  {
    path: "/rankings",
    title: "Live app rankings | AgentHive Inc",
    description: `Public AgentHive Inc apps ranked on uptime, speed, and whether someone can buy them. ${FD_NAME} and ${INDEXME_NAME} lead the board.`,
    h1: "Live app rankings",
    bodyHtml: `<main id="route-rankings" class="section"><div class="container"><h1 class="display">Live app rankings</h1><p class="lede">Public ${BRAND_NAME} apps scored on uptime, speed, custom domain, and whether someone can buy them.</p><p>${FD_NAME} and ${INDEXME_NAME} lead. This board is the catalog, not the consultant homepage and not The Buzz.</p></div></main>`,
  },
  {
    path: "/build",
    title: "Custom builds via First Deploy AI | AgentHive Inc",
    description: `${FD_NAME} custom embeds: ${FD_PRICE}. Live this week or you do not pay the setup.`,
    h1: "One leak. Live this week.",
    bodyHtml: `<main id="route-build" class="section"><div class="container"><h1 class="display">One leak. Live this week.</h1><p class="lede">${FD_NAME} embeds, ships the after-hours desk plus the live apps, and stays on for $250/month.</p><p>Setup $1,500. Live this week or you do not pay the setup. Consult ${CONSULT_DISPLAY} or start at ${FD_URL.replace("https://", "")}.</p></div></main>`,
  },
];

export const NOT_FOUND_SEO: SeoPage = {
  path: "/404",
  title: "Page not found | AgentHive Inc",
  description: `That path is not an AgentHive Inc page. Home, About, The Buzz, and Rankings are live on agenthiveinc.com.`,
  h1: "This page is not on agenthiveinc.com",
  bodyHtml: `<main id="route-404" class="section"><div class="container"><h1 class="display">This page is not on agenthiveinc.com</h1><p>Home, About, The Buzz, Rankings, and Custom Builds are the live AgentHive Inc pages.</p></div></main>`,
  noindex: true,
};

export function sitemapXml(): string {
  const urls = PAGE_SEO.map((page) => `  <url><loc>${canonicalFor(page.path)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
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
  next = next.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${page.bodyHtml}</div>`);
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
