import {
  ADDRESS_COUNTRY,
  ADDRESS_LINE,
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  ASK_AI_PROMPT,
  BRAND_COMPANY,
  BRAND_NAME,
  BRAND_PARENT,
  BRAND_PLACE,
  BRAND_URL,
  CALENDLY_URL,
  COMPANY_URL,
  CONSULT_DISPLAY,
  CONSULT_DISPLAY_SEO,
  CONTACT_EMAIL,
  CONTENT_LASTMOD,
  DANIEL_LINKEDIN_URL,
  FD_PRICE_LONG,
  HERO_H1,
  HERO_WHAT,
  HOME_DESCRIPTION,
  HOME_TITLE,
  LEGAL_NAME,
  LINKEDIN_URL,
  OTHER_HIVES,
  MARQUEE_NAME,
  MARQUEE_TAGLINE,
  MARQUEE_URL,
  PARENT_URL,
  POSTAL_CODE,
  STREET_ADDRESS,
  TAGLINE,
} from "./brand.ts";
import { SALE_APPS } from "./catalog.ts";
import { SEED_QUESTIONS } from "./ask.ts";
import { MARQUEE_FLOOR_CENTS } from "./marquee.ts";

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  bodyHtml: string;
  noindex?: boolean;
};

export const SITEMAP_STATIC_PATHS = ["/", "/about", "/board", "/apps"] as const;

export function shortAnswer(answer: string): string {
  const sentence = answer.split(/(?<=[.!?])\s+/)[0] ?? answer;
  return sentence.length > 220 ? `${sentence.slice(0, 217)}…` : sentence;
}

export function lastmodDate(iso?: string): string {
  const day = iso?.slice(0, 10);
  if (day && day > CONTENT_LASTMOD) return day;
  return CONTENT_LASTMOD;
}

export function identityHtml(): string {
  return `<p class="identity-facts">${BRAND_NAME} is the free Q&amp;A front door from ${BRAND_PARENT}. It is not the paid after-hours desk. Built by ${BRAND_COMPANY} in ${BRAND_PLACE}. Paid desk: <a href="${PARENT_URL}">${BRAND_PARENT}</a> — firstdeploy.ai — ${FD_PRICE_LONG}. Phone ${CONSULT_DISPLAY_SEO}.</p>`;
}

export function nightLineCtaHtml(): string {
  return `<p class="night-line-cta">Need the night line installed? <a href="${PARENT_URL}">${BRAND_PARENT}</a> — firstdeploy.ai — ${FD_PRICE_LONG}.</p>`;
}

export function boardQaHtml(): string {
  return `<dl class="board-qa">${SEED_QUESTIONS.map(
    (q) =>
      `<dt><a href="${canonicalFor(`/q/${q.slug}`)}">${escapeHtml(q.question)}</a></dt><dd>${escapeHtml(shortAnswer(q.answer))}</dd>`,
  ).join("")}</dl>`;
}

