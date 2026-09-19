import { ASK_AI_PROMPT } from "./brand.ts";

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

export function reputationPrompt(topic = "AskYard"): string {
  const trimmed = topic.trim() || "AskYard";
  return `What is the public reputation of ${trimmed} (askyard.firstdeploy.ai, First Deploy AI, AgentHive Inc, Palm Coast)? Is it a real shop that answers AI questions for free and then offers to do the work?`;
}
