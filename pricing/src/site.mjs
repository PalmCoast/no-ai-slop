import {
  DEFAULT_QUERY,
  MODELS,
  PRICE_AS_OF,
  PROVIDERS,
  UPDATED,
  comparisonBody,
  comparisonStats,
  ctx,
  esc,
  matrixBody,
  modelAnswer,
  modelById,
  money,
  perM,
  workedExample,
} from "./rates.mjs";

export const SITE = "https://aipricingcalculators.com";
export const INDEXNOW_KEY = "40602f6b-ecf3-406b-a8e5-2e9f601462b6";

const FONT = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";

export const FAQS = [
  {
    q: "Is the calculator free?",
    a: "Yes. No signup and no paywall on this site. The paid offers are First Deploy AI, consult time, and the live apps listed on the page.",
  },
  {
    q: "How current are the model prices?",
    a: `They were read from official provider pages in ${PRICE_AS_OF}: OpenAI, Anthropic, Google Gemini, xAI, DeepSeek, and Mistral. Providers change rates. Confirm before you buy volume.`,
  },
  {
    q: "What does GPT-5.6 Sol cost?",
    a: "OpenAI’s short-context list price on this card is $4 per million input tokens and $20 per million output, with cached input at $0.40. Terra is $2 / $12. Luna is $0.20 / $1.20. Sol’s promotional framing on OpenAI’s page runs at least through 21 November 2026.",
  },
  {
    q: "What is a blended rate?",
    a: "Blended on this card is a 3:1 input-to-output mix: three parts input price plus one part output price, divided by four. It is a fast way to rank models on mixed work, not a quote for your exact prompt.",
  },
  {
    q: "Does the batch discount apply to every model?",
    a: "No. The monthly tab applies a 50% batch rate only where this card marks the model as listing a batch API. Grok and DeepSeek rows stay at list price when the batch box is checked.",
  },
  {
    q: "What is First Deploy, exactly?",
    a: "The after-hours desk and live apps for field operators. $1,750 setup, live this week on a written plan, then $250/month. Half the setup ($875) can start the job. Details live on firstdeploy.ai.",
  },
  {
    q: "How does consult billing work?",
    a: "Book a free 30-minute qualifier. After that: $75 per 30 minutes, $150 per hour, or a 10-hour pack at $1,250 with $625 due up front. Stripe links are on this page and on firstdeploy.ai/consult.",
  },
  {
    q: "Do you name customers?",
    a: "No. The public proof line is live apps in production for field operators.",
  },
];

const OFFERS = [
  {
    meta: "Flick",
    title: "Skip the meeting",
    price: "Street $0 · Lights $19/mo · Marquee $99",
    body: "Record and send without making the other person create an account first.",
    href: "https://flick.firstdeploy.ai/",
    label: "Open Flick",
  },
  {
    meta: "JobProof",
    title: "Proof the job happened",
    price: "Solo $49/mo · Crew $99/mo",
    body: "Photos, timestamps, and a record the crew can leave and the customer can see.",
    href: "https://jobproof.firstdeploy.ai/",
    label: "Open JobProof",
  },
  {
    meta: "TONIGHT",
    title: "Tonight’s callback texts",
    price: "$19.99 one-time",
    body: "Paste today’s missed calls. Get every text to send before you lock up.",
    href: "https://send-tonight.netlify.app/",
    label: "Open TONIGHT",
  },
  {
    meta: "RateTrap",
    title: "See the yearly card leak",
    price: "$29.99 one-time",
    body: "Paste last month’s card volume and what the processor kept. Effective rate, published bands, yearly leak versus 2.5%.",
    href: "https://ratetrap.netlify.app/",
    label: "Open RateTrap",
  },
  {
    meta: "IndexMe",
    title: "Built it? Get it found.",
    price: "Pro $19.99 · Studio $29.99",
    body: "Indexing desk: IndexNow, search-console steps, crawler files.",
    href: "https://indexme.lol/",
    label: "Open IndexMe",
    extra: [
      ["https://buy.stripe.com/4gMcN52Ese5ldL7cyu2ZO1a", "Buy Pro $19.99"],
      ["https://buy.stripe.com/aFa00jfre2mD8qN5622ZO1b", "Buy Studio $29.99"],
    ],
  },
  {
    meta: "Bot Lock",
    title: "Lock down what bots can do",
    price: "Field Kit $49 · Pro $149",
    body: "Least privilege, audit, and deny-by-default tools for AI agents.",
    href: "https://bot-lock.netlify.app/",
    label: "Open Bot Lock",
    extra: [
      ["https://buy.stripe.com/00weVdcf24uLbCZfKG2ZO1c", "Field Kit $49"],
      ["https://buy.stripe.com/00w6oH1Aof9pdL7dCy2ZO1d", "Pro $149"],
    ],
  },
];

function canonical(path) {
  if (path === "/") return `${SITE}/`;
  return `${SITE}${path.endsWith("/") ? path : `${path}/`}`;
}

function jsonLdScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

