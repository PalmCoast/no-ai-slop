import { BUZZ_SEED, type BuzzEdition, type BuzzStory } from "../../shared/buzz-seed.ts";

type HnHit = {
  title?: string;
  url?: string;
  points?: number;
  objectID?: string;
};

const HN_QUERIES = [
  "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30",
  "https://hn.algolia.com/api/v1/search?query=AI%20OR%20GPU%20OR%20agent%20OR%20kubernetes%20OR%20inference&tags=story&hitsPerPage=20",
];

const KEYWORDS = /ai|gpu|agent|llm|model|infer|kuber|cloud|openai|anthropic|xai|grok|nvidia|sandb|secur|token|vector|rag/i;

function mondayOf(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function hnUrl(hit: HnHit): string {
  if (hit.url) return hit.url;
  return `https://news.ycombinator.com/item?id=${hit.objectID ?? ""}`;
}

async function fetchHits(): Promise<HnHit[]> {
  const batches = await Promise.all(
    HN_QUERIES.map(async (url) => {
      const res = await fetch(url, { headers: { "User-Agent": "AgentHive-Grok-Briefing/1.0" } });
      if (!res.ok) return [] as HnHit[];
      const json = (await res.json()) as { hits?: HnHit[] };
      return json.hits ?? [];
    }),
  );
  const seen = new Set<string>();
  const merged: HnHit[] = [];
  for (const hit of batches.flat()) {
    const title = hit.title?.trim();
    if (!title || seen.has(title)) continue;
    seen.add(title);
    merged.push(hit);
  }
  return merged;
}

function pickStories(hits: HnHit[]): BuzzStory[] {
  return hits
    .filter((hit) => KEYWORDS.test(hit.title ?? "") || KEYWORDS.test(hit.url ?? ""))
    .slice(0, 8)
    .map((hit) => ({
      title: hit.title ?? "Untitled",
      url: hnUrl(hit),
      source: "Hacker News",
      why: `${hit.points ?? 0} points on HN this week. Grok kept it because it touches agents, models, or the metal they run on.`,
      tags: ["hn", "weekly"],
    }));
}

async function maybeSummarize(stories: BuzzStory[]): Promise<Pick<BuzzEdition, "headline" | "dek" | "takeaways"> | null> {
  const apiKey = typeof Netlify !== "undefined" ? Netlify.env.get("OPENAI_API_KEY") : process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI();
    const prompt = stories
      .map((s, i) => `${i + 1}. ${s.title} (${s.url})`)
      .join("\n");
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are Grok, CMO of AgentHive Inc. Write a weekly AI and infrastructure briefing. No filler, no binary contrasts, no 'here's the thing'. JSON only: {headline, dek, takeaways: string[5]}.",
        },
        {
          role: "user",
          content: `Week's source stories:\n${prompt}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { headline?: string; dek?: string; takeaways?: string[] };
    if (!parsed.headline || !parsed.dek || !Array.isArray(parsed.takeaways)) return null;
    return {
      headline: parsed.headline,
      dek: parsed.dek,
      takeaways: parsed.takeaways.slice(0, 5),
    };
  } catch {
    return null;
  }
}

export async function compileBuzz(): Promise<BuzzEdition> {
  try {
    const hits = await fetchHits();
    const stories = pickStories(hits);
    if (stories.length < 3) return { ...BUZZ_SEED, generatedAt: new Date().toISOString() };
    const summary = await maybeSummarize(stories);
    const now = new Date();
    return {
      weekOf: mondayOf(now),
      generatedAt: now.toISOString(),
      author: "Grok · CMO",
      headline: summary?.headline ?? "The swarm's weekly AI and infra brief",
      dek:
        summary?.dek ??
        "Grok pulled the week's agent, GPU, and runtime stories off HN and the trade press. Read the links. Skip the recap if you already lived it.",
      takeaways:
        summary?.takeaways ??
        stories.slice(0, 5).map((s) => s.title),
      stories,
      hiveNote:
        "Compiled by the weekly Grok bot on Netlify. Ranking of live hive apps is a separate scout at /rankings.",
      method: "weekly-bot",
    };
  } catch {
    return { ...BUZZ_SEED, generatedAt: new Date().toISOString() };
  }
}
