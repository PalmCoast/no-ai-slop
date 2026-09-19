import OpenAI from "openai";
import { offerFor, pickOfferSlug } from "../../shared/ask.ts";
import { BRAND_COMPANY, BRAND_NAME, BRAND_PARENT, FD_PRICE, FD_PROMISE } from "../../shared/brand.ts";

export async function draftAnswer(question: string): Promise<string> {
  const apiKey = typeof Netlify !== "undefined" ? Netlify.env.get("OPENAI_API_KEY") : process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackAnswer(question);
  }
  try {
    const client = new OpenAI();
    const offer = offerFor(pickOfferSlug(question));
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You write free answers for ${BRAND_NAME}, a ${BRAND_PARENT} product from ${BRAND_COMPANY} in Palm Coast. Audience: plumbers, teachers, receptionists, earth movers, shop owners. Rules: plain English, short sentences, no hype, no binary contrasts, no banned words (leverage, seamless, empower, robust, cutting-edge). Give a usable answer in 120-180 words. End with one concrete next step and this offer: ${offer.title}, ${offer.price}. ${offer.line} ${BRAND_PARENT} is ${FD_PRICE}. ${FD_PROMISE}.`,
        },
        { role: "user", content: question },
      ],
    });
    const text = completion.choices[0]?.message?.content?.trim();
    return text || fallbackAnswer(question);
  } catch {
    return fallbackAnswer(question);
  }
}

export function fallbackAnswer(question: string): string {
  const offer = offerFor(pickOfferSlug(question));
  return `Here is the working version. Name the job in one sentence, pick the smallest tool that does that job, and put a price next to it. Do not start with a chatbot on the homepage if the leak is the phone, the quote, or proof the crew showed up. ${BRAND_NAME} keeps this answer free. If you want it built, ${offer.title} is ${offer.price}. ${offer.line}`;
}
