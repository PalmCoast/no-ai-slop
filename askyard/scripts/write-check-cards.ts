import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { demoReport } from "../shared/check.ts";
import { renderCheckCardPng, renderToolCardPng } from "../shared/check-card.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public/check");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "og.png"), renderToolCardPng());
writeFileSync(join(dir, "harbor-hvac.png"), renderCheckCardPng(demoReport()));
console.log("wrote public/check/og.png and public/check/harbor-hvac.png");
