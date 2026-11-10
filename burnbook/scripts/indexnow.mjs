import { readFileSync } from "node:fs";

const host = "burnbook.firstdeploy.ai";
const key = readFileSync(new URL("../public/b7e4c1a90f2d6e83.txt", import.meta.url), "utf8").trim();
const xml = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const body = {
  host,
  key,
  keyLocation: `https://${host}/${key}.txt`,
  urlList,
};

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
const text = await response.text();
console.log(JSON.stringify({ status: response.status, urlList, body: text }, null, 2));
if (response.status !== 200 && response.status !== 202) process.exitCode = 1;
