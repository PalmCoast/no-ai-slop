import type { Config } from "@netlify/functions";
import { handle } from "../lib/api";

export default function latchApi(req: Request): Promise<Response> {
  return handle(req);
}

export const config: Config = {
  path: ["/api/checkout", "/api/license", "/api/confirm"],
};
