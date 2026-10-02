// PostHog click tracking for agenthiveinc.com (project 598301, US cloud).
// The phc_ key is PostHog's public project token, made for browser code: it can only
// send events, never read data. Never put a personal/secret PostHog key here.
//
// Events:
//   $pageview  on load and on every SPA route change (history_change).
//   cta_click  on every buy link (buy.stripe.com, /go/*, firstdeploy.ai) and booking link
//              (calendly.com), sent with sendBeacon before the browser leaves the page.
//
// Agent/audit traffic: a visit with ?src=audit (or a webdriver/headless browser) is tagged
// audit=true for the browser session. In that mode, clicks on buy.stripe.com are stopped
// before they load (loading a Payment Link creates a real Checkout Session), and /go/*
// links get src=audit so the tracker answers without redirecting to Stripe.

const TOKEN = "phc_y9BPZxQLpF7FviUKN6JSBqSUD7fcnwXuXzHzDQ8asLjv";
const API_HOST = "https://us.i.posthog.com";

type PostHogLike = {
  init: (token: string, config: Record<string, unknown>) => void;
  register: (props: Record<string, unknown>) => void;
  capture: (event: string, props?: Record<string, unknown>, options?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    posthog?: PostHogLike;
  }
}

function loadSnippet(): void {
  /* eslint-disable */
  // Official PostHog web snippet (stub queue + async array.js loader).
  // @ts-ignore
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset identify setPersonProperties group get_distinct_id getFeatureFlag isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,(window as any).posthog||[]);
  /* eslint-enable */
}

/** checkout | booking | handoff | "" for a link we track. Exported for tests. */
export function ctaKind(href: string): "checkout" | "booking" | "handoff" | "" {
  let u: URL;
  try {
    u = new URL(href, "https://agenthiveinc.com/");
  } catch {
    return "";
  }
  if (u.hostname === "buy.stripe.com" || /^\/go\//.test(u.pathname)) return "checkout";
  if (/(^|\.)calendly\.com$/.test(u.hostname)) return "booking";
  if (/(^|\.)firstdeploy\.ai$/.test(u.hostname)) return "handoff";
  return "";
}

/** True when this browser session is an agent/audit run. Exported for tests. */
export function isAuditVisit(search: string, stored: string | null, webdriver: boolean, ua: string): boolean {
  const src = new URLSearchParams(search).get("src") || "";
  return /^audit/i.test(src) || stored === "1" || webdriver || /HeadlessChrome/i.test(ua);
}

export function initAnalytics(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  try {
    const audit = isAuditVisit(
      location.search,
      sessionStorage.getItem("ph_audit"),
      navigator.webdriver === true,
      navigator.userAgent,
    );
    if (audit) sessionStorage.setItem("ph_audit", "1");

    loadSnippet();
    // Always read window.posthog at call time: array.js swaps the stub for the real client.
    const ph = () => window.posthog!;
    ph().init(TOKEN, {
      api_host: API_HOST,
      person_profiles: "identified_only",
      capture_pageview: "history_change",
      autocapture: false,
      disable_session_recording: true,
    });
    ph().register({ site: location.hostname, audit });

    document.addEventListener(
      "click",
      (ev) => {
        const target = ev.target as Element | null;
        const a = target?.closest ? (target.closest("a[href]") as HTMLAnchorElement | null) : null;
        if (!a) return;
        const kind = ctaKind(a.href);
        if (!kind) return;
        const u = new URL(a.href, location.href);
        const go = u.pathname.match(/\/go\/([a-z0-9-]+)/i);
        ph().capture(
          "cta_click",
          {
            kind,
            cta: go ? go[1] : u.hostname === "buy.stripe.com" ? "stripe:" + u.pathname.slice(1, 12) : u.hostname,
            label: (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
            href: u.origin + u.pathname,
            page: location.pathname,
          },
          { send_instantly: true, transport: "sendBeacon" },
        );
        if (audit && kind === "checkout") {
          if (u.hostname === "buy.stripe.com") {
            ev.preventDefault();
            console.info("audit mode: not opening live Stripe link", u.origin + u.pathname);
          } else if (!u.searchParams.get("src")) {
            u.searchParams.set("src", "audit");
            a.href = u.toString();
          }
        }
      },
      true,
    );
  } catch {
    /* analytics must never break the page */
  }
}
