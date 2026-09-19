import type { Config, Context } from "@netlify/edge-functions";

export default async (req: Request, context: Context) => {
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("marquee.")) {
    const url = new URL(req.url);
    if (url.pathname === "/" || url.pathname === "") {
      return context.rewrite("/marquee");
    }
  }
  return;
};

export const config: Config = {
  path: "/*",
};
