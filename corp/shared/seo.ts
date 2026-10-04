import {
  ADDRESS_COUNTRY,
  ADDRESS_LINE,
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  BRAND_NAME,
  BRAND_URL,
  CONTACT_EMAIL,
  BOOK_CTA_LABEL,
  CALENDLY_URL,
  CONSULT_DISPLAY,
  CONSULT_RATES,
  FD_CTA_LABEL,
  FD_NAME,
  FD_PRICE,
  FD_PROMISE,
  FD_URL,
  HERO_H1,
  HIVE_CONSULT_URL,
  HERO_WHAT,
  HERO_WHY,
  INDEXME_BLURB,
  INDEXME_NAME,
  INDEXME_URL,
  LEGAL_NAME,
  LINKEDIN_URL,
  CONSULT_DISPLAY_SEO,
  DANIEL_LINKEDIN_URL,
  CONTENT_LASTMOD,
  POSTAL_CODE,
  PRODUCT_FOOTER_LINKS,
  STREET_ADDRESS,
} from "./brand.ts";
import { DANIEL_BIO, DANIEL_ID, DANIEL_JOB_TITLE, DANIEL_NAME, DANIEL_SAME_AS, DANIEL_URL } from "./author.ts";
import { CONCIERGE_BOOK_LABEL, CONCIERGE_NAME, CONCIERGE_PRICE, CONCIERGE_PRICE_AMOUNT, CONCIERGE_STRIPE_URL, CONCIERGE_URL } from "./concierge.ts";
import { CONCIERGE_FAQS, CONSULT_FAQS, HIRING_FAQS } from "./faqs.ts";

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
    title: "AgentHive Inc — working AI in field operations",
    description:
      "AgentHive Inc embeds working AI in field operations from Palm Coast. Book a free 30, then $75/30 min or $150/hr.",
    h1: HERO_H1,
    bodyHtml: `<main id="route-home" class="section"><div class="container"><h1 class="display">${HERO_H1}</h1><p class="lede">${BRAND_NAME} is a Palm Coast AI consultant who builds. ${HERO_WHAT}</p><p>${HERO_WHY}</p><p>${FD_NAME} is $1,750 setup (50% to start or pay in full) — ${FD_PROMISE.toLowerCase()} — then $250/mo at firstdeploy.ai. ${INDEXME_NAME} is the ${INDEXME_BLURB} at indexme.lol.</p><p><a href="${FD_URL}">${FD_CTA_LABEL}</a> · <a href="${CALENDLY_URL}">${BOOK_CTA_LABEL}</a> · Consult ${CONSULT_DISPLAY}</p></div></main>`,
  },
  {
    path: "/about",
    title: "About AgentHive Inc — AGENTHIVEINCCOM LLC, Palm Coast",
    description: `${BRAND_NAME} is the Palm Coast AI consultant shop behind ${FD_NAME}. Legal name ${LEGAL_NAME}. Call ${CONSULT_DISPLAY}.`,
    h1: "About AgentHive Inc",
    bodyHtml: `<main id="route-about" class="section"><div class="container"><h1 class="display">About AgentHive Inc</h1><p class="lede">${BRAND_NAME} / ${LEGAL_NAME} is the Palm Coast AI consultant shop that builds and ships. Daniel Graham embeds working AI in field operations, then leaves it running.</p><p>Contact: <a href="${CALENDLY_URL}">Book 30 minutes</a>. ${FD_NAME} consult ${CONSULT_DISPLAY}. Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. Shop address ${ADDRESS_LINE}.</p><p>This page is the company record for ${BRAND_NAME} at agenthiveinc.com — not QpiAI, not agenthive.io (insurance), not agenthive.co, not an OSS org with a similar name. Grok Bot swarm lore lives here, not on the money homepage.</p></div></main>`,
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
    noindex: true,
    bodyHtml: `<main id="route-rankings" class="section"><div class="container"><h1 class="display">Live app rankings</h1><p class="lede">Public ${BRAND_NAME} apps scored on uptime, speed, custom domain, and whether someone can buy them.</p><p>${FD_NAME} and ${INDEXME_NAME} lead. This board is the catalog, not the consultant homepage and not The Buzz.</p></div></main>`,
  },
  {
    path: "/build",
    title: "Custom builds via First Deploy AI | AgentHive Inc",
    description: `${FD_NAME} custom embeds: ${FD_PRICE}. Live this week on the same written plan we run for active client builds.`,
    h1: "One leak. Live this week.",
    noindex: true,
    bodyHtml: `<main id="route-build" class="section"><div class="container"><h1 class="display">One leak. Live this week.</h1><p class="lede">${FD_NAME} embeds, ships the after-hours desk plus the live apps, and stays on for $250/month.</p><p>Setup $1,750: 50% to start ($875), the balance at completion, or pay in full. 90-day projects: half upfront, half at completion. Live this week on the same written plan we run for active client builds. Consult ${CONSULT_DISPLAY} or start at ${FD_URL.replace("https://", "")}.</p></div></main>`,
  },
  {
    path: "/consult",
    title: "AI consultant for owners: free 30 min, then $75 | AgentHive Inc",
    description: `AI consulting that ships. Free 30-minute qualifier, then ${CONSULT_RATES}, or a 10-hour pack at $1,250. Book on Calendly. Pay on Stripe.`,
    h1: "An operator in the room.",
    bodyHtml: `<main id="route-consult" class="section"><div class="container"><h1 class="display">An operator in the room.</h1><p class="lede">Not another deck. Free 30-minute qualifier. Then paid time — or a fixed deploy if the leak is clear.</p><p>$75 / 30 minutes. $150 / hour. 10-hour pack $1,250 — $625 up front. Book the free 30 on Calendly. Pay on Stripe when it is paid time. Voice ${CONSULT_DISPLAY}.</p><p>Need continuity instead of hours? <a href="${CONCIERGE_URL}">${CONCIERGE_NAME}</a> is the ${CONCIERGE_PRICE} retainer.</p></div></main>`,
  },
  {
    path: "/concierge",
    title: `AI Concierge: fractional AI advisor, ${CONCIERGE_PRICE} | AgentHive Inc`,
    description:
      "Fractional AI advisor. Two 45-minute sessions a month, unlimited async Slack or text, and a shared asset inventory. $2,000/mo.",
    h1: "Two sessions. The work ships.",
    bodyHtml: `<main id="route-concierge" class="section"><div class="container"><h1 class="display">Two sessions. The work ships.</h1><p class="lede">${CONCIERGE_NAME} is a ${CONCIERGE_PRICE} done-with-you retainer. Audit the messy task, optimize the process, then automate it.</p><p>Included: 2 × 45-minute sessions a month, unlimited async Slack or text, and a shared inventory of every skill, automation, and asset we build. For owners who tried ChatGPT and it didn’t stick.</p><p>If ${FD_NAME} or hourly packs fit better, those stay open. ${CONSULT_RATES}. ${FD_NAME}: ${FD_PRICE}.</p>    <p><a href="${CONCIERGE_STRIPE_URL}">Start ${CONCIERGE_NAME} — ${CONCIERGE_PRICE}</a> · <a href="${CALENDLY_URL}">${CONCIERGE_BOOK_LABEL}</a> · <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> · ${CONSULT_DISPLAY}</p></div></main>`,
  },
  {
    path: "/concierge/vs-hiring",
    title: "AI Concierge vs hiring an in-house AI person | AgentHive Inc",
    description:
      "AI Concierge is $2,000/mo. BLS May 2025 median wages: software developers $135,980, IT managers $175,140. No agency price quoted.",
    h1: "Concierge vs hiring an in-house AI person",
    bodyHtml: `<main id="route-hiring" class="section"><div class="container"><h1 class="display">Concierge vs hiring an in-house AI person</h1><p class="lede">${CONCIERGE_NAME} is ${CONCIERGE_PRICE}. Twelve months is $24,000. The Bureau of Labor Statistics median annual wage for software developers was $135,980 in May 2025, and for computer and information systems managers $175,140. Both are wages, not benefits. Checked October 4, 2026. This page does not quote an agency price.</p><p>${DANIEL_BIO}</p><p><a href="${BRAND_URL}/consult">Consult</a> · <a href="${CONCIERGE_URL}">${CONCIERGE_NAME}</a> · <a href="${DANIEL_URL}">About Daniel Graham</a></p></div></main>`,
  },
];

