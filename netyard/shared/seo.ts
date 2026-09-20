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
    title: "NetYard — stand up a shop network without Microsoft Server",
    description: `${HERO_H1} ${HERO_WHAT} ${BRAND_PARENT} is ${FD_PRICE}. ${FD_PROMISE}.`,
    h1: HERO_H1,
    bodyHtml: `<main id="route-home" class="section"><div class="container"><h1 class="display">${HERO_H1}</h1><p class="lede">${HERO_WHAT}</p><p>${TAGLINE} ${BRAND_NAME} is a ${BRAND_PARENT} product from ${BRAND_COMPANY} in ${BRAND_PLACE}. Six questions. Addressing, Samba directory, guest Wi-Fi, VPN, shopping list, install scripts. No Windows Server CALs.</p><p><a href="${PARENT_URL}">Start ${BRAND_PARENT}</a> · <a href="${CALENDLY_URL}">Book the free 30</a> · ${CONSULT_DISPLAY}</p></div></main>`,
  },
  {
    path: "/plan",
    title: "Your network plan | NetYard",
    description: `The generated small-business LAN: VLANs, Samba AD or workgroup, firewall matrix, hardware list, and Debian install scripts.`,
    h1: "Your shop network",
    bodyHtml: `<main id="route-plan" class="section"><div class="container"><h1 class="display">Your shop network</h1><p class="lede">Addressing, directory, Wi-Fi, shopping list, and scripts. Download the files and walk the runbook. Email stays in Google Workspace or Microsoft 365.</p></div></main>`,
  },
  {
    path: "/tools",
    title: "Admin tools | NetYard",
    description: `Subnet calculator, VLAN cheat sheet, and the jobs a shop admin still does after the network is up — without Microsoft Server.`,
    h1: "Tools a shop admin actually uses",
    bodyHtml: `<main id="route-tools" class="section"><div class="container"><h1 class="display">Tools a shop admin actually uses</h1><p class="lede">CIDR math, DHCP ranges, and VLAN IDs. Pair them with a NetYard plan so you are not guessing 192.168.1.1 on a customer LAN.</p></div></main>`,
  },
  {
    path: "/compare",
    title: "Samba vs Microsoft Server | NetYard",
    description: `Windows Server Standard plus User CALs versus Samba on Debian. What you keep, what you give up, and when cloud-only is enough.`,
    h1: "Skip the CALs. Keep the domain join.",
    bodyHtml: `<main id="route-compare" class="section"><div class="container"><h1 class="display">Skip the CALs. Keep the domain join.</h1><p class="lede">Microsoft Small Business Server is gone. Essentials is gone. A 12-person shop still needs logins, a share, and guest Wi-Fi. Samba AD on Debian does that. You still pay for hardware and a UPS.</p></div></main>`,
  },
  {
    path: "/buy",
    title: "Pay on Stripe | NetYard",
    description: `Pay NetYard setup $1,500, the $250/mo desk, or consult time on Stripe. Live this week or you do not pay the setup.`,
    h1: "Pay for the rack, not another Server license.",
    bodyHtml: `<main id="route-buy" class="section"><div class="container"><h1 class="display">Pay for the rack, not another Server license.</h1><p class="lede">The wizard and scripts stay free. Stripe takes the $1,500 setup, the $250/mo desk, or consult time. ${FD_PROMISE}.</p></div></main>`,
  },
  {
    path: "/launch",
    title: "Launch | NetYard",
    description: `Watch the Harbor HVAC standup. Screenshots of the wizard, VLANs, install scripts, and Stripe buy. A First Deploy AI product.`,
    h1: "NetYard is live. Watch the standup.",
    bodyHtml: `<main id="route-launch" class="section"><div class="container"><h1 class="display">NetYard is live. Watch the standup.</h1><p class="lede">Six questions. A VLAN plan. Samba on Debian. Pay the rack on Stripe. Graphics and the Harbor HVAC video live on this page.</p></div></main>`,
  },
  {
    path: "/thanks",
    title: "Payment landed | NetYard",
    description: `Stripe checkout confirmation for NetYard setup, monthly desk, or consult time.`,
    h1: "Payment landed.",
    bodyHtml: `<main id="route-thanks" class="section"><div class="container"><h1 class="display">Payment landed.</h1><p class="lede">We rack from the plan you already generated. Keep the Stripe receipt.</p></div></main>`,
    noindex: true,
  },
];

export const NOT_FOUND_SEO: SeoPage = {
  path: "/404",
  title: "Page not found | NetYard",
  description: `That path is not a NetYard page. Start the wizard, open admin tools, or compare Samba with Microsoft Server.`,
  h1: "This page is not on NetYard",
    bodyHtml: `<main id="route-404" class="section"><div class="container"><h1 class="display">This page is not on NetYard</h1><p>Home, the plan, admin tools, Stripe buy, launch, and the Microsoft Server comparison are live.</p></div></main>`,
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