function orgNode() {
  return {
    "@type": "Organization",
    "@id": "https://agenthiveinc.com/#organization",
    name: "AgentHive Inc",
    legalName: "AGENTHIVEINCCOM LLC",
    url: "https://agenthiveinc.com/",
    email: "daniel@agenthiveinc.com",
    telephone: "+1-320-335-6186",
    address: {
      "@type": "PostalAddress",
      streetAddress: "95 Barrington Drive",
      addressLocality: "Palm Coast",
      addressRegion: "FL",
      postalCode: "32137",
      addressCountry: "US",
    },
    sameAs: [
      "https://agenthiveinc.com/",
      "https://firstdeploy.ai/",
      "https://www.linkedin.com/company/agenthiveinc",
    ],
  };
}

function faqNode(faqs, pageUrl) {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function crumbs(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

const MARK = `<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#050403"/><polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="none" stroke="#e4b84a" stroke-width="3"/><polygon points="32,16 44,23 44,37 32,44 20,37 20,23" fill="#e4b84a"/></svg>`;

function shell({ path, title, description, body, jsonLd, noindex = false }) {
  const url = canonical(path);
  const robots = noindex ? "noindex, follow" : "index, follow, max-image-preview:large";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="Daniel Graham, AgentHive Inc">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${url}">
  <link rel="describedby" href="${SITE}/llms.txt">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#050403">
  <meta property="og:site_name" content="AI Pricing Calculators">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/og.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="AI Pricing Calculators on the AgentHive gold honeycomb. Know the API bill before you buy the desk.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${SITE}/og.png">
  <meta name="twitter:image:alt" content="AI Pricing Calculators on the AgentHive gold honeycomb.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONT}" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  ${jsonLdScript(jsonLd)}
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <div class="honeycomb" aria-hidden="true"></div>
  ${header(path)}
  <main id="main">${body}</main>
  ${footer()}
</body>
</html>
`;
}

function header(path) {
  const item = (href, label) => {
    const on = path === href || (href !== "/" && path.startsWith(href));
    return `<a href="${href}"${on ? ' aria-current="page"' : ""}>${label}</a>`;
  };
  return `<div class="mast">
    <div class="wrap mast-inner">
      <span>First Deploy / AgentHive <a href="tel:+13203356186">+1 320-335-6186</a></span>
      <a href="https://calendly.com/coltsinsider/30min">Free 30-minute qualifier</a>
    </div>
  </div>
  <header class="topbar">
    <div class="wrap nav">
      <a class="brand" href="/">${MARK}<span><span class="brand-name">AI Pricing Calculators</span><span class="brand-sub">AgentHive Inc · Palm Coast</span></span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span><span class="sr">Menu</span></button>
      <nav id="site-nav" class="nav-links" aria-label="Primary">
        ${item("/#calculator", "Calculator")}
        ${item("/models/", "Models")}
        ${item("/guide/", "Rate card")}
        <a href="https://firstdeploy.ai/">First Deploy</a>
        <a class="btn btn-primary" href="https://firstdeploy.ai/">Start First Deploy</a>
      </nav>
    </div>
  </header>`;
}

function footer() {
  return `<footer>
    <div class="wrap foot-grid">
      <div>
        <div class="foot-brand">AI Pricing Calculators</div>
        <p>Free LLM rate card from AgentHive Inc in Palm Coast. The calculator is the door. First Deploy AI and consult time are the paid work.</p>
      </div>
      <div>
        <strong>Call</strong>
        <ul>
          <li><a href="tel:+13203356186">+1 320-335-6186</a></li>
          <li><a href="mailto:daniel@agenthiveinc.com">daniel@agenthiveinc.com</a></li>
          <li><a href="https://calendly.com/coltsinsider/30min">Book the free 30</a></li>
        </ul>
      </div>
      <div>
        <strong>On this card</strong>
        <ul>
          <li><a href="/models/">Every model price</a></li>
          <li><a href="/guide/">How the bill works</a></li>
          <li><a href="/llms.txt">llms.txt</a></li>
          <li><a href="/sitemap.xml">Sitemap</a></li>
        </ul>
      </div>
      <div>
        <strong>The hive</strong>
        <ul>
          <li><a href="https://agenthiveinc.com/">AgentHive Inc</a></li>
          <li><a href="https://firstdeploy.ai/">firstdeploy.ai</a></li>
          <li><a href="https://firstdeploy.ai/consult">Consult</a></li>
          <li><a href="https://agenthiveinc.com/rankings">Live rankings</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap legal">
      <p>AgentHive Inc / AGENTHIVEINCCOM LLC · 95 Barrington Drive, Palm Coast, FL 32137. Model prices are planning figures from provider list pages in ${PRICE_AS_OF}, not a quote. Product prices are the live offers on this page. Card updated ${UPDATED}.</p>
    </div>
  </footer>`;
}

function faqHtml(faqs) {
  return `<div class="faq">${faqs.map((item, index) => `<details class="faq-item"${index === 0 ? " open" : ""}>
    <summary>${esc(item.q)}</summary>
    <p>${esc(item.a)}</p>
  </details>`).join("")}</div>`;
}

function offerCards() {
  return OFFERS.map((offer) => {
    const extra = (offer.extra || []).map(([href, label]) => `<a class="btn btn-ghost" href="${href}">${esc(label)}</a>`).join("");
    return `<article class="offer">
      <p class="meta">${esc(offer.meta)}</p>
      <h3>${esc(offer.title)}</h3>
      <p class="price">${esc(offer.price)}</p>
      <p>${esc(offer.body)}</p>
      <div class="offer-actions"><a class="btn btn-primary" href="${offer.href}">${esc(offer.label)}</a>${extra}</div>
    </article>`;
  }).join("");
}

export function homeHtml() {
  const stats = comparisonStats(DEFAULT_QUERY);
  const example = workedExample();
  const title = "AI Pricing Calculators — free LLM API prices";
  const description = `Free calculator for the ${PRICE_AS_OF} list prices on GPT-5.6, Claude, Gemini, Grok, DeepSeek, and Mistral. Cache and batch included. Then First Deploy AI, $1,750 setup, $250/mo.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgNode(),
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: `${SITE}/`,
        name: "AI Pricing Calculators",
        description,
        publisher: { "@id": "https://agenthiveinc.com/#organization" },
        inLanguage: "en-US",
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE}/#app`,
        name: "AI Pricing Calculators",
        url: `${SITE}/`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript for live recalculation. Prices are also in the HTML.",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description,
        dateModified: UPDATED,
        provider: { "@id": "https://agenthiveinc.com/#organization" },
        featureList: [
          "Monthly API cost from tokens, calls, cache hit rate, and batch",
          "Paste-to-token estimate at about 4 characters per token",
          "List-price matrix with a 3:1 blended rate",
          "Self-host GPU floor versus API",
          "Flat seat versus pay-as-you-go break-even",
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${SITE}/#webpage`,
        url: `${SITE}/`,
        name: title,
        description,
        dateModified: UPDATED,
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${SITE}/#app` },
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".answer-lead"] },
        primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}/og.png` },
      },
      faqNode(FAQS, `${SITE}/`),
      crumbs([{ name: "AI Pricing Calculators", url: `${SITE}/` }]),
    ],
  };
  const chips = [
    ["GPT-5.6 Sol", "$4 / $20"],
    ["Claude Fable 5", "$10 / $50"],
    ["Gemini 3.1 Flash-Lite", "$0.25 / $1.50"],
  ].map(([name, price]) => `<li><span>${name}</span><b>${price}</b></li>`).join("");

  const body = `
    <section class="hero">
      <div class="hero-media">
        <img src="/hero.jpg" alt="Gold honeycomb and dark angular craft on black, the AgentHive art direction." width="1280" height="720">
      </div>
      <div class="wrap hero-copy">
        <p class="eyebrow"><span class="dot"></span> AgentHive Inc · Palm Coast · ${PRICE_AS_OF} list prices</p>
        <h1>Know the API bill before you buy the desk.</h1>
        <p class="lede answer-lead">AI Pricing Calculators is the free LLM rate card from AgentHive Inc in Palm Coast. It prices a workload on the ${PRICE_AS_OF} list rates for GPT-5.6, Claude, Gemini, Grok, DeepSeek, and Mistral, with cache and batch where the provider lists them.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="https://firstdeploy.ai/">First Deploy, $1,750 setup</a>
          <a class="btn btn-outline" href="https://calendly.com/coltsinsider/30min">Book a free 30</a>
          <a class="btn btn-ghost" href="#calculator">Open the calculator</a>
        </div>
        <ul class="chips" aria-label="Sample list prices per million tokens, input / output">${chips}</ul>
        <p class="proof">Live apps in production for field operators. First Deploy is $1,750 setup, then $250/month.</p>
      </div>
    </section>

    <section class="section" id="calculator">
      <div class="wrap">
        <p class="kicker">The rate card</p>
        <h2>Estimate the monthly API cost</h2>
        <p class="section-lead">Enter a workload. The table ranks the ${PRICE_AS_OF} list prices. Treat the number as a planning figure and confirm it on the provider’s page before you commit spend. The same prices are on <a href="/models/">each model page</a> for anyone who does not run JavaScript.</p>
        <div class="calc-shell">
          <div class="tabs" role="tablist" aria-label="Calculator">
            <button class="tab" id="tab-cost" type="button" role="tab" aria-selected="true" aria-controls="panel-cost" data-panel="panel-cost" tabindex="0">Monthly cost</button>
            <button class="tab" id="tab-tokens" type="button" role="tab" aria-selected="false" aria-controls="panel-tokens" data-panel="panel-tokens" tabindex="-1">Token paste</button>
            <button class="tab" id="tab-matrix" type="button" role="tab" aria-selected="false" aria-controls="panel-matrix" data-panel="panel-matrix" tabindex="-1">Price matrix</button>
            <button class="tab" id="tab-self" type="button" role="tab" aria-selected="false" aria-controls="panel-self" data-panel="panel-self" tabindex="-1">Self-host</button>
            <button class="tab" id="tab-sub" type="button" role="tab" aria-selected="false" aria-controls="panel-sub" data-panel="panel-sub" tabindex="-1">Subscription</button>
          </div>
          <div class="panel active" id="panel-cost" role="tabpanel" aria-labelledby="tab-cost">
            <form id="calc-form" class="grid-2">
              <div class="field"><label for="in-tokens">Input tokens / request</label><input id="in-tokens" name="in" type="number" min="0" step="1" value="1000" inputmode="numeric"></div>
              <div class="field"><label for="out-tokens">Output tokens / request</label><input id="out-tokens" name="out" type="number" min="0" step="1" value="500" inputmode="numeric"></div>
              <div class="field"><label for="calls-day">Calls / day</label><input id="calls-day" name="calls" type="number" min="0" step="1" value="100" inputmode="numeric"></div>
              <div class="field"><label for="days-month">Days / month</label><input id="days-month" name="days" type="number" min="1" max="31" step="1" value="30" inputmode="numeric"></div>
              <div class="field">
                <label for="cache-hit">Cache hit rate <span id="cache-readout">0%</span></label>
                <input id="cache-hit" name="cache" type="range" min="0" max="100" step="1" value="0">
              </div>
              <div class="field">
                <label for="provider">Provider</label>
                <select id="provider" name="provider">
                  <option value="all">All listed providers</option>
                  <option>OpenAI</option>
                  <option>Anthropic</option>
                  <option>Google</option>
                  <option>xAI</option>
                  <option>DeepSeek</option>
                  <option>Mistral</option>
                </select>
                <label class="check"><input id="batch" name="batch" type="checkbox"> Batch API (50% where the provider lists it)</label>
              </div>
            </form>
            <div class="stats" aria-live="polite">
              <div class="stat"><b id="stat-requests">${esc(stats.requests)}</b><span>Requests / month</span></div>
              <div class="stat"><b id="stat-cheap">${esc(stats.cheap)}</b><span>Lowest monthly</span></div>
              <div class="stat"><b id="stat-save">${esc(stats.save)}</b><span>Spread versus highest</span></div>
            </div>
            <div class="table-wrap">
              <table id="cmp-table">
                <caption class="sr">Monthly cost at 1,000 input tokens, 500 output tokens, 100 calls a day, 30 days, no cache, no batch</caption>
                <thead><tr>
                  <th scope="col" data-key="name" aria-sort="none"><button type="button">Model</button></th>
                  <th scope="col" data-key="provider" aria-sort="none"><button type="button">Provider</button></th>
                  <th scope="col" data-key="in" aria-sort="none"><button type="button">Input / 1M</button></th>
                  <th scope="col" data-key="out" aria-sort="none"><button type="button">Output / 1M</button></th>
                  <th scope="col" data-key="ctx" aria-sort="none"><button type="button">Context</button></th>
                  <th scope="col" data-key="call" aria-sort="none"><button type="button">Cost / request</button></th>
                  <th scope="col" data-key="mo" aria-sort="none"><button type="button">Monthly</button></th>
                </tr></thead>
                <tbody id="cmp-body">${comparisonBody(DEFAULT_QUERY)}</tbody>
              </table>
            </div>
            <div id="use-cases" class="use-cases" aria-label="Example workloads"></div>
            <p class="note">About 750 English words is 1,000 tokens. Output is often the larger line on the rate card, so long replies move the bill more than long prompts. <button type="button" class="text-btn" id="share">Copy a link to this workload</button> <span id="share-status" role="status"></span></p>
          </div>
          <div class="panel" id="panel-tokens" role="tabpanel" aria-labelledby="tab-tokens" hidden>
            <div class="grid-2">
              <div class="field">
                <label for="token-text">Paste a prompt or document</label>
                <textarea id="token-text" placeholder="Paste here. The estimate is about 4 characters per English token."></textarea>
              </div>
              <div>
                <div class="field"><label for="token-out">Expected output tokens</label><input id="token-out" type="number" min="0" value="400"></div>
                <div class="field"><label for="token-copies">Copies of this call</label><input id="token-copies" type="number" min="1" value="1"></div>
                <div class="stats">
                  <div class="stat"><b id="tok-count">0</b><span id="tok-meta">0 chars · 0 words</span></div>
                  <div class="stat"><b id="tok-cheap">—</b><span>Lowest / call</span></div>
                </div>
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <caption class="sr">Cost of the pasted text by model</caption>
                <thead><tr><th scope="col">Model</th><th scope="col">Input / 1M</th><th scope="col">Output / 1M</th><th scope="col">Cost / call</th><th scope="col">Cost × copies</th></tr></thead>
                <tbody id="token-body"><tr><td colspan="5">Paste text to estimate tokens.</td></tr></tbody>
              </table>
            </div>
          </div>
          <div class="panel" id="panel-matrix" role="tabpanel" aria-labelledby="tab-matrix" hidden>
            <p class="note flat">Blended is a 3:1 input-to-output mix, a fast way to rank models on mixed work. Cache and batch in this column follow the monthly tab.</p>
            <div class="table-wrap">
              <table id="matrix-table">
                <caption class="sr">List prices per million tokens</caption>
                <thead><tr>
                  <th scope="col" aria-sort="none"><button type="button">Model</button></th>
                  <th scope="col" aria-sort="none"><button type="button">Provider</button></th>
                  <th scope="col" aria-sort="none"><button type="button">Input / 1M</button></th>
                  <th scope="col" aria-sort="none"><button type="button">Output / 1M</button></th>
                  <th scope="col" aria-sort="none"><button type="button">Cached in / 1M</button></th>
                  <th scope="col" aria-sort="none"><button type="button">Context</button></th>
                  <th scope="col" aria-sort="none"><button type="button">Blended / 1M</button></th>
                  <th scope="col" aria-sort="none"><button type="button">Batch listed</button></th>
                </tr></thead>
                <tbody id="matrix-body">${matrixBody(DEFAULT_QUERY)}</tbody>
              </table>
            </div>
          </div>
          <div class="panel" id="panel-self" role="tabpanel" aria-labelledby="tab-self" hidden>
            <form id="gpu-box" class="grid-2">
              <div class="field"><label for="gpu-hour">GPU rental ($ / hour)</label><input id="gpu-hour" type="number" min="0" step="0.1" value="3"></div>
              <div class="field"><label for="gpu-tps">Sustained tokens / second</label><input id="gpu-tps" type="number" min="0" value="80"></div>
              <div class="field"><label for="gpu-util">Utilization when you are paying the hour</label><input id="gpu-util" type="number" min="1" max="100" value="40"></div>
              <div class="field"><label for="gpu-model">Compare to API model</label><select id="gpu-model"></select></div>
            </form>
            <div class="stats">
              <div class="stat"><b id="self-cost">—</b><span>Self-host / 1M tokens</span></div>
              <div class="stat"><b id="api-cost">—</b><span>API blended / 1M</span></div>
              <div class="stat"><b id="self-be">—</b><span>Tokens / month where rent equals that API</span></div>
            </div>
            <p class="note" id="self-note"></p>
          </div>
          <div class="panel" id="panel-sub" role="tabpanel" aria-labelledby="tab-sub" hidden>
            <form id="sub-box" class="grid-2">
              <div class="field"><label for="sub-seat">Flat monthly seat or plan ($)</label><input id="sub-seat" type="number" min="0" step="1" value="20"></div>
              <div class="field"><label for="sub-model">Pay-as-you-go model</label><select id="sub-model"></select></div>
            </form>
            <div class="stats">
              <div class="stat"><b id="sub-be">—</b><span>Tokens / month where API spend meets the seat</span></div>
              <div class="stat"><b id="sub-model-name">—</b><span>Comparison model, 3:1 blend, no cache, no batch</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="first-deploy">
      <div class="wrap">
        <p class="kicker">The desk</p>
        <h2>First Deploy AI, after-hours line and live apps</h2>
        <p class="section-lead">You run dirt, plants, or a shop. Jobs call after the office closes. Quotes die on the whiteboard. First Deploy takes that job and keeps it. Setup is $1,750. One leak live this week on a written plan. Then $250/month per company to keep the desk and the apps on.</p>
        <div class="pay-grid">
          <a class="pay" href="https://firstdeploy.ai/go/deposit?from=aiprice"><span class="amt">$875</span><span>Start with 50% of the $1,750 setup</span></a>
          <a class="pay" href="https://firstdeploy.ai/go/start?from=aiprice"><span class="amt">$1,750</span><span>Setup, pay in full</span></a>
          <a class="pay" href="https://firstdeploy.ai/pricing"><span class="amt">$250/mo</span><span>Desk per company, from go-live</span></a>
          <a class="pay" href="https://calendly.com/coltsinsider/30min"><span class="amt">Free</span><span>30-minute qualifier first</span></a>
        </div>
        <p class="note">The $1,750 setup is the desk and the live apps. Prompt tutoring and a consulting tour are billed as consult time, below.</p>
      </div>
    </section>

    <section class="section" id="notes">
      <div class="wrap">
        <p class="kicker">From the hive</p>
        <h2>Open comments</h2>
        <div class="notes">
          <article><p class="who"><a href="https://firstdeploy.ai/">First Deploy</a></p><blockquote>Know the LLM bill here, then buy the desk there. $1,750 setup, $250/month. Same live numbers.</blockquote></article>
          <article><p class="who"><a href="https://agenthiveinc.com/">AgentHive Inc</a></p><blockquote>This calculator is the free door into the hive. The swarm products sit one click away.</blockquote></article>
          <article><p class="who">Reed · AgentHive</p><blockquote>Daniel Graham built the free rate card so operators can see cost before they talk.</blockquote></article>
        </div>
      </div>
    </section>

    <section class="section" id="consult">
      <div class="wrap">
        <p class="kicker">Paid time</p>
        <h2>Consult, an operator in the room</h2>
        <p class="section-lead">Free 30-minute qualifier. Then paid time, or a fixed First Deploy if the leak is clear. Book the free 30 on Calendly. Pay on Stripe when it is paid time.</p>
        <div class="consult-rates">
          <article class="rate"><strong>$75</strong><span>30 minutes, after the qualifier</span><a class="btn btn-primary btn-wide" href="https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h">Pay $75</a></article>
          <article class="rate"><strong>$150</strong><span>One hour</span><a class="btn btn-primary btn-wide" href="https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g">Pay $150</a></article>
          <article class="rate"><strong>$625 up front</strong><span>Half of the $1,250 / 10-hour pack</span><a class="btn btn-primary btn-wide" href="https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i">Pay $625 deposit</a></article>
        </div>
        <div class="cta-row">
          <a class="btn btn-primary" href="https://calendly.com/coltsinsider/30min">Book the free 30</a>
          <a class="btn btn-outline" href="https://firstdeploy.ai/consult">Read the consult page</a>
        </div>
      </div>
    </section>

    <section class="section" id="offers">
      <div class="wrap">
        <p class="kicker">Live apps</p>
        <h2>The rest of the board</h2>
        <p class="section-lead">These are the live products. Prices and URLs match the public pages.</p>
        <div class="offers">${offerCards()}</div>
      </div>
    </section>

    <section class="section" id="guide">
      <div class="wrap">
        <p class="kicker">How the rate card works</p>
        <h2>What the calculator is modeling</h2>
        <p class="section-lead">APIs bill by the token, about 4 characters, or about three-quarters of an English word. You pay separately for input (prompt, system text, documents) and output (the reply). Almost every provider charges more for output.</p>
        <h3>Levers that move a bill</h3>
        <ul class="levers">
          <li><strong>Model choice.</strong> Claude Fable 5 lists at $10 / $50 per million. Gemini 3.1 Flash-Lite lists at $0.25 / $1.50.</li>
          <li><strong>Prompt caching.</strong> Repeated prefixes are often billed near 10% of the input rate on OpenAI, Anthropic, and Google. The cache slider models that.</li>
          <li><strong>Batch.</strong> Non-urgent work can run at half price where the provider lists a batch API. The monthly tab says so on the row.</li>
          <li><strong>Self-hosting.</strong> A rented GPU costs the same whether it is busy. The self-host tab shows a floor, and it tells you when one box cannot reach the break-even volume.</li>
        </ul>
        <h3>A worked example</h3>
        <p>1,000 input tokens and 500 output tokens, on ${esc(example.model.name)} at ${perM(example.model.input)} in / ${perM(example.model.output)} out per million: input is ${money(example.inputCost)}; output is ${money(example.outputCost)}. The call is ${money(example.cost.perCall)}. Output is three-quarters of that call. The full walk-through is on <a href="/guide/">the rate card page</a>.</p>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="wrap">
        <p class="kicker">Questions</p>
        <h2>Straight answers</h2>
        ${faqHtml(FAQS)}
      </div>
    </section>`;

  return shell({
    path: "/",
    title,
    description,
    body,
    jsonLd,
  }).replace("</body>", `  <script type="module" src="/app.js"></script>\n</body>`);
}

export function modelsIndexHtml() {
  const title = "LLM API list prices, September 2026 | AI Pricing Calculators";
  const description = `Every model on the AI Pricing Calculators card: input, cached input, output, context, and whether a batch API is listed. Prices read ${PRICE_AS_OF}.`;
  const rows = MODELS.map((model) => `<tr>
    <td><a href="/models/${esc(model.id)}/">${esc(model.name)}</a></td>
    <td>${esc(model.provider)}</td>
    <td class="num">${perM(model.input)}</td>
    <td class="num">${perM(model.cached)}</td>
    <td class="num">${perM(model.output)}</td>
    <td class="num">${ctx(model.context)}</td>
    <td>${model.batch ? "Yes" : "No"}</td>
  </tr>`).join("");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgNode(),
      {
        "@type": "CollectionPage",
        "@id": `${SITE}/models/#webpage`,
        url: `${SITE}/models/`,
        name: title,
        description,
        dateModified: UPDATED,
        isPartOf: { "@id": `${SITE}/#website` },
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".answer-lead"] },
      },
      crumbs([
        { name: "AI Pricing Calculators", url: `${SITE}/` },
        { name: "Models", url: `${SITE}/models/` },
      ]),
    ],
  };
  const body = `<section class="section page">
    <div class="wrap">
      <p class="kicker">List prices · ${PRICE_AS_OF}</p>
      <h1>Every model on the card</h1>
      <p class="lede answer-lead">These are the ${PRICE_AS_OF} list prices used by the free calculator at aipricingcalculators.com. Input, cached input, and output are US dollars per million tokens. Open a model for the one-sentence answer, or <a href="/#calculator">price a workload</a>.</p>
      <div class="table-wrap">
        <table>
          <caption class="sr">September 2026 list prices per million tokens</caption>
          <thead><tr><th scope="col">Model</th><th scope="col">Provider</th><th scope="col">Input / 1M</th><th scope="col">Cached in / 1M</th><th scope="col">Output / 1M</th><th scope="col">Context</th><th scope="col">Batch listed</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </section>`;
  return shell({ path: "/models/", title, description, body, jsonLd });
}