export const NOT_FOUND_SEO: SeoPage = {
  path: "/404",
  title: "Page not found | AgentHive Inc",
  description: `That path is not an AgentHive Inc page. Home, About, The Buzz, Rankings, Custom Builds, Consult, and AI Concierge are live on agenthiveinc.com.`,
  h1: "This page is not on agenthiveinc.com",
  bodyHtml: `<main id="route-404" class="section"><div class="container"><h1 class="display">This page is not on agenthiveinc.com</h1><p>Home, About, The Buzz, Rankings, Custom Builds, Consult, and AI Concierge are the live AgentHive Inc pages.</p></div></main>`,
  noindex: true,
};

export function sitemapXml(): string {
  const urls = PAGE_SEO.filter((page) => !page.noindex)
    .map(
      (page) =>
        `  <url>\n    <loc>${canonicalFor(page.path)}</loc>\n    <lastmod>${CONTENT_LASTMOD}</lastmod>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function sitemapIndexXml(): string {
  const sitemaps = [{ loc: `${BRAND_URL}/sitemap.xml`, lastmod: CONTENT_LASTMOD }];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps
    .map((entry) => `  <sitemap>\n    <loc>${entry.loc}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n  </sitemap>`)
    .join("\n")}\n</sitemapindex>\n`;
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
        sameAs: [DANIEL_LINKEDIN_URL, LINKEDIN_URL, FD_URL, INDEXME_URL, HIVE_CONSULT_URL],
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
        description: `${BRAND_NAME} embeds working AI in field operations. ${FD_NAME} ships the after-hours desk. ${ADDRESS_LINE}.`,
      },
    ],
  };
}

