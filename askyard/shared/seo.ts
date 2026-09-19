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
  CONTACT_EMAIL,
  FD_PRICE,
  FD_PROMISE,
  HERO_H1,
  HERO_WHAT,
  LEGAL_NAME,
  LINKEDIN_URL,
  PARENT_URL,
  POSTAL_CODE,
  STREET_ADDRESS,
  TAGLINE,
} from "./brand.ts";
import { SALE_APPS } from "./catalog.ts";
import { SEED_QUESTIONS } from "./ask.ts";

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
    title: "AskYard — free AI answers for the shop floor",
    description: `${HERO_H1} ${HERO_WHAT} ${BRAND_PARENT} is ${FD_PRICE}. ${FD_PROMISE}.`,
    h1: HERO_H1,
    bodyHtml: `<main id="route-home" class="section"><div class="container"><h1 class="display">${HERO_H1}</h1><p class="lede">${HERO_WHAT}</p><p>${TAGLINE} ${BRAND_NAME} is a ${BRAND_PARENT} product from ${BRAND_COMPANY} in ${BRAND_PLACE}. Search ChatGPT, Claude, Perplexity, Gemini, or Grok about us, then ask your own question. Ranked questions live on the board. Apps for sale sit on /apps.</p><p><a href="${PARENT_URL}">Start ${BRAND_PARENT}</a> · <a href="${CALENDLY_URL}">Book the free 30</a> · ${CONSULT_DISPLAY}</p></div></main>`,
  },
  {
    path: "/board",
    title: "Ranked questions | AskYard",
    description: `Questions ranked by how many times people ask them on AskYard. Running totals stay on the board so you can see what the shop floor actually wants.`,
    h1: "Ranked by how often people ask",
    bodyHtml: `<main id="route-board" class="section"><div class="container"><h1 class="display">Ranked by how often people ask</h1><p class="lede">Every AskYard question keeps a running count. The board sorts by asks so a plumber, a teacher, or a dispatcher can see what other people already needed.</p><ol>${SEED_QUESTIONS.slice(0, 6)
      .map((q) => `<li>${q.question} — asked ${q.asks} times</li>`)
      .join("")}</ol></div></main>`,
  },
  {
    path: "/apps",
    title: "Apps for sale | AskYard",
    description: `The live ${BRAND_PARENT} shelf: First Deploy AI, JobProof, Flick, IndexMe.lol, and the rest of the AgentHive Inc apps you can buy.`,
    h1: "Apps for sale",
    bodyHtml: `<main id="route-apps" class="section"><div class="container"><h1 class="display">Apps for sale</h1><p class="lede">Turn-and-burn prices. Buy the small tool, or start ${BRAND_PARENT} if the leak is the night phone.</p><ul>${SALE_APPS.slice(
      0,
      8,
    )
      .map((app) => `<li><a href="${app.url}">${app.name}</a> — ${app.price}. ${app.blurb}</li>`)
      .join("")}</ul></div></main>`,
  },
  {
    path: "/hunt",
    title: "Answer people in public | AskYard",
    description: `Find people already asking AI questions. Copy a free AskYard answer with a link back to askyard.firstdeploy.ai.`,
    h1: "Answer people where they already ask",
    bodyHtml: `<main id="route-hunt" class="section"><div class="container"><h1 class="display">Answer people where they already ask</h1><p class="lede">We watch public threads for plumbers, teachers, receptionists, and crews looking for AI help. Copy a plain answer. Leave a link back to AskYard. That is how the name lands in the models for free.</p><p>Start on the hunt board, then search ChatGPT, Claude, Perplexity, Gemini, or Grok about AskYard.</p></div></main>`,
  },
  {
    path: "/launch",
    title: "Launch plan | AskYard",
    description: `How AskYard gets in front of plumbers, teachers, receptionists, and earth movers without a big ad budget.`,
    h1: "Launch AskYard without a big ad buy",
    bodyHtml: `<main id="route-launch" class="section"><div class="container"><h1 class="display">Launch AskYard without a big ad buy</h1><p class="lede">The product is free answers plus an offer. Distribution is the LLM search bar, public replies with a backlink, and the First Deploy AI shop floor.</p><p>Full plan is on this page. Phone ${CONSULT_DISPLAY}.</p></div></main>`,
  },
];

export const NOT_FOUND_SEO: SeoPage = {
  path: "/404",
  title: "Page not found | AskYard",
  description: `That path is not an AskYard page. Ask a question, open the ranked board, or see apps for sale.`,
  h1: "This page is not on AskYard",
  bodyHtml: `<main id="route-404" class="section"><div class="container"><h1 class="display">This page is not on AskYard</h1><p>Home, the ranked board, apps for sale, the hunt, and the launch plan are live.</p></div></main>`,
  noindex: true,
};

export function sitemapXml(): string {
  const staticUrls = PAGE_SEO.map((page) => `  <url><loc>${canonicalFor(page.path)}</loc></url>`);
  const questionUrls = SEED_QUESTIONS.map((q) => `  <url><loc>${canonicalFor(`/q/${q.slug}`)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticUrls, ...questionUrls].join("\n")}\n</urlset>\n`;
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
        description: q.answer.slice(0, 160),
        h1: q.question,
        bodyHtml: `<main id="route-answer" class="section"><div class="container"><h1 class="display">${escapeHtml(q.question)}</h1><p>Asked ${q.asks} times.</p><p>${escapeHtml(q.answer)}</p></div></main>`,
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
          sameAs: [LINKEDIN_URL, PARENT_URL, COMPANY_URL],
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
