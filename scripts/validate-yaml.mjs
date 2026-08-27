#!/usr/bin/env node
// Validates that every YAML file in the repo parses cleanly.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

const IGNORE = new Set(["node_modules", ".git"]);

function findYaml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (IGNORE.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...findYaml(full));
    } else if (/\.ya?ml$/i.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const files = findYaml(process.cwd());
let failed = 0;

for (const file of files) {
  try {
    yaml.load(readFileSync(file, "utf8"));
    console.log(`ok   ${file}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${file}: ${err.message}`);
  }
}

if (files.length === 0) {
  console.log("No YAML files found.");
}

if (failed > 0) {
  console.error(`\n${failed} YAML file(s) failed to parse.`);
  process.exit(1);
}

console.log(`\nAll ${files.length} YAML file(s) parsed successfully.`);
