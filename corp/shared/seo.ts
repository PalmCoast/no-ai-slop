import {
  ADDRESS_COUNTRY,
  ADDRESS_LINE,
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  BRAND_NAME,
  BRAND_URL,
  BOOK_CTA_LABEL,
  BOOK_HREF,
  triageGoHref,
  TRIAGE_URL,
  FD_PRICE_LINE_HTML,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  PHONE_DISPLAY,
  FD_NAME,
  FD_PRICE,
  FD_PROMISE,
  FD_URL,
  HERO_H1,
  HIVE_CONSULT_URL,
  HERO_WHAT,
  INDEXME_BLURB,
  INDEXME_NAME,
  LEGAL_NAME,
  ORG_SAME_AS,
  CONSULT_DISPLAY_SEO,
  CONTENT_LASTMOD,
  PRODUCT_FOOTER_LINKS,
  PICKS_URL,
  TRIAGE_CTA_LABEL,
  HIVE_CONSULT_PATH,
  INVOICE_LINE,
  SPRINT_NAME,
  SPRINT_PRICE_AMOUNT,
} from "./brand.ts";
import { DANIEL_BIO, DANIEL_ID, DANIEL_JOB_TITLE, DANIEL_NAME, DANIEL_SAME_AS, DANIEL_URL } from "./author.ts";
import { CONCIERGE_NAME, CONCIERGE_PRICE, CONCIERGE_PRICE_AMOUNT, CONCIERGE_URL } from "./concierge.ts";
import { CONCIERGE_FAQS, CONSULT_COST_FAQS, CONSULT_FAQS, HIRING_FAQS } from "./faqs.ts";
import { CONSULT_COST_CHECKED_ISO, CONSULT_COST_URL } from "./consult.ts";
import { BILL_CLOSE_BODY, BILL_CLOSE_H, BILL_FAQ, BILL_FAQ_HTML, BILL_FORM_TITLE, BILL_H1, BILL_NDA_CLAUSE, BILL_NDA_LABEL, BILL_REDACT_HTML, BILL_RETENTION_HTML, BILL_SMALL, BILL_SUB, BILL_TOP_HTML } from "./b2bCopy.ts";
import { CONSULT_COMPARE_CHECKED_ISO, consultComparePageFor } from "./consultCompare.ts";
import { AFFILIATE_TOOLS, DISCLOSURE_LINE, DISCLOSURE_UPDATED } from "./disclosure.ts";
import { AEO_LASTMOD, AEO_PAGES, aeoBodyHtml, aeoPageFor } from "./aeo.ts";
import {
  ADS_DESCRIPTION,
  ADS_FAQS,
  ADS_H1,
  ADS_ICON,
  ADS_OG_ALT,
  ADS_OG_IMAGE,
  ADS_PATH,
  ADS_THANKS_DESCRIPTION,
  ADS_THANKS_H1,
  ADS_THANKS_PATH,
  ADS_THANKS_TITLE,
  ADS_TITLE,
} from "./ads.ts";

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  bodyHtml: string;
  noindex?: boolean;
  ogImage?: string;
  ogImageAlt?: string;
  icon?: string;
  lastmod?: string;
};