function faqPage(faqs: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

function danielPerson() {
  return {
    "@type": "Person",
    "@id": DANIEL_ID,
    name: DANIEL_NAME,
    jobTitle: DANIEL_JOB_TITLE,
    url: DANIEL_URL,
    email: CONTACT_EMAIL,
    telephone: CONSULT_DISPLAY_SEO,
    description: DANIEL_BIO,
    address: {
      "@type": "PostalAddress",
      addressLocality: ADDRESS_LOCALITY,
      addressRegion: ADDRESS_REGION,
      addressCountry: ADDRESS_COUNTRY,
    },
    sameAs: [...DANIEL_SAME_AS],
    worksFor: { "@id": `${BRAND_URL}/#organization` },
  };
}

function organizationNode() {
  return {
    "@type": "Organization",
    "@id": `${BRAND_URL}/#organization`,
    name: BRAND_NAME,
    legalName: LEGAL_NAME,
    url: `${BRAND_URL}/`,
    email: CONTACT_EMAIL,
    telephone: CONSULT_DISPLAY_SEO,
    address: {
      "@type": "PostalAddress",
      streetAddress: STREET_ADDRESS,
      addressLocality: ADDRESS_LOCALITY,
      addressRegion: ADDRESS_REGION,
      postalCode: POSTAL_CODE,
      addressCountry: ADDRESS_COUNTRY,
    },
    founder: { "@id": DANIEL_ID },
  };
}

function monthlyOffer(name: string, price: string, url: string) {
  return {
    "@type": "Offer",
    name,
    price,
    priceCurrency: "USD",
    url,
    availability: "https://schema.org/InStock",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency: "USD",
      unitText: "month",
      referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
    },
  };
}

