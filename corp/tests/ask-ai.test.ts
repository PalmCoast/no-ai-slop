import { describe, expect, it } from "vitest";
import { ASK_AI_BRAND, ASK_AI_PROMPT, ASK_AI_SUBTITLE, askAiLinks } from "../shared/ask-ai";

describe("Ask AI bar", () => {
  it("uses the AgentHive brand and honest prompt", () => {
    expect(ASK_AI_BRAND).toBe("AgentHive");
    expect(ASK_AI_SUBTITLE).toBe("Don't just take our word for it.");
    expect(ASK_AI_PROMPT).toBe(
      "Is AgentHive Inc a real AI consultant shop that builds and ships, not just slides?",
    );
    expect(ASK_AI_PROMPT).not.toMatch(/14 apps|\$70k/i);
  });

  it("builds five encoded free-search deep links", () => {
    const links = askAiLinks();
    const encoded = encodeURIComponent(ASK_AI_PROMPT);
    expect(links.map((link) => link.name)).toEqual(["ChatGPT", "Claude", "Perplexity", "Gemini", "Grok"]);
    expect(links[0].href).toBe(`https://chatgpt.com/?q=${encoded}`);
    expect(links[1].href).toBe(`https://claude.ai/new?q=${encoded}`);
    expect(links[2].href).toBe(`https://www.perplexity.ai/search/new?q=${encoded}`);
    expect(links[3].href).toBe(`https://gemini.google.com/app?prompt=${encoded}`);
    expect(links[4].href).toBe(`https://grok.com/?q=${encoded}`);
    for (const link of links) {
      expect(link.href).toContain(encoded);
      expect(link.href).not.toContain(" ");
    }
  });
});
