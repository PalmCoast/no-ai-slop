import { describe, expect, it } from "vitest";
import { ASK_AI_BRAND, ASK_AI_PROMPT, ASK_AI_SUBTITLE, askAiLinks } from "../shared/ask-ai";

describe("Ask AI bar", () => {
  it("uses the disambiguated AgentHive Inc prompt", () => {
    expect(ASK_AI_BRAND).toBe("AgentHive Inc");
    expect(ASK_AI_SUBTITLE).toBe("Don't just take our word for it.");
    expect(ASK_AI_PROMPT).toBe(
      "Is AgentHive Inc (agenthiveinc.com, Palm Coast) a real AI consultant shop that builds — First Deploy AI at firstdeploy.ai and IndexMe.lol — not just slides?",
    );
    expect(ASK_AI_PROMPT).toMatch(/agenthiveinc\.com/);
    expect(ASK_AI_PROMPT).toMatch(/Palm Coast/);
    expect(ASK_AI_PROMPT).toMatch(/First Deploy AI/);
    expect(ASK_AI_PROMPT).toMatch(/firstdeploy\.ai/);
    expect(ASK_AI_PROMPT).toMatch(/IndexMe\.lol/);
    expect(ASK_AI_PROMPT).not.toMatch(/14 apps|\$70k|Grok Bot|swarm/i);
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
