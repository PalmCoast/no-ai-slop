const PRODUCTION = "https://askyard.firstdeploy.ai";

function apiOrigin() {
  if (location.protocol === "http:" || location.protocol === "https:") {
    if (location.hostname === "localhost" || location.hostname.endsWith("firstdeploy.ai") || location.hostname.endsWith("netlify.app")) {
      return location.origin;
    }
  }
  return PRODUCTION;
}

const form = document.getElementById("lookup");
const input = document.getElementById("q");
const status = document.getElementById("status");
const reportEl = document.getElementById("report");
const scoreEl = document.getElementById("score");
const labelEl = document.getElementById("label");
const fillEl = document.getElementById("fill");
const summaryEl = document.getElementById("summary");
const statsEl = document.getElementById("stats");
const hitsEl = document.getElementById("hits");
const fullEl = document.getElementById("full");

function guessFromTab() {
  if (!chrome?.tabs?.query) return;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs?.[0];
    if (!tab || input.value) return;
    try {
      const host = tab.url ? new URL(tab.url).hostname.replace(/^www\./, "") : "";
      if (host && !host.startsWith("chrome") && host !== "askyard.firstdeploy.ai") {
        input.placeholder = host;
      }
    } catch {
      // leave blank
    }
  });
}

async function lookup(query) {
  const q = String(query || "").trim();
  if (q.length < 2) {
    status.textContent = "Type a name. Two characters is the floor.";
    return;
  }
  status.textContent = "Looking…";
  reportEl.hidden = true;
  const origin = apiOrigin();
  fullEl.href = `${origin}/rep?q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(`${origin}/api/rep?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("lookup_failed");
    const report = await res.json();
    scoreEl.textContent = String(report.score);
    labelEl.textContent = report.label;
    fillEl.style.width = `${report.score}%`;
    summaryEl.textContent = report.summary;
    statsEl.textContent = `${report.helpful} helpful · ${report.missed} missed · ${report.watchCount} watch hits`;
    hitsEl.innerHTML = "";
    for (const hit of report.hits || []) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = hit.url.startsWith("http") ? hit.url : `${origin}${hit.url}`;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = hit.title;
      li.appendChild(a);
      hitsEl.appendChild(li);
    }
    reportEl.hidden = false;
    status.textContent = `Looked up ${report.query}`;
  } catch {
    status.textContent = "Could not reach AskYard. Open the meter on the site.";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  lookup(input.value);
});

guessFromTab();
const params = new URLSearchParams(location.search);
if (params.get("q")) {
  input.value = params.get("q");
  lookup(input.value);
}
