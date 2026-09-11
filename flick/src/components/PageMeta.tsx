import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_ORIGIN, metaForPath } from "../../shared/meta";

function upsertMeta(selector: string, attrs: Record<string, string>): void {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

/** Keep the tab title and share tags in sync after hydration (X still reads index.html / the edge rewrite). */
export function PageMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = metaForPath(pathname);
    const url = `${SITE_ORIGIN}${pathname === "/" ? "/" : pathname}`;
    document.title = meta.title;
    upsertMeta('meta[name="description"]', { name: "description", content: meta.description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: meta.title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: meta.description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: meta.image });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: meta.title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: meta.description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: meta.image });
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
  }, [pathname]);
  return null;
}