export const PAGE_SEO: SeoPage[] = [
  {
    path: "/",
    title: "AgentHive Inc: cut AI agent spend and stop the loops in 5 business days",
    description:
      "Cut AI agent spend and stop loops. Free 30-minute Architecture & Spend Triage, a $2,500 sprint in 5 business days, then $3,500/mo AI ops.",
    h1: HERO_H1,
    bodyHtml: `<main id="route-home" class="section"><div class="container"><h1 class="display">${HERO_H1}</h1><p class="lede">${HERO_WHAT}</p><p>${FD_PRICE_LINE_HTML}</p><p>70+ live AI apps in production, built and run by Daniel Graham, a U.S. Army veteran with 20+ years in operations.</p><h2>Where the money goes</h2><ul><li>Loops and runaway retries.</li><li>Drift and redundant scheduled runs.</li><li>The wrong model on the wrong job, with no caching.</li><li>Seats and API keys with no caps and no owner.</li></ul><p><a href="${triageGoHref("home-prerender")}" data-ph-cta="triage" data-ph-from="home-prerender">${BOOK_CTA_LABEL}</a> · <a href="/consult">The $2,500 sprint</a> · <a href="/concierge">The $3,500/mo retainer</a> · Phone ${CONSULT_DISPLAY}</p><p>Also from ${BRAND_NAME}: the <a href="https://firstdeploy.ai/consult">$2,500 sprint</a> and the <a href="https://firstdeploy.ai/freight-ops-ai-agent/">Freight Ops AI Agent</a> proof. ${INDEXME_NAME} is the ${INDEXME_BLURB} at indexme.lol.</p></div></main>`,
  },
  {
    path: "/about",
    title: "About AgentHive Inc — AGENTHIVEINCCOM LLC, Palm Coast",
    description: `${BRAND_NAME} is the Palm Coast AI operator behind ${FD_NAME}. Legal name ${LEGAL_NAME}. Call ${CONSULT_DISPLAY}.`,
    h1: "About AgentHive Inc",
    bodyHtml: `<main id="route-about" class="section"><div class="container"><h1 class="display">About AgentHive Inc</h1><p class="lede">${BRAND_NAME} / ${LEGAL_NAME} is the Palm Coast AI consulting company that builds and ships. Daniel Graham builds working AI for funded teams, then leaves it running.</p><p>Contact: <a href="tel:${CONSULT_TEL}">${CONSULT_DISPLAY}</a>. ${FD_NAME} consult ${CONSULT_DISPLAY}. Shop address ${ADDRESS_LINE}.</p><p>This page is the company record for ${BRAND_NAME} at agenthiveinc.com The money homepage stays on the work.</p></div></main>`,
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
    description: `${FD_NAME} custom embeds: ${FD_PRICE}. ${FD_PROMISE}.`,
    h1: "One leak. Built on a written plan.",
    noindex: true,
    bodyHtml: `<main id="route-build" class="section"><div class="container"><h1 class="display">One leak. Built on a written plan.</h1><p class="lede">${FD_NAME} embeds, finds what’s burning your team’s AI agent spend and fixes it. ${FD_PRICE_LINE_HTML}</p><p>${FD_PROMISE}. Consult ${CONSULT_DISPLAY} or start at ${FD_URL.replace("https://", "")}.</p></div></main>`,
  },
  {
    path: "/consult",
    title: "Agent Audit & Stabilization Sprint: $2,500, 5 business days | AgentHive Inc",
    description:
      "A $2,500 fixed-price sprint: we cut AI agent spend and stop loops, drift and redundant runs in 5 business days. Free 30-minute Architecture & Spend Triage first.",
    h1: "Cut agent spend and stop the loops. $2,500, 5 business days.",
    bodyHtml: `<main id="route-consult" class="section"><div class="container"><h1 class="display">Cut agent spend and stop the loops. $2,500, 5 business days.</h1><p class="lede">A fixed-price sprint for CTOs and COOs whose AI bill keeps climbing. Daniel Graham audits your agents, routines and seats, fixes what is burning money in your accounts, and hands back a before-and-after report.</p><p>Day 1: access and inventory. Days 2 to 4: fixes, caps and alerts, with your approval on production changes. Day 5: the written report.</p><p>${FD_PRICE_LINE_HTML}</p><p><a href="${triageGoHref("consult-prerender-sprint")}" data-ph-cta="triage" data-ph-from="consult-prerender-sprint">${TRIAGE_CTA_LABEL}</a> · ${INVOICE_LINE} · <a href="${BOOK_HREF}" data-ph-cta="triage" data-ph-from="consult-prerender">${BOOK_CTA_LABEL}</a> · <a href="${CONCIERGE_URL}">${CONCIERGE_NAME}</a>, ${CONCIERGE_PRICE} · Phone ${CONSULT_DISPLAY}</p></div></main>`,
  },
  {
    path: "/send-your-bill",
    title: "Send Your AI Bill: Free 48-Hour Teardown | AgentHive Inc",
    description:
      "Send a redacted AI bill. Get back a teardown video and a dollar figure in 48 hours. Mutual NDA in one click. Deleted within 7 days of delivery.",
    h1: BILL_H1,
    lastmod: "2026-11-27",
    bodyHtml: `<main id="route-send-your-bill" class="section"><div class="container"><h1 class="display">${BILL_H1}</h1><p class="lede">${BILL_SUB}</p><p>${BILL_SMALL}</p>${BILL_TOP_HTML.join("")}<h2>${BILL_FORM_TITLE}</h2><p><strong>${BILL_NDA_LABEL}</strong> ${BILL_NDA_CLAUSE}</p>${BILL_RETENTION_HTML}${BILL_REDACT_HTML}${BILL_FAQ_HTML}<h2>${BILL_CLOSE_H}</h2><p>${BILL_CLOSE_BODY}</p></div></main>`,
  },
  {
    path: "/concierge",
    title: `Fractional AI Ops Retainer, ${CONCIERGE_PRICE} | AgentHive Inc`,
    description:
      "Fractional AI ops, $3,500/mo: monitoring of agent spend and failures, a 1-business-day response time, a monthly report and async help. Teams of 30 to 200.",
    h1: "Someone watching your AI spend and failures, every business day.",
    bodyHtml: `<main id="route-concierge" class="section"><div class="container"><h1 class="display">Someone watching your AI spend and failures, every business day.</h1><p class="lede">For CTOs and COOs at funded teams of 30 to 200. Daniel Graham monitors your agents, routines and keys, answers within 1 business day, and sends a monthly report.</p><p>Included: active monitoring of agent spend and failures, a 1-business-day response time, a monthly spend and reliability report, and async help. ${CONCIERGE_NAME} is ${CONCIERGE_PRICE}, month to month after the first 3 months.</p><p>${FD_PRICE_LINE_HTML}</p><p><a href="${triageGoHref("concierge-prerender-retainer")}" data-ph-cta="triage" data-ph-from="concierge-prerender-retainer">${TRIAGE_CTA_LABEL}</a> · ${INVOICE_LINE} · <a href="${BOOK_HREF}" data-ph-cta="triage" data-ph-from="concierge-prerender">${BOOK_CTA_LABEL}</a> · <a href="tel:${CONSULT_TEL}">${PHONE_DISPLAY}</a></p></div></main>`,
  },
  {
    path: "/concierge/vs-hiring",
    title: "Fractional AI ops retainer vs hiring an in-house AI ops person | AgentHive Inc",
    description:
      "The Fractional AI Ops Retainer is $3,500/mo. BLS May 2025 median wages: software developers $135,980, IT managers $175,140. No agency price quoted.",
    h1: "The retainer vs hiring an in-house AI ops person",
    bodyHtml: `<main id="route-hiring" class="section"><div class="container"><h1 class="display">The retainer vs hiring an in-house AI ops person</h1><p class="lede">The ${CONCIERGE_NAME} is ${CONCIERGE_PRICE}. Twelve months is $42,000. The Bureau of Labor Statistics median annual wage for software developers was $135,980 in May 2025, and for computer and information systems managers $175,140. Both are wages, not benefits. Checked October 4, 2026. This page does not quote an agency price.</p><p>${DANIEL_BIO}</p><p><a href="${BRAND_URL}/consult">The $2,500 sprint</a> · <a href="${CONCIERGE_URL}">${CONCIERGE_NAME}</a> · <a href="${DANIEL_URL}">About Daniel Graham</a></p></div></main>`,
  },
  {
    path: "/disclosure",
    title: "Affiliate disclosure | AgentHive Inc",
    description:
      "AgentHive Inc earns commissions only on tools it uses itself (Netlify, Lovable, Higgsfield, MailCheap, Mercor, micro1). How affiliate links work on agenthiveinc.com.",
    h1: "Affiliate disclosure",
    bodyHtml: `<main id="route-disclosure" class="section"><div class="container"><h1 class="display">Affiliate disclosure</h1><p class="lede">${DISCLOSURE_LINE}</p><p>Some links on agenthiveinc.com may be affiliate links. If you sign up or buy through one, ${BRAND_NAME} (${LEGAL_NAME}) may earn a commission. The tools in our own stack that run affiliate programs: ${AFFILIATE_TOOLS.map((t) => `${t.name} (${t.use})`).join(", ")}. You pay the same price you would pay going direct. A commission does not decide what we recommend or build with, and the footer &ldquo;Featured on&rdquo; badges are not affiliate links. Questions: call ${CONSULT_DISPLAY}. Last updated ${DISCLOSURE_UPDATED}.</p></div></main>`,
  },
  {
    path: ADS_PATH,
    title: ADS_TITLE,
    description: ADS_DESCRIPTION,
    h1: ADS_H1,
    noindex: true,
    ogImage: ADS_OG_IMAGE,
    ogImageAlt: ADS_OG_ALT,
    icon: ADS_ICON,
    bodyHtml: `<main id="route-ads"><h1>${ADS_H1}</h1><p>${ADS_DESCRIPTION}</p><p>AI Ad Sprint is $297 one time for 6 video ads and 6 image ads, delivered within 72 hours. Monthly is $997 a month for 20 new ads. Paid upfront by card. AI-generated people are labeled as AI.</p></main>`,
  },
  {
    path: ADS_THANKS_PATH,
    title: ADS_THANKS_TITLE,
    description: ADS_THANKS_DESCRIPTION,
    h1: ADS_THANKS_H1,
    noindex: true,
    icon: ADS_ICON,
    bodyHtml: `<main id="route-adsthanks"><h1>${ADS_THANKS_H1}</h1><p>${ADS_THANKS_DESCRIPTION}</p><p>We reply by email, then the sprint starts once payment and intake are in. You get a download link within 72 hours. Files come in 9:16, 1:1 and 4:5. Any AI-generated person is labeled as AI. One round of revisions follows delivery.</p></main>`,
  },
  ...AEO_PAGES.map((page) => ({
    path: page.path,
    title: page.title,
    description: page.description,
    h1: page.h1,
    lastmod: AEO_LASTMOD,
    bodyHtml: aeoBodyHtml(page),
  })),
];

