import {
  CASES,
  MODELS,
  comparisonBody,
  comparisonStats,
  estimateTokens,
  matrixBody,
  money,
  modelById,
  seatBreakEven,
  selfHost,
  tokenBody,
} from "./rates.js";

function num(id, fallback) {
  const el = document.getElementById(id);
  const value = Number(el?.value);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function inputs() {
  return {
    inputTok: num("in-tokens", 1000),
    outputTok: num("out-tokens", 500),
    calls: num("calls-day", 100),
    days: clamp(num("days-month", 30), 1, 31),
    cache: clamp(num("cache-hit", 0), 0, 100) / 100,
    batch: document.getElementById("batch")?.checked ?? false,
    provider: document.getElementById("provider")?.value ?? "all",
  };
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function highlight(root) {
  const wanted = new URLSearchParams(location.search).get("model");
  if (!wanted || !root) return;
  root.querySelectorAll("tr").forEach((row) => {
    row.classList.toggle("hot", row.dataset.model === wanted);
  });
}

function renderComparison() {
  const query = inputs();
  const body = document.getElementById("cmp-body");
  const matrix = document.getElementById("matrix-body");
  if (body) {
    body.innerHTML = comparisonBody(query);
    highlight(body);
    body.closest("table")?.querySelectorAll("th").forEach((header) => header.setAttribute("aria-sort", "none"));
  }
  if (matrix) {
    matrix.innerHTML = matrixBody(query);
    highlight(matrix);
  }
  const stats = comparisonStats(query);
  setText("stat-requests", stats.requests);
  setText("stat-cheap", stats.cheap);
  setText("stat-save", stats.save);
  setText("cache-readout", `${Math.round(query.cache * 100)}%`);
}

function renderTokens() {
  const text = document.getElementById("token-text")?.value ?? "";
  const estimate = estimateTokens(text);
  setText("tok-count", estimate.tokens.toLocaleString("en-US"));
  setText("tok-meta", `${estimate.chars.toLocaleString("en-US")} chars · ${estimate.words.toLocaleString("en-US")} words`);
  const out = num("token-out", 400);
  const copies = Math.max(1, num("token-copies", 1));
  const query = { ...inputs(), inputTok: estimate.tokens, outputTok: out, calls: copies, days: 1 };
  const body = document.getElementById("token-body");
  if (!body) return;
  body.innerHTML = tokenBody(query, estimate.tokens);
  if (!estimate.tokens) {
    setText("tok-cheap", "—");
    return;
  }
  const first = body.querySelector("tr.cheap td");
  const call = body.querySelector("tr.cheap td:nth-child(4)");
  setText("tok-cheap", first && call ? `${first.textContent} · ${call.textContent} / call` : "—");
}

function renderSelf() {
  const model = modelById(document.getElementById("gpu-model")?.value) || MODELS[1];
  const result = selfHost({
    gpuPerHour: num("gpu-hour", 3),
    tokensPerSec: num("gpu-tps", 80),
    utilizationPct: num("gpu-util", 40),
    model,
  });
  setText("self-cost", `${money(result.selfPerM)} / 1M tok`);
  setText("api-cost", `${money(result.apiPerM)} / 1M blended on ${model.name}`);
  setText("self-be", Number.isFinite(result.breakEven) ? `${Math.round(result.breakEven).toLocaleString("en-US")} tokens/mo` : "—");
  setText("self-note", result.note);
}

function renderSub() {
  const model = modelById(document.getElementById("sub-model")?.value) || MODELS[3];
  const result = seatBreakEven(num("sub-seat", 20), model);
  setText("sub-be", Number.isFinite(result.tokens) ? `${Math.round(result.tokens).toLocaleString("en-US")} tokens/mo` : "—");
  setText("sub-model-name", model.name);
}

function renderAll() {
  renderComparison();
  renderTokens();
  renderSelf();
  renderSub();
}

function fillCases() {
  const box = document.getElementById("use-cases");
  if (!box) return;
  box.innerHTML = CASES.map((item) => `<button type="button" class="chip" data-case="${item.id}">${item.label}</button>`).join("");
  box.addEventListener("click", (event) => {
    const button = event.target.closest("[data-case]");
    if (!button) return;
    const item = CASES.find((entry) => entry.id === button.dataset.case);
    if (!item) return;
    setVal("in-tokens", item.input);
    setVal("out-tokens", item.output);
    setVal("calls-day", item.calls);
    box.querySelectorAll(".chip").forEach((el) => el.setAttribute("aria-pressed", String(el === button)));
    renderAll();
  });
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = String(value);
}

function fillModelSelects() {
  const options = MODELS.map((model) => `<option value="${model.id}">${model.name}</option>`).join("");
  for (const id of ["gpu-model", "sub-model"]) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.innerHTML = options;
  }
  const params = new URLSearchParams(location.search);
  const hinted = params.get("model");
  setVal("gpu-model", hinted && modelById(hinted) ? hinted : "gpt-56-sol");
  setVal("sub-model", "gpt-56-luna");
}

function readQuery() {
  const params = new URLSearchParams(location.search);
  const map = [
    ["in", "in-tokens"],
    ["out", "out-tokens"],
    ["calls", "calls-day"],
    ["days", "days-month"],
    ["cache", "cache-hit"],
  ];
  for (const [key, id] of map) {
    if (params.has(key)) setVal(id, params.get(key));
  }
  if (params.has("provider")) setVal("provider", params.get("provider"));
  const batch = document.getElementById("batch");
  if (batch && params.get("batch") === "1") batch.checked = true;
  if (params.get("tab")) selectTab(`panel-${params.get("tab")}`, false);
}

function writeQuery() {
  const query = inputs();
  const params = new URLSearchParams(location.search);
  params.set("in", String(query.inputTok));
  params.set("out", String(query.outputTok));
  params.set("calls", String(query.calls));
  params.set("days", String(query.days));
  params.set("cache", String(Math.round(query.cache * 100)));
  params.set("provider", query.provider);
  if (query.batch) params.set("batch", "1");
  else params.delete("batch");
  const active = document.querySelector(".tab[aria-selected='true']");
  if (active?.dataset.panel) params.set("tab", active.dataset.panel.replace("panel-", ""));
  const next = `${location.pathname}?${params.toString()}#calculator`;
  history.replaceState(null, "", next);
  return `${location.origin}${next}`;
}

function selectTab(id, focus) {
  const tabs = [...document.querySelectorAll(".tab")];
  const panels = [...document.querySelectorAll(".panel")];
  tabs.forEach((tab) => {
    const on = tab.dataset.panel === id;
    tab.setAttribute("aria-selected", String(on));
    tab.tabIndex = on ? 0 : -1;
    if (on && focus) tab.focus();
  });
  panels.forEach((panel) => {
    const on = panel.id === id;
    panel.classList.toggle("active", on);
    panel.hidden = !on;
  });
}

function bindTabs() {
  const tabs = [...document.querySelectorAll(".tab")];
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab.dataset.panel, false));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      selectTab(tabs[next].dataset.panel, true);
    });
  });
}