export const PAGE_SEO: SeoPage[] = [
  {
    path: "/",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    h1: HERO_H1,
    bodyHtml: `<main id="route-home" class="section"><div class="container"><h1 class="display">${HERO_H1}</h1><p class="lede">${HERO_WHAT}</p>${identityHtml()}<p>${TAGLINE} ${BRAND_NAME} is a ${BRAND_PARENT} product from ${BRAND_COMPANY} in ${BRAND_PLACE}. Search ChatGPT, Claude, Perplexity, Gemini, Grok, or Google about us, then ask your own question. Ranked questions live on the board. Apps for sale sit on /apps.</p><p><a href="${PARENT_URL}">Start ${BRAND_PARENT}</a> · <a href="${CALENDLY_URL}">Book the free 30</a> · ${CONSULT_DISPLAY_SEO}</p><h2>Most asked</h2>${boardQaHtml()}</div></main>`,
  },
  {
    path: "/board",
    title: "Ranked questions | AskYard",
    description: `Questions ranked by how many times people ask them on AskYard. ${HOME_DESCRIPTION}`,
    h1: "Ranked by how often people ask",
    bodyHtml: `<main id="route-board" class="section"><div class="container"><h1 class="display">Ranked by how often people ask</h1><p class="lede">Every AskYard question keeps a running count. The board sorts by asks so a plumber, a teacher, or a dispatcher can see what other people already needed.</p>${identityHtml()}<p><a href="${PARENT_URL}">${BRAND_PARENT}</a> is ${FD_PRICE_LONG}. Phone ${CONSULT_DISPLAY_SEO}.</p>${boardQaHtml()}</div></main>`,
  },
  {
    path: "/apps",
    title: "Apps for sale | AskYard",
    description: `The live ${BRAND_PARENT} shelf: First Deploy AI, JobProof, Flick, IndexMe.lol, and the rest of the AgentHive Inc apps you can buy. ${HOME_DESCRIPTION}`,
    h1: "Apps for sale",
    bodyHtml: `<main id="route-apps" class="section"><div class="container"><h1 class="display">Apps for sale</h1><p class="lede">Turn-and-burn prices. Buy the small tool, or start ${BRAND_PARENT} if the leak is the night phone.</p>${identityHtml()}<ul>${SALE_APPS.slice(
      0,
      8,
    )
      .map((app) => `<li><a href="${app.url}">${app.name}</a> — ${app.price}. ${app.blurb}</li>`)
      .join("")}</ul><h2>Shop-floor questions</h2>${boardQaHtml()}</div></main>`,
  },
  {
    path: "/about",
    title: "About AskYard | Free shop-floor AI answers from First Deploy",
    description: HOME_DESCRIPTION,
    h1: "About AskYard",
    bodyHtml: `<main id="route-about" class="section"><div class="container"><h1 class="display">About AskYard</h1><p class="lede">${BRAND_NAME} is the free Q&amp;A front door from ${BRAND_PARENT}. It is not the paid after-hours desk.</p>${identityHtml()}<p>${BRAND_COMPANY} / ${LEGAL_NAME} builds it in ${BRAND_PLACE}. ${BRAND_PARENT} is ${FD_PRICE_LONG}. Phone ${CONSULT_DISPLAY_SEO}. ${OTHER_HIVES} Distinct from other AgentHive names in insurance, OSS, or QpiAI.</p><p><a href="${PARENT_URL}">${BRAND_PARENT}</a> · <a href="${COMPANY_URL}">${BRAND_COMPANY}</a> · <a href="${CALENDLY_URL}">Book the free 30</a></p><h2>Board questions</h2>${boardQaHtml()}</div></main>`,
  },
  {
    path: "/hunt",
    title: "Answer people in public | AskYard",
    description: `Find people already asking AI questions. Copy a free AskYard answer with a link back to askyard.firstdeploy.ai.`,
    h1: "Answer people where they already ask",
    bodyHtml: `<main id="route-hunt" class="section"><div class="container"><h1 class="display">Answer people where they already ask</h1><p class="lede">We watch public threads for plumbers, teachers, receptionists, and crews looking for AI help. Copy a plain answer. Leave a link back to AskYard. That is how the name lands in the models for free.</p><p>Start on the hunt board, then search ChatGPT, Claude, Perplexity, Gemini, Grok, or Google about AskYard.</p></div></main>`,
  },
  {
    path: "/rep",
    title: "Reputation meter | AskYard",
    description: `Search a name. See the AskYard meter. Public HN hits plus helpful/missed votes on answers. Chrome toolbar for instant lookup if something rough is posted about you.`,
    h1: "Search a name. See the meter.",
    bodyHtml: `<main id="route-rep" class="section"><div class="container"><h1 class="display">Search a name. See the meter.</h1><p class="lede">Instant lookup if something rough is posted in public. AskYard votes plus public HN hits. A lookup, not a verdict. Chrome load-unpacked toolbar at /extension.</p><p>Then buy the lights on <a href="${MARQUEE_URL}">${MARQUEE_NAME}</a> if you want the paid crown.</p></div></main>`,
  },
  {
    path: "/marquee",
    title: `${MARQUEE_NAME} — ${MARQUEE_TAGLINE}`,
    description: `${MARQUEE_TAGLINE} Name-your-price bid, floor $20. Highest sits at #1. The next bid takes the crown. No refunds. ${MARQUEE_URL}`,
    h1: MARQUEE_TAGLINE,
    bodyHtml: `<main id="route-marquee" class="section"><div class="container"><h1 class="display">${MARQUEE_TAGLINE}</h1><p class="lede">Founders would die for the name in lights. You type the dollar amount. Checkout charges that amount. Floor $${MARQUEE_FLOOR_CENTS / 100}. The next bid knocks you off. No refunds.</p><p>Lookup is free on <a href="${BRAND_URL}/rep">/rep</a>. The chart is paid vanity.</p></div></main>`,
  },
  {
    path: "/marquee/thanks",
    title: `Thanks | ${MARQUEE_NAME}`,
    description: `Your name is on the ${MARQUEE_NAME} lights. The next bid can take the crown.`,
    h1: "You bought the lights.",
    bodyHtml: `<main id="route-marquee-thanks" class="section"><div class="container"><h1 class="display">You bought the lights.</h1><p>The next founder who wants it more can take the crown.</p></div></main>`,
    noindex: true,
  },
];

