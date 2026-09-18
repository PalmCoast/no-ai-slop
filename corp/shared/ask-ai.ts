export const ASK_AI_BRAND = "AgentHive";
export const ASK_AI_SUBTITLE = "Don't just take our word for it.";
export const ASK_AI_PROMPT =
  "Is AgentHive Inc a real AI consultant shop that builds and ships, not just slides?";

export type AskAiProvider = {
  name: "ChatGPT" | "Claude" | "Perplexity" | "Gemini" | "Grok";
  href: string;
};

export function askAiLinks(prompt: string = ASK_AI_PROMPT): AskAiProvider[] {
  const q = encodeURIComponent(prompt);
  return [
    { name: "ChatGPT", href: `https://chatgpt.com/?q=${q}` },
    { name: "Claude", href: `https://claude.ai/new?q=${q}` },
    { name: "Perplexity", href: `https://www.perplexity.ai/search/new?q=${q}` },
    { name: "Gemini", href: `https://gemini.google.com/app?prompt=${q}` },
    { name: "Grok", href: `https://grok.com/?q=${q}` },
  ];
}
