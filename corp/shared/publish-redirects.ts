// Lines written to dist/_redirects at the end of `npm run build`.
// On agenthiveinc.com, Netlify applies that file before netlify.toml, and the
// splat at the bottom shadows later rules. Every public 301 has to be in this
// list. Mirror the same from/to/status pairs in corp/netlify.toml.

export type PublishRedirect = {
  from: string;
  to: string;
  status: 301 | 302 | 200 | 404;
  force?: boolean;
};

export const PUBLISH_REDIRECTS: PublishRedirect[] = [
  // Legacy hub URLs linked across the portfolio (audit 2026-09-30).
  // Live site already 301s these to /about. Keep that target.
  { from: "/hive", to: "/about", status: 301, force: true },
  { from: "/hive/", to: "/about", status: 301, force: true },
  { from: "/hive.html", to: "/about", status: 301, force: true },
  { from: "/about.html", to: "/about", status: 301, force: true },

  // Bare /go has no product slug. /go/:name stays the click-tracker function.
  // /consult is the on-site page whose job is the book / call CTA.
  { from: "/go", to: "/consult", status: 301 },
  { from: "/go/", to: "/consult", status: 301 },

  // Calendly is external. /consult is the page that holds the book button.
  { from: "/book", to: "/consult", status: 301 },
  { from: "/book/", to: "/consult", status: 301 },

  // About is the page with the contact block: email, phone, address, Calendly.
  { from: "/contact", to: "/about", status: 301 },
  { from: "/contact/", to: "/about", status: 301 },

  // Concierge is the indexed page with the price section. /build lists First
  // Deploy prices but is noindex, so it is the wrong public pricing target.
  { from: "/pricing", to: "/concierge", status: 301 },
  { from: "/pricing/", to: "/concierge", status: 301 },

  // The live social card is /og.jpg. Do not ship a second image.
  { from: "/og.png", to: "/og.jpg", status: 301 },

  { from: "/about", to: "/about/index.html", status: 200, force: true },
  { from: "/about/", to: "/about/index.html", status: 200, force: true },
  { from: "/buzz", to: "/buzz/index.html", status: 200, force: true },
  { from: "/buzz/", to: "/buzz/index.html", status: 200, force: true },
  { from: "/rankings", to: "/rankings/index.html", status: 200, force: true },
  { from: "/rankings/", to: "/rankings/index.html", status: 200, force: true },
  { from: "/build", to: "/build/index.html", status: 200, force: true },
  { from: "/build/", to: "/build/index.html", status: 200, force: true },
  { from: "/consult", to: "/consult/index.html", status: 200, force: true },
  { from: "/consult/", to: "/consult/index.html", status: 200, force: true },
  { from: "/concierge", to: "/concierge/index.html", status: 200, force: true },
  { from: "/concierge/", to: "/concierge/index.html", status: 200, force: true },
  { from: "/concierge/vs-hiring", to: "/concierge/vs-hiring/index.html", status: 200, force: true },
  { from: "/concierge/vs-hiring/", to: "/concierge/vs-hiring/index.html", status: 200, force: true },
  { from: "/x", to: "/x/index.html", status: 200, force: true },
  { from: "/x/", to: "/x/index.html", status: 200, force: true },
  { from: "/*", to: "/404.html", status: 404 },
];

export function publishRedirectsFile(): string {
  return (
    PUBLISH_REDIRECTS.map((rule) => {
      const force = rule.force ? "!" : "";
      return `${rule.from} ${rule.to} ${rule.status}${force}`;
    }).join("\n") + "\n"
  );
}
