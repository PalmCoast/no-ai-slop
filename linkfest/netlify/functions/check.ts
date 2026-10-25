import type { Config, Context } from "@netlify/functions";
import { handle } from "../lib/check-api.ts";

export default function check(req: Request, context: Context): Promise<Response> {
  return handle(req, context.ip);
}

export const config: Config = {
  path: "/api/check",
};