export const NOT_FOUND_SEO: SeoPage = {
  path: "/404",
  title: "Page not found | AgentHive Inc",
  description: `That path is not an AgentHive Inc page. Home, the $2,500 Sprint, the $3,500/mo Retainer, About, The Buzz and Rankings are live on agenthiveinc.com.`,
  h1: "This page is not on agenthiveinc.com",
  bodyHtml: `<main id="route-404" class="section"><div class="container"><h1 class="display">This page is not on agenthiveinc.com</h1><p>Home, the $2,500 Sprint, the $3,500/mo Retainer, About, The Buzz and Rankings are the live AgentHive Inc pages.</p></div></main>`,
  noindex: true,
};

/** Static free planner page shipped from public/ads/creative-calculator/index.html. */
export const CREATIVE_CALCULATOR_URL = "https://agenthiveinc.com/ads/creative-calculator/";

/** Static Grok Bot template pages shipped from public/<slug>/index.html (sold on Whop). */
export const TEMPLATE_PAGE_URLS = [
  "https://agenthiveinc.com/muscle-memory-bot-template/",
  "https://agenthiveinc.com/github-repo-to-windows-exe/",
] as const;

// Static RAM buying guides under /ram-deals/ (public/ram-deals/<slug>/index.html).
export const RAM_GUIDE_URLS = [
  "https://agenthiveinc.com/ram-deals/black-friday-ddr5-ram-deals/",
  "https://agenthiveinc.com/ram-deals/best-32gb-ddr5-ram/",
  "https://agenthiveinc.com/ram-deals/best-64gb-ddr5-ram/",
  "https://agenthiveinc.com/ram-deals/ddr4-ram-deals/",
  "https://agenthiveinc.com/ram-deals/how-much-ram-for-gaming/",
] as const;

