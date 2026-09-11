/** Page titles and descriptions for the document head and X/OG unfurls. */

export const SITE_ORIGIN = "https://useflick.netlify.app";
export const OG_IMAGE = `${SITE_ORIGIN}/og.png`;
export const OG_IMAGE_PRICING = `${SITE_ORIGIN}/og-pricing.png`;

export interface PageMeta {
  title: string;
  description: string;
  image: string;
}

export const HOME_META: PageMeta = {
  title: "Flick — skip the meeting",
  description:
    "A Loom that doesn't make your viewer sign up. Record in the browser, send a link. Watch is free. Publish is the gate.",
  image: OG_IMAGE,
};

export const PRICING_META: PageMeta = {
  title: "Flick pricing — Street $0, Lights $19/mo, Marquee $99",
  description:
    "Watch is free. Publish is the gate. Street: one short link. Lights $19/month. Marquee $99 once.",
  image: OG_IMAGE_PRICING,
};

const OTHER: Record<string, PageMeta> = {
  "/launch": {
    title: "Flick launch — three acts, no fake timeline",
    description: "Ship the marquee. Sell founder seats. Default to Lights. Watch stays free.",
    image: OG_IMAGE,
  },
  "/marketing": {
    title: "Flick — skip the meeting. Send a Flick.",
    description: "The wedge is free watching. You pay to publish, never to watch.",
    image: OG_IMAGE,
  },
  "/thanks": {
    title: "You're in — Flick",
    description: "Publish is unlocked on this device. Go record.",
    image: OG_IMAGE,
  },
  "/record": {
    title: "Record a Flick",
    description: "Screen, camera, or both. Street pass is one short publish. Watchers never sign up.",
    image: OG_IMAGE,
  },
};

export function metaForPath(pathname: string): PageMeta {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || path === "/index.html") return HOME_META;
  if (path === "/pricing") return PRICING_META;
  if (path.startsWith("/v/")) {
    return {
      title: "Watch this Flick",
      description: "No account. Hit play. Recorded with Flick — skip the meeting.",
      image: OG_IMAGE,
    };
  }
  return OTHER[path] ?? HOME_META;
}