function bindSort(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  table.querySelectorAll("th").forEach((th) => {
    th.querySelector("button")?.addEventListener("click", () => {
      const tbody = table.tBodies[0];
      const rows = [...tbody.rows];
      const dir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
      table.querySelectorAll("th").forEach((header) => header.setAttribute("aria-sort", "none"));
      th.setAttribute("aria-sort", dir);
      rows.sort((a, b) => {
        const av = a.cells[th.cellIndex].dataset.sort ?? a.cells[th.cellIndex].textContent;
        const bv = b.cells[th.cellIndex].dataset.sort ?? b.cells[th.cellIndex].textContent;
        const an = Number(av);
        const bn = Number(bv);
        if (Number.isFinite(an) && Number.isFinite(bn)) return dir === "ascending" ? an - bn : bn - an;
        return dir === "ascending" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
      rows.forEach((row) => tbody.appendChild(row));
    });
  });
}

function bindMenu() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!button || !nav) return;
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("open", !open);
  });
}

function bindShare() {
  document.getElementById("share")?.addEventListener("click", async () => {
    const url = writeQuery();
    const status = document.getElementById("share-status");
    try {
      await navigator.clipboard.writeText(url);
      if (status) status.textContent = "Link copied.";
    } catch {
      if (status) status.textContent = url;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fillCases();
  fillModelSelects();
  readQuery();
  bindTabs();
  bindMenu();
  bindShare();
  bindSort("cmp-table");
  bindSort("matrix-table");
  document.getElementById("calc-form")?.addEventListener("input", renderAll);
  document.getElementById("token-text")?.addEventListener("input", renderTokens);
  document.getElementById("token-out")?.addEventListener("input", renderTokens);
  document.getElementById("token-copies")?.addEventListener("input", renderTokens);
  document.getElementById("gpu-box")?.addEventListener("input", renderSelf);
  document.getElementById("sub-box")?.addEventListener("input", renderSub);
  document.getElementById("calc-form")?.addEventListener("submit", (event) => event.preventDefault());
  renderAll();
});
