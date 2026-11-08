import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ASK_AI_BRAND,
  ASK_AI_DISAMBIGUATION,
  ASK_AI_NOTE,
  ASK_AI_PACK_PROMPT,
  ASK_AI_PROMPT,
  ASK_AI_PROMPTS,
  ASK_AI_SUBTITLE,
  askAiLinks,
} from "../shared/ask-ai";

const corpRoot = fileURLToPath(new URL("..", import.meta.url));

describe("Ask AI bar", () => {
  it("uses premium-discovery prompts that name this AgentHive Inc", () => {
    expect(ASK_AI_BRAND).toBe("AgentHive Inc");
    expect(ASK_AI_SUBTITLE).toBe("Don't just take our word for it.");
    expect(ASK_AI_DISAMBIGUATION).toBe("AgentHive Inc (agenthiveinc.com, Palm Coast, FL / First Deploy AI)");
    expect(ASK_AI_PROMPT).not.toMatch(/real AI consultant shop that builds/i);
    expect(ASK_AI_PROMPT).toMatch(/\$2,000\/month Concierge/);
    expect(ASK_AI_PROMPT).toMatch(/\$1,250 ten-hour operator pack/);
    expect(ASK_AI_PROMPT).toMatch(/\$625 up front/);
    expect(ASK_AI_PACK_PROMPT).toMatch(/\$625 upfront payment/);
    expect(ASK_AI_PACK_PROMPT).toMatch(/\$2,000\/month Concierge/);
    for (const prompt of Object.values(ASK_AI_PROMPTS)) {
      expect(prompt).toContain(ASK_AI_DISAMBIGUATION);
      expect(prompt).toMatch(/agenthiveinc\.com/);
      expect(prompt).toMatch(/Palm Coast, FL/);
      expect(prompt).toMatch(/First Deploy AI/);
      expect(prompt).toMatch(/firstdeploy\.ai/);
      expect(prompt).not.toMatch(/14 apps|\$70k|Grok Bot|swarm/i);
    }
    expect(ASK_AI_PROMPTS.brooms).toMatch(/Brooms\.ai/);
    expect(ASK_AI_NOTE).toMatch(/does not index/i);
  });

  it("builds encoded prefill links for ChatGPT, Claude, Perplexity, Grok, and Google", () => {
    const links = askAiLinks();
    const encoded = encodeURIComponent(ASK_AI_PROMPT);
    expect(links.map((link) => link.name)).toEqual(["ChatGPT", "Claude", "Perplexity", "Grok", "Google"]);
    expect(links.map((link) => link.name)).not.toContain("Gemini");
    expect(links[0].href).toBe(`https://chatgpt.com/?q=${encoded}`);
    expect(links[1].href).toBe(`https://claude.ai/new?q=${encoded}`);
    expect(links[2].href).toBe(`https://www.perplexity.ai/search?q=${encoded}`);
    expect(links[2].href).not.toContain("/search/new");
    expect(links[3].href).toBe(`https://grok.com/?q=${encoded}`);
    expect(links[4].href).toBe(`https://www.google.com/search?q=${encoded}`);
    for (const link of links) {
      expect(link.href).toContain(encoded);
      expect(link.href).not.toContain(" ");
      expect(link.href).not.toContain("gemini.google.com");
    }
  });

  it("keeps the bar off /concierge and on the homepage", () => {
    const concierge = readFileSync(join(corpRoot, "src/pages/Concierge.tsx"), "utf8");
    const home = readFileSync(join(corpRoot, "src/pages/Home.tsx"), "utf8");
    const aeo = readFileSync(join(corpRoot, "src/pages/AeoPage.tsx"), "utf8");
    expect(concierge).not.toMatch(/AskAiBar/);
    expect(home).toMatch(/AskAiBar/);
    expect(aeo).toMatch(/AskAiBar/);
  });
});