export function modelHtml(model) {
  const answer = modelAnswer(model);
  const source = PROVIDERS[model.provider];
  const title = `${model.name} API price: ${perM(model.input)} in / ${perM(model.output)} out`;
  const description = `${model.name} lists at ${perM(model.input)} per million input tokens and ${perM(model.output)} per million output tokens. ${PRICE_AS_OF} ${model.provider} list price. Free calculator.`;
  const siblings = MODELS.filter((item) => item.provider === model.provider && item.id !== model.id);
  const faqs = [
    { q: `What does ${model.name} cost?`, a: answer },
    {
      q: `Does ${model.name} list a batch discount on this card?`,
      a: model.batch
        ? `Yes. The monthly calculator applies 50% to input and output for ${model.name} when batch is checked.`
        : `No. Checking batch on the calculator leaves ${model.name} at list price.`,
    },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgNode(),
      {
        "@type": "WebPage",
        "@id": `${SITE}/models/${model.id}/#webpage`,
        url: `${SITE}/models/${model.id}/`,
        name: title,
        description: answer,
        dateModified: UPDATED,
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".answer-lead"] },
        isPartOf: { "@id": `${SITE}/#website` },
      },
      faqNode(faqs, `${SITE}/models/${model.id}/`),
      crumbs([
        { name: "AI Pricing Calculators", url: `${SITE}/` },
        { name: "Models", url: `${SITE}/models/` },
        { name: model.name, url: `${SITE}/models/${model.id}/` },
      ]),
    ],
  };
  const body = `<section class="section page">
    <div class="wrap narrow">
      <p class="kicker"><a href="/models/">Models</a> · ${esc(model.provider)} · ${PRICE_AS_OF}</p>
      <h1>${esc(model.name)} costs ${perM(model.input)} in and ${perM(model.output)} out per million tokens.</h1>
      <p class="lede answer-lead">${esc(answer)}</p>
      <dl class="rate-dl">
        <div><dt>Input / 1M</dt><dd>${perM(model.input)}</dd></div>
        <div><dt>Cached input / 1M</dt><dd>${perM(model.cached)}</dd></div>
        <div><dt>Output / 1M</dt><dd>${perM(model.output)}</dd></div>
        <div><dt>Context</dt><dd>${ctx(model.context)} tokens</dd></div>
        <div><dt>Batch listed</dt><dd>${model.batch ? "Yes, 50% in the calculator" : "No"}</dd></div>
      </dl>
      <div class="cta-row">
        <a class="btn btn-primary" href="/?provider=${encodeURIComponent(model.provider)}&model=${encodeURIComponent(model.id)}#calculator">Price a workload</a>
        <a class="btn btn-outline" href="${source.href}">${esc(source.label)}</a>
      </div>
      <h2>Same provider</h2>
      <ul class="sibling-list">${siblings.map((item) => `<li><a href="/models/${esc(item.id)}/">${esc(item.name)}</a> <span>${perM(item.input)} / ${perM(item.output)}</span></li>`).join("")}</ul>
      <h2>Straight answers</h2>
      ${faqHtml(faqs)}
    </div>
  </section>`;
  return shell({ path: `/models/${model.id}/`, title, description, body, jsonLd });
}

