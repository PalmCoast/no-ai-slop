import { BRAND_HOST } from "./brand.ts";

/** IndexNow key. The file `public/<key>.txt` must contain this exact string. */
export const INDEXNOW_KEY = "b7e4c1a90f2d6e83";

/** Pages a search engine should fetch. /thanks is a receipt, so it stays out. */
export const INDEX_PATHS = ["/", "/book", "/packet", "/method", "/sales"] as const;

export function indexUrls(host = BRAND_HOST): string[] {
  return INDEX_PATHS.map((path) => `https://${host}${path === "/" ? "/" : path}`);
}

export function indexNowBody(host = BRAND_HOST) {
  return {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
    urlList: indexUrls(host),
  };
}