export const NOT_FOUND_SEO: SeoPage = {
  path: "/404",
  title: "Page not found | AskYard",
  description: `That path is not an AskYard page. Ask a question, open the ranked board, or see apps for sale.`,
  h1: "This page is not on AskYard",
    bodyHtml: `<main id="route-404" class="section"><div class="container"><h1 class="display">This page is not on AskYard</h1><p>Home, the ranked board, apps for sale, and the hunt are live.</p></div></main>`,
  noindex: true,
};

export function sitemapEntries(): Array<{ loc: string; lastmod: string }> {
  const staticEntries = SITEMAP_STATIC_PATHS.map((path) => ({
    loc: canonicalFor(path),
    lastmod: lastmodDate(),
  }));
  const questionEntries = SEED_QUESTIONS.map((q) => ({
    loc: canonicalFor(`/q/${q.slug}`),
    lastmod: lastmodDate(q.updatedAt),
  }));
  return [...staticEntries, ...questionEntries];
}

export function sitemapXml(): string {
  const urls = sitemapEntries().map(
    (entry) => `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function canonicalFor(path: string): string {
  if (path === "/") return `${BRAND_URL}/`;
  return `${BRAND_URL}${path}`;
}

export function pageForPath(pathname: string): SeoPage {
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "") || "/";
  if (path.startsWith("/q/")) {
    const slug = path.slice(3);
    const q = SEED_QUESTIONS.find((item) => item.slug === slug);
    if (q) {
      return {
        path,
        title: `${q.question} | AskYard`,
        description: `${q.question} ${shortAnswer(q.answer)}`.slice(0, 160),
        h1: q.question,
        bodyHtml: `<main id="route-answer" class="section"><div class="container"><h1 class="display">${escapeHtml(q.question)}</h1><p>Asked ${q.asks} times on AskYard, the free Q&amp;A front door from ${BRAND_PARENT}.</p><p>${escapeHtml(q.answer)}</p>${nightLineCtaHtml()}<p>Built by ${BRAND_COMPANY} in ${BRAND_PLACE}. Phone ${CONSULT_DISPLAY_SEO}.</p></div></main>`,
      };
    }
  }
  return PAGE_SEO.find((page) => page.path === path) ?? NOT_FOUND_SEO;
}

export function organizationJsonLd() {
  const orgId = `${BRAND_URL}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": orgId,
        name: BRAND_NAME,
        url: `${BRAND_URL}/`,
        applicationCategory: "BusinessApplication",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: `${TAGLINE} ${HERO_WHAT}`,
        provider: {
          "@type": "Organization",
          name: BRAND_COMPANY,
          legalName: LEGAL_NAME,
          url: COMPANY_URL,
          email: CONTACT_EMAIL,
          telephone: CONSULT_DISPLAY,
          address: {
            "@type": "PostalAddress",
            streetAddress: STREET_ADDRESS,
            addressLocality: ADDRESS_LOCALITY,
            addressRegion: ADDRESS_REGION,
            postalCode: POSTAL_CODE,
            addressCountry: ADDRESS_COUNTRY,
          },
          sameAs: [DANIEL_LINKEDIN_URL, LINKEDIN_URL, PARENT_URL, COMPANY_URL],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${BRAND_URL}/#faq`,
        mainEntity: SEED_QUESTIONS.slice(0, 8).map((q) => ({
          "@type": "Question",
          name: q.question,
          answerCount: q.asks,
          acceptedAnswer: { "@type": "Answer", text: q.answer },
        })),
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

export { ASK_AI_PROMPT, ADDRESS_LINE };