export function guideHtml() {
  const example = workedExample();
  const title = "How LLM API billing works | AI Pricing Calculators";
  const description = "Tokens, input versus output, prompt caching, batch APIs, and a worked GPT-5.6 Sol example. The free rate card from AgentHive Inc.";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgNode(),
      {
        "@type": "Article",
        "@id": `${SITE}/guide/#article`,
        headline: "How the LLM rate card bills",
        dateModified: UPDATED,
        datePublished: "2026-09-21",
        author: { "@type": "Person", name: "Daniel Graham", url: "https://agenthiveinc.com/about" },
        publisher: { "@id": "https://agenthiveinc.com/#organization" },
        mainEntityOfPage: `${SITE}/guide/`,
        description,
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".answer-lead"] },
      },
      crumbs([
        { name: "AI Pricing Calculators", url: `${SITE}/` },
        { name: "Rate card", url: `${SITE}/guide/` },
      ]),
    ],
  };
  const body = `<section class="section page">
    <div class="wrap narrow">
      <p class="kicker">Rate card · ${PRICE_AS_OF}</p>
      <h1>How the bill actually moves</h1>
      <p class="lede answer-lead">Large-language-model APIs bill by the token. A rough English rule is 4 characters, or about three-quarters of a word, per token. Input and output are priced apart, and output is usually the expensive side.</p>
      <h2>Input and output</h2>
      <p>Input is the prompt, the system text, and any documents you attach. Output is the reply. On ${esc(example.model.name)}, ${perM(example.model.input)} per million in and ${perM(example.model.output)} per million out means a short answer can cost more than a long prompt.</p>
      <h2>Worked example, ${esc(example.model.name)}</h2>
      <p>1,000 input tokens cost ${money(example.inputCost)}. 500 output tokens cost ${money(example.outputCost)}. The call is ${money(example.cost.perCall)}. Three-quarters of that call is output, even though the prompt was longer. Shortening replies is usually the fastest cut. At 100 calls a day for 30 days, that same shape is ${money(example.cost.perCall * 100 * 30)} a month before cache or batch.</p>
      <h2>Cache</h2>
      <p>Repeated prefixes are often billed near 10% of the input rate on OpenAI, Anthropic, and Google. The calculator mixes list input and cached input by the hit rate you set. It does not model cache writes, minimum sizes, or expiry.</p>
      <h2>Batch</h2>
      <p>Where the card says batch is listed, the monthly tab halves input and output. Grok and DeepSeek stay at list price, and the row says so.</p>
      <h2>Self-host floor</h2>
      <p>A GPU rented by the hour costs the same when it sits idle. The self-host tab divides that monthly rent by the tokens the box can actually serve at the utilization you enter. If the volume where rent equals the API price is larger than that capacity, one box never wins. The number is still a floor.</p>
      <p><a class="btn btn-primary" href="/#calculator">Run your numbers</a></p>
    </div>
  </section>`;
  return shell({ path: "/guide/", title, description, body, jsonLd });
}

