import type { Config } from "@netlify/functions";
import { handle } from "../lib/api";

export default function redlineApi(req: Request): Promise<Response> {
  return handle(req);
}

export const config: Config = {
  path: ["/api/offer", "/api/checkout", "/api/license", "/api/confirm", "/api/restore", "/api/read"],
};