export function jsonLdFor(page: SeoPage): object | null {
  if (page.noindex) return null;
  if (page.path === "/") return organizationJsonLd();
  if (page.path === "/about") {
    return { "@context": "https://schema.org", "@graph": [organizationNode(), danielPerson()] };
  }
  if (page.path === "/consult") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        organizationNode(),
        danielPerson(),
        {
          "@type": "ProfessionalService",
          name: `${BRAND_NAME} AI consulting`,
          url: HIVE_CONSULT_URL,
          provider: { "@id": `${BRAND_URL}/#organization` },
          founder: { "@id": DANIEL_ID },
          areaServed: "US",
          address: {
            "@type": "PostalAddress",
            addressLocality: ADDRESS_LOCALITY,
            addressRegion: ADDRESS_REGION,
            addressCountry: ADDRESS_COUNTRY,
          },
          description: `AI consulting that ships. Free 30-minute qualifier, then ${CONSULT_RATES}, or a 10-hour pack at $1,250.`,
          offers: [
            { "@type": "Offer", name: "Free 30-minute qualifier", price: "0.00", priceCurrency: "USD" },
            { "@type": "Offer", name: "30 minutes", price: "75.00", priceCurrency: "USD" },
            { "@type": "Offer", name: "1 hour", price: "150.00", priceCurrency: "USD" },
            { "@type": "Offer", name: "10-hour pack", price: "1250.00", priceCurrency: "USD" },
          ],
        },
        faqPage(CONSULT_FAQS),
      ],
    };
  }
  if (page.path === "/concierge") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        organizationNode(),
        danielPerson(),
        {
          "@type": "Service",
          name: `${BRAND_NAME} ${CONCIERGE_NAME}`,
          serviceType: "Fractional AI advisor",
          url: CONCIERGE_URL,
          provider: { "@id": DANIEL_ID },
          description:
            "Fractional AI advisor. Two 45-minute sessions a month, unlimited async Slack or text, and a shared asset inventory.",
          offers: monthlyOffer(CONCIERGE_NAME, CONCIERGE_PRICE_AMOUNT, CONCIERGE_STRIPE_URL),
        },
        faqPage(CONCIERGE_FAQS),
      ],
    };
  }
  if (page.path === "/concierge/vs-hiring") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        organizationNode(),
        danielPerson(),
        {
          "@type": "Article",
          headline: "Concierge vs hiring an in-house AI person",
          author: { "@id": DANIEL_ID },
          publisher: { "@id": `${BRAND_URL}/#organization` },
          datePublished: "2026-10-04",
          dateModified: "2026-10-04",
          mainEntityOfPage: canonicalFor(page.path),
        },
        faqPage(HIRING_FAQS),
      ],
    };
  }
  return null;
}

export function applyRouteHtml(html: string, page: SeoPage, renderedBody?: string): string {
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
  const jsonLd = jsonLdFor(page);
  const existing = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;
  if (jsonLd) {
    const json = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    if (existing.test(next)) next = next.replace(existing, json);
    else next = next.replace("</head>", `    ${json}\n  </head>`);
  } else if (existing.test(next)) {
    next = next.replace(existing, "");
  }
  const body = renderedBody ?? `${page.bodyHtml}${productFooterHtml()}`;
  if (!/<div id="root">\s*<\/div>/.test(next)) {
    throw new Error("SEO apply failed: missing empty #root");
  }
  next = next.replace(/<div id="root">\s*<\/div>/, `<div id="root">${body}</div>`);
  return next;
}

function productFooterHtml(): string {
  const links = PRODUCT_FOOTER_LINKS.map((link) => `<a href="${link.href}">${escapeHtml(link.label)}</a>`).join(" · ");
  return `<p class="footer-products">Products: ${links}</p>`;
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