export function notFoundHtml() {
  const title = "Page not found | AI Pricing Calculators";
  const description = "That path is not on the AI Pricing Calculators rate card. The calculator, model prices, and billing guide are.";
  const body = `<section class="section page">
    <div class="wrap narrow">
      <p class="kicker">404</p>
      <h1>This page is not on the rate card.</h1>
      <p class="lede">The calculator, the model prices, and the billing guide are the live pages.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="/">Calculator</a>
        <a class="btn btn-outline" href="/models/">Model prices</a>
        <a class="btn btn-ghost" href="/guide/">How billing works</a>
      </div>
    </div>
  </section>`;
  return shell({
    path: "/404",
    title,
    description,
    body,
    noindex: true,
    jsonLd: { "@context": "https://schema.org", "@graph": [orgNode()] },
  });
}

export function sitemapXml() {
  const paths = ["/", "/models/", "/guide/", ...MODELS.map((model) => `/models/${model.id}/`)];
  const urls = paths.map((path) => `  <url>\n    <loc>${canonical(path)}</loc>\n    <lastmod>${UPDATED}</lastmod>\n  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt() {
  const bots = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Googlebot", "Bingbot", "Twitterbot", "LinkedInBot"];
  const blocks = bots.map((bot) => `User-agent: ${bot}\nAllow: /\n`).join("\n");
  return `${blocks}\nUser-agent: *\nAllow: /\n\n# IndexNow: ${SITE}/${INDEXNOW_KEY}.txt\nSitemap: ${SITE}/sitemap.xml\n`;
}

export function llmsTxt() {
  const lines = MODELS.map((model) => `- [${model.name}](${SITE}/models/${model.id}/): ${perM(model.input)} in / ${perM(model.output)} out per 1M, cached ${perM(model.cached)}, ${model.provider}.`);
  return `# AI Pricing Calculators

> Free LLM API cost calculator from AgentHive Inc (AGENTHIVEINCCOM LLC) in Palm Coast, Florida. ${PRICE_AS_OF} list prices for GPT-5.6, Claude, Gemini, Grok, DeepSeek, and Mistral. The calculator is free. First Deploy AI is $1,750 setup ($875 to start), then $250/month. Consult is a free 30-minute qualifier, then $75 / 30 min, $150 / hour, or a 10-hour pack at $1,250.

AI Pricing Calculators (https://aipricingcalculators.com/) prices a workload before you buy tokens or a desk. Daniel Graham built the card. It is not agenthive.io (insurance) and not agenthive.co.

## This site
- [Calculator](${SITE}/): Monthly cost, token paste, price matrix, self-host floor, subscription break-even.
- [All models](${SITE}/models/): Every list price on one page.
- [How billing works](${SITE}/guide/): Tokens, cache, batch, and a GPT-5.6 Sol worked example.
- [Full rate card](${SITE}/llms-full.txt): Same prices in one file for answer engines.

## Prices on this card (${PRICE_AS_OF})
${lines.join("\n")}

## Company
- [AgentHive Inc](https://agenthiveinc.com/): Palm Coast shop that embeds working AI, then leaves it running.
- [First Deploy AI](https://firstdeploy.ai/): After-hours desk and live apps. $1,750 setup, then $250/month.
- [Consult](https://firstdeploy.ai/consult): Free 30-minute qualifier, then $75 / 30 min or $150 / hour.
- [Rankings](https://agenthiveinc.com/rankings): Live public apps from the same shop.

## Contact
- Book 30 minutes: https://calendly.com/coltsinsider/30min
- daniel@agenthiveinc.com
- +1 320-335-6186
- 95 Barrington Drive, Palm Coast, FL 32137
- IndexNow: ${SITE}/${INDEXNOW_KEY}.txt
`;
}

export function llmsFull() {
  const blocks = MODELS.map((model) => `## ${model.name}\n\n${modelAnswer(model)}\n\n- Provider: ${model.provider}\n- Input: ${perM(model.input)} / 1M\n- Cached input: ${perM(model.cached)} / 1M\n- Output: ${perM(model.output)} / 1M\n- Context: ${ctx(model.context)} tokens\n- Batch listed: ${model.batch ? "yes" : "no"}\n- Page: ${SITE}/models/${model.id}/\n- Source: ${PROVIDERS[model.provider].href}\n`);
  const example = workedExample();
  return `# AI Pricing Calculators, full rate card

Updated ${UPDATED}. List prices read ${PRICE_AS_OF}. Planning figures, not a quote.

Default workload on the homepage: 1,000 input tokens, 500 output tokens, 100 calls a day, 30 days, 0% cache, batch off.
At that workload, ${modelById("ds-v4-flash-off").name} is the lowest row on the card.
Worked call on ${example.model.name}: input ${money(example.inputCost)}, output ${money(example.outputCost)}, total ${money(example.cost.perCall)}.

${blocks.join("\n")}
## Offers that are actually for sale

- First Deploy AI: $1,750 setup, $875 to start, then $250/month. https://firstdeploy.ai/
- Consult: free 30, then $75 / 30 min, $150 / hour, 10-hour pack $1,250 with $625 up front. https://calendly.com/coltsinsider/30min
- Flick: Street $0, Lights $19/mo, Marquee $99. https://flick.firstdeploy.ai/
- JobProof: Solo $49/mo, Crew $99/mo. https://jobproof.firstdeploy.ai/
- TONIGHT: $19.99 one-time. https://send-tonight.netlify.app/
- RateTrap: $29.99 one-time. https://ratetrap.netlify.app/
- IndexMe: Pro $19.99, Studio $29.99. https://indexme.lol/
- Bot Lock: Field Kit $49, Pro $149. https://bot-lock.netlify.app/
`;
}

export function manifestJson() {
  return JSON.stringify({
    name: "AI Pricing Calculators",
    short_name: "AI Pricing",
    description: "Free LLM API cost calculator from AgentHive Inc.",
    start_url: "/",
    display: "standalone",
    background_color: "#050403",
    theme_color: "#050403",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  }, null, 2);
}

export function allModels() {
  return MODELS;
}

export function caseLabels() {
  return CASES.map((item) => item.label);
}
