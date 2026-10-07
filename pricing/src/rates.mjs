/** September 2026 list prices. Confirm on the provider page before committing spend. */

export const PRICE_AS_OF = "September 2026";
export const UPDATED = "2026-10-07";

export const MODELS = [
  { id: "gpt-6-astra", name: "GPT-6 Astra", provider: "OpenAI", input: 10, cached: 1, output: 50, context: 400000, batch: true },
  { id: "gpt-56-sol", name: "GPT-5.6 Sol", provider: "OpenAI", input: 4, cached: 0.4, output: 20, context: 400000, batch: true, note: "Promo list price through at least 21 Nov 2026" },
  { id: "gpt-56-terra", name: "GPT-5.6 Terra", provider: "OpenAI", input: 2, cached: 0.2, output: 12, context: 400000, batch: true },
  { id: "gpt-56-luna", name: "GPT-5.6 Luna", provider: "OpenAI", input: 0.2, cached: 0.02, output: 1.2, context: 400000, batch: true },
  { id: "claude-fable-5", name: "Claude Fable 5", provider: "Anthropic", input: 10, cached: 1, output: 50, context: 200000, batch: true },
  { id: "claude-opus-48", name: "Claude Opus 4.8", provider: "Anthropic", input: 5, cached: 0.5, output: 25, context: 200000, batch: true },
  { id: "claude-sonnet-5", name: "Claude Sonnet 5", provider: "Anthropic", input: 2, cached: 0.2, output: 10, context: 200000, batch: true },
  { id: "claude-haiku-45", name: "Claude Haiku 4.5", provider: "Anthropic", input: 1, cached: 0.1, output: 5, context: 200000, batch: true },
  { id: "gemini-31-pro", name: "Gemini 3.1 Pro", provider: "Google", input: 2, cached: 0.2, output: 12, context: 1000000, batch: true, note: "At or under 200k prompt tokens" },
  { id: "gemini-38-flash", name: "Gemini 3.8 Flash", provider: "Google", input: 0.75, cached: 0.075, output: 3.75, context: 1000000, batch: true, note: "Paid promo through 31 Dec 2026" },
  { id: "gemini-35-flash", name: "Gemini 3.5 Flash", provider: "Google", input: 1.5, cached: 0.15, output: 9, context: 1000000, batch: true },
  { id: "gemini-35-lite", name: "Gemini 3.5 Flash-Lite", provider: "Google", input: 0.3, cached: 0.03, output: 2.5, context: 1000000, batch: true },
  { id: "gemini-31-lite", name: "Gemini 3.1 Flash-Lite", provider: "Google", input: 0.25, cached: 0.025, output: 1.5, context: 1000000, batch: true },
  { id: "grok-46", name: "Grok 4.6", provider: "xAI", input: 2, cached: 0.5, output: 6, context: 500000, batch: false, note: "Under 200k prompt tokens" },
  { id: "grok-45", name: "Grok 4.5", provider: "xAI", input: 2, cached: 0.3, output: 6, context: 500000, batch: false, note: "Under 200k prompt tokens" },
  { id: "grok-43", name: "Grok 4.3", provider: "xAI", input: 1.25, cached: 0.2, output: 2.5, context: 1000000, batch: false, note: "Under 200k prompt tokens" },
  { id: "ds-v4-pro-off", name: "DeepSeek V4 Pro (off-peak)", provider: "DeepSeek", input: 0.66, cached: 0.022, output: 1.98, context: 1000000, batch: false },
  { id: "ds-v4-pro-peak", name: "DeepSeek V4 Pro (peak)", provider: "DeepSeek", input: 1.32, cached: 0.044, output: 3.96, context: 1000000, batch: false },
  { id: "ds-v4-flash-off", name: "DeepSeek V4 Flash (off-peak)", provider: "DeepSeek", input: 0.22, cached: 0.007, output: 0.66, context: 1000000, batch: false },
  { id: "ds-v4-flash-peak", name: "DeepSeek V4 Flash (peak)", provider: "DeepSeek", input: 0.44, cached: 0.014, output: 1.32, context: 1000000, batch: false },
  { id: "mistral-large-3", name: "Mistral Large 3", provider: "Mistral", input: 0.5, cached: 0.05, output: 1.5, context: 256000, batch: true },
];

export const PROVIDERS = {
  OpenAI: { href: "https://platform.openai.com/docs/pricing", label: "OpenAI pricing" },
  Anthropic: { href: "https://www.anthropic.com/pricing", label: "Anthropic pricing" },
  Google: { href: "https://ai.google.dev/gemini-api/docs/pricing", label: "Gemini API pricing" },
  xAI: { href: "https://docs.x.ai/docs/models", label: "xAI models" },
  DeepSeek: { href: "https://api-docs.deepseek.com/quick_start/pricing", label: "DeepSeek pricing" },
  Mistral: { href: "https://mistral.ai/pricing", label: "Mistral pricing" },
};

