/**
 * Atlas buy-link helper (team reset Nov 18, 2026).
 * Appends client_reference_id + standard UTMs to every buy.stripe.com / known
 * Payment Link, and fires PostHog buy_click with { product } before navigate.
 *
 * Product map: /workspace/team-dashboard/stripe-product-map-2026-11-18.md
 * UTM convention: /workspace/team-dashboard/UTM-CONVENTION.md
 * Booking (replace Calendly): see /workspace/atlas-owned/BOOKING-URL.md
 *
 * Usage on a page:
 *   <script src="/assets/buy-link-helper.js" defer></script>
 *   <a href="https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g"
 *      data-product="audit150"
 *      data-utm-source="li"
 *      data-utm-medium="page"
 *      data-utm-content="marketing-home">Start with the $150 audit</a>
 *
 * Defaults: utm_campaign = data-product; client_reference_id from
 * ?lead_id= / data-lead-id / PostHog distinct_id / sessionStorage fd_lead.
 */
(function () {
  "use strict";
  try {
    var PRODUCT_URLS = {
      audit150: "https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g",
      pack1250: "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i",
      deploy1250: "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i",
      concierge2000: "https://buy.stripe.com/6oUeVd7YM3qH0Ylbuq2ZO1u",
      freight2500: "https://buy.stripe.com/5kQaEX1Ao4uL22p9mi2ZO1U"
    };
    var ALLOWED_SOURCE = { x: 1, li: 1, hn: 1, dir: 1, aisearch: 1, phone: 1, pin: 1 };
    var ALLOWED_MEDIUM = { post: 1, reply: 1, comment: 1, listing: 1, page: 1 };
    var ALLOWED_CAMPAIGN = {
      audit150: 1, pack1250: 1, deploy1250: 1, freight2500: 1,
      concierge2000: 1, bfmerch: 1, cardbutler: 1
    };

    function cleanId(s) {
      return String(s || "")
        .replace(/[^A-Za-z0-9_-]/g, "")
        .slice(0, 200);
    }
    function cleanUtm(s, max) {
      return String(s || "")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, max || 150);
    }
    function q() {
      try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); }
    }
    function resolveLeadId(el) {
      var fromAttr = el && el.getAttribute("data-lead-id");
      var fromQ = q().get("lead_id") || q().get("client_reference_id");
      var stored = "";
      try { stored = sessionStorage.getItem("fd_lead") || ""; } catch (e) {}
      var ph = "";
      try {
        if (window.posthog && typeof window.posthog.get_distinct_id === "function") {
          ph = "ph_" + window.posthog.get_distinct_id();
        }
      } catch (e) {}
      return cleanId(fromAttr || fromQ || stored || ph || ("anon_" + Date.now().toString(36)));
    }
    function resolveUtms(el, product) {
      var qs = q();
      var source = cleanUtm(el.getAttribute("data-utm-source") || qs.get("utm_source") || "dir");
      var medium = cleanUtm(el.getAttribute("data-utm-medium") || qs.get("utm_medium") || "page");
      var campaign = cleanUtm(el.getAttribute("data-utm-campaign") || product || qs.get("utm_campaign") || "");
      var content = cleanUtm(el.getAttribute("data-utm-content") || qs.get("utm_content") || "atlas-page", 150);
      if (!ALLOWED_SOURCE[source]) source = "dir";
      if (!ALLOWED_MEDIUM[medium]) medium = "page";
      if (!ALLOWED_CAMPAIGN[campaign]) campaign = product;
      return { source: source, medium: medium, campaign: campaign, content: content };
    }
    function decorateUrl(base, product, el) {
      var u = new URL(base);
      var lead = resolveLeadId(el);
      var utm = resolveUtms(el, product);
      u.searchParams.set("client_reference_id", lead);
      u.searchParams.set("utm_source", utm.source);
      u.searchParams.set("utm_medium", utm.medium);
      u.searchParams.set("utm_campaign", utm.campaign);
      u.searchParams.set("utm_content", utm.content);
      try { sessionStorage.setItem("fd_lead", lead); } catch (e) {}
      return { href: u.toString(), lead: lead, utm: utm };
    }
    function fireBuyClick(product, lead, utm, href) {
      try {
        if (window.posthog && typeof window.posthog.capture === "function") {
          window.posthog.capture(
            "buy_click",
            {
              product: product,
              lead_id: lead,
              utm_source: utm.source,
              utm_medium: utm.medium,
              utm_campaign: utm.campaign,
              utm_content: utm.content,
              href: href.split("?")[0],
              page: location.pathname
            },
            { send_instantly: true, transport: "sendBeacon" }
          );
        }
      } catch (e) {}
    }
    function isBuyHref(href) {
      return /buy\.stripe\.com\//i.test(href || "") || /\/go\//i.test(href || "");
    }
    function productOf(el, href) {
      var p = cleanUtm(el.getAttribute("data-product") || "");
      if (ALLOWED_CAMPAIGN[p]) return p;
      for (var key in PRODUCT_URLS) {
        if (PRODUCT_URLS[key] && href.indexOf(PRODUCT_URLS[key].split("/").pop()) !== -1) return key;
      }
      if (/7sY9ATenabXd7mJ7ea2ZO1i/.test(href)) return "pack1250";
      if (/eVq9ATbaY6CT6iF7ea2ZO1g/.test(href)) return "audit150";
      if (/6oUeVd7YM3qH0Ylbuq2ZO1u/.test(href)) return "concierge2000";
      if (/5kQaEX1Ao4uL22p9mi2ZO1U/.test(href)) return "freight2500";
      return p || "unknown";
    }

    document.addEventListener(
      "click",
      function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
        if (!a) return;
        var raw = a.getAttribute("href") || "";
        if (!isBuyHref(raw) && !a.getAttribute("data-product")) return;
        var product = productOf(a, raw);
        var base = PRODUCT_URLS[product] || raw;
        if (!/^https?:/i.test(base)) {
          try { base = new URL(base, location.href).toString(); } catch (e) { return; }
        }
        if (!/buy\.stripe\.com\//i.test(base) && !PRODUCT_URLS[product]) return;
        var built = decorateUrl(base, product, a);
        a.setAttribute("href", built.href);
        fireBuyClick(product, built.lead, built.utm, built.href);
      },
      true
    );

    // Eager-decorate marked links so copy-link / middle-click also carry IDs.
    function decorateAll() {
      var nodes = document.querySelectorAll("a[data-product], a[href*='buy.stripe.com']");
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        var product = productOf(a, a.getAttribute("href") || "");
        var base = PRODUCT_URLS[product] || a.getAttribute("href");
        if (!base || !/buy\.stripe\.com\//i.test(base) && !PRODUCT_URLS[product]) continue;
        if (PRODUCT_URLS[product]) base = PRODUCT_URLS[product];
        var built = decorateUrl(base, product, a);
        a.setAttribute("href", built.href);
        a.setAttribute("data-product", product);
      }
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", decorateAll);
    } else {
      decorateAll();
    }

    window.AtlasBuyLink = {
      productUrls: PRODUCT_URLS,
      decorateUrl: decorateUrl,
      resolveLeadId: resolveLeadId
    };
  } catch (e) {}
})();
