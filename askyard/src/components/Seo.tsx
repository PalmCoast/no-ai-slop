import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { canonicalFor, organizationJsonLd, pageForPath } from "../../shared/seo";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function Seo() {
  const { pathname } = useLocation();
  const page = pageForPath(pathname);
  const canonical = canonicalFor(page.path === "/404" ? pathname : page.path);
  const json = JSON.stringify(organizationJsonLd());

  useEffect(() => {
    document.title = page.title;
    upsertMeta("name", "description", page.description);
    upsertMeta("name", "robots", page.noindex ? "noindex, follow" : "index, follow");
    upsertLink("canonical", page.noindex ? `${window.location.origin}${pathname}` : canonical);
    upsertMeta("property", "og:title", page.title);
    upsertMeta("property", "og:description", page.description);
    upsertMeta("property", "og:url", page.noindex ? `${window.location.origin}${pathname}` : canonical);
    upsertMeta("name", "twitter:title", page.title);
    upsertMeta("name", "twitter:description", page.description);
    let script = document.getElementById("askyard-jsonld") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "askyard-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = json;
  }, [canonical, json, page, pathname]);

  return null;
}