export function sitemapXml(): string {
  const urls = PAGE_SEO.filter((page) => !page.noindex)
    .map((page) => {
      const image = page.ogImage
        ? `\n    <image:image>\n      <image:loc>${page.ogImage}</image:loc>\n    </image:image>`
        : "";
      return `  <url>\n    <loc>${canonicalFor(page.path)}</loc>\n    <lastmod>${page.lastmod ?? CONTENT_LASTMOD}</lastmod>${image}\n  </url>`;
    })
    .join("\n");
  // Static file in public/ram-deals/. Not a PAGE_SEO route, so prerender must not rewrite it.
  const ramDeals = `  <url>\n    <loc>https://agenthiveinc.com/ram-deals/</loc>\n    <lastmod>2026-11-19</lastmod>\n  </url>`;
  // Static RAM buying guides in public/ram-deals/<slug>/ (same pattern as /ram-deals). Not PAGE_SEO routes.
  const ramGuides = RAM_GUIDE_URLS.map(
    (loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>2026-11-19</lastmod>\n    <image:image>\n      <image:loc>${loc}og.png</image:loc>\n    </image:image>\n  </url>`,
  ).join("\n");
  // Static file in public/picks/. Same pattern as /ram-deals: not a PAGE_SEO route.
  const picks = `  <url>\n    <loc>${PICKS_URL}</loc>\n    <lastmod>2026-11-02</lastmod>\n    <image:image>\n      <image:loc>${PICKS_URL}og.png</image:loc>\n    </image:image>\n  </url>`;
  // Static file in public/ads/creative-calculator/. Same pattern as /ram-deals: not a PAGE_SEO route.
  const creativeCalculator = `  <url>\n    <loc>${CREATIVE_CALCULATOR_URL}</loc>\n    <lastmod>2026-11-01</lastmod>\n  </url>`;
  // Static guide pages in public/<slug>/ (same pattern as /ram-deals). Not PAGE_SEO routes.
  const guides = [
    "https://agenthiveinc.com/founder-stack/",
    "https://agenthiveinc.com/gifts-for-tech-founders/",
    "https://agenthiveinc.com/ads/ai-video-ads-for-shopify/",
    "https://agenthiveinc.com/startup-website-hosting/",
    "https://agenthiveinc.com/business-email-new-domain/",
  ]
    .map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>2026-11-02</lastmod>\n  </url>`)
    .join("\n");
  // Static Grok Bot template pages in public/<slug>/ (same pattern as the guides above).
  const templates = TEMPLATE_PAGE_URLS.map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>2026-11-10</lastmod>\n  </url>`).join("\n");
  // 2026-11-27: /ram-deals/* and /picks/ moved to brooms.ai (301). They stay out of AH's sitemap.
  void ramDeals;
  void ramGuides;
  void picks;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n${creativeCalculator}\n${guides}\n${templates}\n</urlset>\n`;
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
    addressLocality: ADDRESS_LOCALITY,
    addressRegion: ADDRESS_REGION,
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
        telephone: CONSULT_DISPLAY,
        address,
        sameAs: [...ORG_SAME_AS],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "AI ops for funded teams",
          itemListElement: [
            { "@type": "Offer", name: "Free 30-minute Architecture & Spend Triage", price: "0.00", priceCurrency: "USD", url: TRIAGE_URL },
            { "@type": "Offer", name: SPRINT_NAME, description: "Fixed price, delivered in 5 business days. Cut AI agent spend and stop loops, drift and redundant runs.", price: SPRINT_PRICE_AMOUNT, priceCurrency: "USD", url: `${BRAND_URL}/consult` },
            monthlyOffer(CONCIERGE_NAME, CONCIERGE_PRICE_AMOUNT, CONCIERGE_URL),
          ],
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": localId,
        name: BRAND_NAME,
        legalName: LEGAL_NAME,
        url: `${BRAND_URL}/`,
        image: `${BRAND_URL}/og.jpg`,
        telephone: CONSULT_DISPLAY,
        address,
        areaServed: "US",
        parentOrganization: { "@id": orgId },
        description: `${BRAND_NAME} is AI ops for funded teams of 30 to 200: a free 30-minute Architecture & Spend Triage, a $2,500 Agent Audit & Stabilization Sprint delivered in 5 business days, and a $3,500/mo Fractional AI Ops retainer. ${ADDRESS_LINE}.`,
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
    telephone: CONSULT_DISPLAY_SEO,
    address: {
      "@type": "PostalAddress",
      addressLocality: ADDRESS_LOCALITY,
      addressRegion: ADDRESS_REGION,
      addressCountry: ADDRESS_COUNTRY,
    },
    sameAs: [...ORG_SAME_AS],
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
  const aeo = aeoPageFor(page.path);
  if (aeo) {
    const parentIsConcierge = aeo.path.startsWith("/concierge/");
    const crumbs = parentIsConcierge
      ? [
          { "@type": "ListItem", position: 1, name: "AgentHive Inc", item: `${BRAND_URL}/` },
          { "@type": "ListItem", position: 2, name: "Fractional AI Ops Retainer", item: CONCIERGE_URL },
          { "@type": "ListItem", position: 3, name: aeo.h1, item: canonicalFor(aeo.path) },
        ]
      : [
          { "@type": "ListItem", position: 1, name: "AgentHive Inc", item: `${BRAND_URL}/` },
          { "@type": "ListItem", position: 2, name: aeo.h1, item: canonicalFor(aeo.path) },
        ];
    return {
      "@context": "https://schema.org",
      "@graph": [organizationNode(), { "@type": "BreadcrumbList", itemListElement: crumbs }, faqPage(aeo.faqs)],
    };
  }
  if (page.path === "/") return organizationJsonLd();
  if (page.path === "/about") {
    return { "@context": "https://schema.org", "@graph": [organizationNode(), danielPerson()] };
  }
  if (page.path === "/send-your-bill") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        organizationNode(),
        {
          "@type": "Service",
          name: "Free AI Bill Teardown",
          url: `${BRAND_URL}/send-your-bill`,
          provider: { "@id": `${BRAND_URL}/#organization` },
          areaServed: "US",
          offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD", url: `${BRAND_URL}/send-your-bill` },
        },
        faqPage(BILL_FAQ.map((f) => ({ q: f.q, a: f.a }))),
      ],
    };
  }
  if (page.path === "/consult") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        organizationNode(),
        danielPerson(),
        {
          "@type": "ProfessionalService",
          name: `${BRAND_NAME} ${SPRINT_NAME}`,
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
          description: "A $2,500 fixed-price Agent Audit & Stabilization Sprint for funded teams of 30 to 200, delivered in 5 business days: cut AI agent spend and stop loops, drift and redundant runs. Free 30-minute Architecture & Spend Triage first; $3,500/mo Fractional AI Ops retainer after.",
          offers: [
            { "@type": "Offer", name: "Free 30-minute Architecture & Spend Triage", price: "0.00", priceCurrency: "USD", url: TRIAGE_URL },
            { "@type": "Offer", name: SPRINT_NAME, price: SPRINT_PRICE_AMOUNT, priceCurrency: "USD", url: `${BRAND_URL}${HIVE_CONSULT_PATH}` },
            monthlyOffer(CONCIERGE_NAME, CONCIERGE_PRICE_AMOUNT, CONCIERGE_URL),
          ],
        },
        faqPage(CONSULT_FAQS),
      ],
    };
  }
  if (page.path === "/consult/ai-consultant-cost") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        organizationNode(),
        danielPerson(),
        {
          "@type": "Article",
          headline: "What an AI consultant costs a growing company",
          author: { "@id": DANIEL_ID },
          publisher: { "@id": `${BRAND_URL}/#organization` },
          datePublished: CONSULT_COST_CHECKED_ISO,
          dateModified: CONSULT_COST_CHECKED_ISO,
          mainEntityOfPage: canonicalFor(page.path),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Consult", item: HIVE_CONSULT_URL },
            { "@type": "ListItem", position: 2, name: "What an AI consultant costs", item: CONSULT_COST_URL },
          ],
        },
        faqPage(CONSULT_COST_FAQS),
      ],
    };
  }
  const compare = consultComparePageFor(page.path);
  if (compare) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        organizationNode(),
        danielPerson(),
        {
          "@type": "Article",
          headline: compare.h1,
          description: compare.description,
          author: { "@id": DANIEL_ID },
          publisher: { "@id": `${BRAND_URL}/#organization` },
          datePublished: CONSULT_COMPARE_CHECKED_ISO,
          dateModified: compare.dateModified ?? CONSULT_COMPARE_CHECKED_ISO,
          mainEntityOfPage: canonicalFor(page.path),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Consult", item: HIVE_CONSULT_URL },
            { "@type": "ListItem", position: 2, name: compare.crumb, item: canonicalFor(page.path) },
          ],
        },
        faqPage(compare.faqs),
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
          serviceType: "Fractional AI operations",
          url: CONCIERGE_URL,
          provider: { "@id": `${BRAND_URL}/#organization` },
          areaServed: { "@type": "Country", name: "United States" },
          description:
            "Fractional AI ops for funded teams of 30 to 200: active monitoring of agent spend and failures, a 1-business-day response time, a monthly report and async help. Month to month.",
          offers: {
            ...monthlyOffer(CONCIERGE_NAME, CONCIERGE_PRICE_AMOUNT, CONCIERGE_URL),
            seller: { "@type": "Organization", name: BRAND_NAME, "@id": `${BRAND_URL}/#organization` },
          },
        },
        faqPage(CONCIERGE_FAQS),
      ],
    };
  }
  if (page.path === ADS_PATH) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          name: "AI Ad Sprint",
          serviceType: "Product ad creative",
          url: canonicalFor(ADS_PATH),
          provider: { "@id": `${BRAND_URL}/#organization` },
          description: ADS_DESCRIPTION,
          offers: [
            {
              "@type": "Offer",
              name: "AI Ad Sprint",
              price: "297.00",
              priceCurrency: "USD",
              url: `${BRAND_URL}/go/ads-sprint`,
              availability: "https://schema.org/InStock",
            },
            monthlyOffer("Monthly ads", "997.00", `${BRAND_URL}/go/ads-engine`),
          ],
        },
        faqPage(ADS_FAQS),
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
          headline: "The retainer vs hiring an in-house AI ops person",
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
  if (page.ogImage) {
    next = replaceMeta(next, "property", "og:image", page.ogImage);
    next = replaceMeta(next, "name", "twitter:image", page.ogImage);
    next = replaceMeta(next, "property", "og:image:width", "1200");
    next = replaceMeta(next, "property", "og:image:height", "630");
    if (page.ogImageAlt) {
      next = replaceMeta(next, "property", "og:image:alt", page.ogImageAlt);
      next = replaceMeta(next, "name", "twitter:image:alt", page.ogImageAlt);
    }
  }
  if (page.icon) {
    next = next.replace(/<link\s+rel="icon"[^>]*>/i, `<link rel="icon" href="${page.icon}" type="image/svg+xml" />`);
  }
  if (page.path === "/ads" || page.path === "/ads/thanks") {
    next = next.replace(/<link\s+rel="preconnect"\s+href="https:\/\/fonts\.googleapis\.com"[^>]*>\s*/gi, "");
    next = next.replace(/<link\s+rel="preconnect"\s+href="https:\/\/fonts\.gstatic\.com"[^>]*>\s*/gi, "");
    next = next.replace(/<link[^>]*href="https:\/\/fonts\.googleapis\.com\/[^"]*"[^>]*>\s*/gi, "");
  }
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