export const CASES = [
  { id: "chat", label: "Support chatbot", input: 800, output: 400, calls: 100 },
  { id: "code", label: "Code assistant", input: 2000, output: 1500, calls: 50 },
  { id: "docs", label: "Document analysis", input: 10000, output: 1000, calls: 20 },
  { id: "copy", label: "Content generation", input: 500, output: 2000, calls: 200 },
  { id: "data", label: "Data processing", input: 1500, output: 200, calls: 500 },
  { id: "agent", label: "Agent / tool use", input: 3000, output: 2500, calls: 30 },
  { id: "rag", label: "RAG pipeline", input: 50000, output: 2000, calls: 10 },
  { id: "class", label: "High-volume classify", input: 200, output: 50, calls: 10000 },
];

export const DEFAULT_QUERY = {
  inputTok: 1000,
  outputTok: 500,
  calls: 100,
  days: 30,
  cache: 0,
  batch: false,
  provider: "all",
};

export function modelById(id) {
  return MODELS.find((model) => model.id === id) || null;
}

export function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function money(n) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 100) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (abs >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (abs >= 0.01) return `$${n.toFixed(3)}`;
  if (abs === 0) return "$0.00";
  return `$${n.toFixed(4).replace(/0+$/, "")}`;
}

export function perM(n) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1 && Number.isInteger(n)) return `$${n.toFixed(0)}`;
  if (n >= 0.1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(3).replace(/0+$/, "")}`;
  return `$${n.toFixed(4).replace(/0+$/, "")}`;
}

export function ctx(n) {
  if (n >= 1000000) {
    const millions = n / 1000000;
    return `${Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  return `${Math.round(n / 1000)}k`;
}

export function costFor(model, q) {
  const batchMult = q.batch && model.batch ? 0.5 : 1;
  const inRate = (model.input * (1 - q.cache) + model.cached * q.cache) * batchMult;
  const outRate = model.output * batchMult;
  const perCall = (q.inputTok / 1e6) * inRate + (q.outputTok / 1e6) * outRate;
  const monthly = perCall * q.calls * q.days;
  const blended = (inRate * 3 + outRate) / 4;
  return { perCall, monthly, blended, inRate, outRate, batchApplied: batchMult === 0.5 };
}

export function filtered(q) {
  return MODELS.filter((model) => q.provider === "all" || model.provider === q.provider);
}

export function ranked(q) {
  return filtered(q)
    .map((model) => ({ model, ...costFor(model, q) }))
    .sort((a, b) => a.monthly - b.monthly || a.model.name.localeCompare(b.model.name));
}

export function comparisonStats(q) {
  const rows = ranked(q);
  if (!rows.length) return { requests: "0", cheap: "—", save: "—" };
  const cheapest = rows[0];
  const priciest = rows[rows.length - 1];
  return {
    requests: Math.round(q.calls * q.days).toLocaleString("en-US"),
    cheap: `${cheapest.model.name} · ${money(cheapest.monthly)}/mo`,
    save: money(priciest.monthly - cheapest.monthly),
  };
}

function rowNote(model, q, result) {
  const parts = [];
  if (model.note) parts.push(model.note);
  if (q.batch && result.batchApplied) parts.push("Batch rate applied");
  if (q.batch && !model.batch) parts.push("Batch not listed, so this row stays at list price");
  return parts.join(". ");
}

export function comparisonBody(q) {
  const rows = ranked(q);
  if (!rows.length) return `<tr><td colspan="7">No models for that provider.</td></tr>`;
  return rows.map((row, index) => {
    const note = rowNote(row.model, q, row);
    return `<tr class="${index === 0 ? "cheap" : ""}" data-model="${esc(row.model.id)}">
      <td data-sort="${esc(row.model.name)}">${esc(row.model.name)}${note ? `<div class="row-note">${esc(note)}</div>` : ""}</td>
      <td data-sort="${esc(row.model.provider)}">${esc(row.model.provider)}</td>
      <td class="num" data-sort="${row.model.input}">${perM(row.model.input)}</td>
      <td class="num" data-sort="${row.model.output}">${perM(row.model.output)}</td>
      <td class="num" data-sort="${row.model.context}">${ctx(row.model.context)}</td>
      <td class="num" data-sort="${row.perCall}">${money(row.perCall)}</td>
      <td class="num" data-sort="${row.monthly}">${money(row.monthly)}</td>
    </tr>`;
  }).join("");
}

