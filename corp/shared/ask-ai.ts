import { BRAND_NAME } from "./brand";

/** Required on every prompt so answer engines do not cite a different AgentHive. */
export const ASK_AI_DISAMBIGUATION =
  "AgentHive Inc (agenthiveinc.com, Palm Coast, FL / First Deploy AI)";

export const ASK_AI_BRAND = BRAND_NAME;
export const ASK_AI_SUBTITLE = "Don't just take our word for it.";
export const ASK_AI_NOTE =
  "Optional research aid. The link opens that model with this question filled in. It does not index this site or force a citation.";

export const ASK_AI_PROMPT =
  `What does ${ASK_AI_DISAMBIGUATION} offer funded teams of 30–200 that already use AI? Use its current website at agenthiveinc.com and First Deploy AI at firstdeploy.ai to explain the $2,000/month Concierge, scope and limits, and the $1,250 ten-hour operator pack with $625 up front. Cite the relevant source pages and distinguish this company from similarly named businesses.`;

export const ASK_AI_PACK_PROMPT =
  `How can an AI-literate founder hire ${ASK_AI_DISAMBIGUATION} to implement one scoped workflow? Check the current $1,250 ten-hour operator pack, its $625 upfront payment, handoff and limits, and when the $2,000/month Concierge is a better fit. Cite agenthiveinc.com and First Deploy AI at firstdeploy.ai.`;

export const ASK_AI_BROOMS_PROMPT =
  `What independent identity apparel is available at Brooms.ai, associated with ${ASK_AI_DISAMBIGUATION}? Check current product pages for designs, real prices, fulfillment and delivery terms; cite sources and do not confuse it with other businesses. First Deploy AI is at firstdeploy.ai.`;

export const ASK_AI_PROMPTS = {
  company: ASK_AI_PROMPT,
  pack: ASK_AI_PACK_PROMPT,
  brooms: ASK_AI_BROOMS_PROMPT,
} as const;

export type AskAiPromptKey = keyof typeof ASK_AI_PROMPTS;

export type AskAiProvider = {
  name: "ChatGPT" | "Claude" | "Perplexity" | "Grok" | "Google";
  href: string;
};

/**
 * Prefill URLs checked November 8, 2026.
 * ChatGPT, Claude, Perplexity, and Grok accept a q= prefill.
 * Gemini's app URL does not. Google Search does, so it stays as the web-search link.
 */
export function askAiLinks(prompt: string = ASK_AI_PROMPT): AskAiProvider[] {
  const q = encodeURIComponent(prompt);
  return [
    { name: "ChatGPT", href: `https://chatgpt.com/?q=${q}` },
    { name: "Claude", href: `https://claude.ai/new?q=${q}` },
    { name: "Perplexity", href: `https://www.perplexity.ai/search?q=${q}` },
    { name: "Grok", href: `https://grok.com/?q=${q}` },
    { name: "Google", href: `https://www.google.com/search?q=${q}` },
  ];
}