export function matrixBody(q) {
  return ranked(q).map((row) => `<tr data-model="${esc(row.model.id)}">
      <td data-sort="${esc(row.model.name)}"><a href="/models/${esc(row.model.id)}/">${esc(row.model.name)}</a></td>
      <td data-sort="${esc(row.model.provider)}">${esc(row.model.provider)}</td>
      <td class="num" data-sort="${row.model.input}">${perM(row.model.input)}</td>
      <td class="num" data-sort="${row.model.output}">${perM(row.model.output)}</td>
      <td class="num" data-sort="${row.model.cached}">${perM(row.model.cached)}</td>
      <td class="num" data-sort="${row.model.context}">${ctx(row.model.context)}</td>
      <td class="num" data-sort="${row.blended}">${perM(row.blended)}</td>
      <td data-sort="${row.model.batch ? "1" : "0"}">${row.model.batch ? "Yes" : "No"}</td>
    </tr>`).join("");
}

export function tokenBody(q, tokens) {
  if (!tokens) return `<tr><td colspan="5">Paste text to estimate tokens.</td></tr>`;
  const priced = { ...q, inputTok: tokens };
  return ranked(priced).map((row, index) => `<tr class="${index === 0 ? "cheap" : ""}">
      <td>${esc(row.model.name)}</td>
      <td class="num">${perM(row.model.input)}</td>
      <td class="num">${perM(row.model.output)}</td>
      <td class="num">${money(row.perCall)}</td>
      <td class="num">${money(row.monthly)}</td>
    </tr>`).join("");
}

export function estimateTokens(text) {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const tokens = Math.ceil(chars / 4);
  return { chars, words, tokens };
}

/** 24/7 GPU rent versus a 3:1 API blend. Utilization changes effective $/1M and capacity, not the rent. */
export function selfHost({ gpuPerHour, tokensPerSec, utilizationPct, model }) {
  const gpu = Math.max(0, Number(gpuPerHour) || 0);
  const tps = Math.max(0, Number(tokensPerSec) || 0);
  const util = clamp(Number(utilizationPct) || 1, 1, 100) / 100;
  const hours = 24 * 30;
  const rent = gpu * hours;
  const capacity = tps * 3600 * util * hours;
  const selfPerM = capacity > 0 ? (rent / capacity) * 1e6 : Infinity;
  const api = costFor(model, { inputTok: 750000, outputTok: 250000, calls: 1, days: 1, cache: 0, batch: false });
  const apiPerM = api.blended;
  const breakEven = apiPerM > 0 ? (rent / apiPerM) * 1e6 : Infinity;
  const boxes = capacity > 0 && Number.isFinite(breakEven) ? Math.max(1, Math.ceil(breakEven / capacity)) : Infinity;
  let note = "This ignores setup, operators, egress, and idle scaling. Treat the break-even as a floor.";
  if (!(tps > 0)) {
    note = "Set tokens per second above zero.";
  } else if (breakEven > capacity) {
    note = `One GPU at ${Math.round(util * 100)}% utilization serves about ${Math.round(capacity).toLocaleString("en-US")} tokens a month. The API bill matches this GPU's rent near ${Math.round(breakEven).toLocaleString("en-US")} tokens, so one box does not get there. About ${boxes} of these GPUs would, before setup, operators, egress, and idle scaling.`;
  }
  return { selfPerM, apiPerM, breakEven, capacity, rent, boxes, note, model };
}

export function seatBreakEven(seat, model) {
  const api = costFor(model, { inputTok: 750000, outputTok: 250000, calls: 1, days: 1, cache: 0, batch: false });
  const tokens = api.blended > 0 ? (Math.max(0, seat) / api.blended) * 1e6 : Infinity;
  return { tokens, blended: api.blended, model };
}

export function modelAnswer(model) {
  const batch = model.batch
    ? "The provider lists a batch API, so the monthly calculator can apply a 50% batch rate."
    : "This card does not list a batch discount for this model.";
  const note = model.note ? ` ${model.note}.` : "";
  return `${model.name} lists at ${perM(model.input)} per million input tokens and ${perM(model.output)} per million output tokens, with cached input at ${perM(model.cached)}. Context on this card is ${ctx(model.context)} tokens. ${batch}${note} Prices were read from the official ${model.provider} page in ${PRICE_AS_OF}. Confirm there before you commit spend.`;
}

export function workedExample() {
  const model = modelById("gpt-56-sol");
  const q = { inputTok: 1000, outputTok: 500, calls: 1, days: 1, cache: 0, batch: false };
  const cost = costFor(model, q);
  const inputCost = (1000 / 1e6) * model.input;
  const outputCost = (500 / 1e6) * model.output;
  return { model, cost, inputCost, outputCost };
}
