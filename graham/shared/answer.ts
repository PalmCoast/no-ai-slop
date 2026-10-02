import { CALENDLY_URL, DISCLOSURE, PRICE_LABEL } from "./public.ts";
import { SKILLS } from "./catalog.ts";

export type Answer = {
  lane: "style" | "gift" | "fantasy" | "shop" | "line" | "desk";
  headline: string;
  detail: string;
  price?: string;
  reason: string;
  href?: string;
  spoken: string;
};

function speak(disclosure: string, parts: string[]): string {
  return [disclosure, ...parts.filter(Boolean)].join(" ");
}

function skill(id: string) {
  return SKILLS.find((row) => row.id === id);
}

export function answerAs(question: string, disclosure = DISCLOSURE): Answer {
  const q = question.trim();
  const text = q.toLowerCase();

  if (/wedding|what do i wear|navy suit/.test(text)) {
    const headline = "Navy suit, white shirt, brown loafers.";
    const detail = "Bring a charcoal overcoat if it runs past sunset.";
    const price = "$250–$400 for the suit";
    const reason = "That is the outdoor October wedding uniform. The overcoat is what keeps the photos from looking cold.";
    return { lane: "style", headline, detail, price, reason, href: skill("guythread")?.href, spoken: speak(disclosure, [headline, detail, price + ".", reason]) };
  }

  if (/anniversary|chef|dutch oven|gift/.test(text)) {
    const headline = "A chef's knife or a cast-iron Dutch oven.";
    const detail = "Tell me what she already owns and it narrows to one.";
    const price = "About $100";
    const reason = "She cooks, and Saturday is the anniversary. Check the live price before you buy.";
    return { lane: "gift", headline, detail, price, reason, href: skill("guythread")?.href, spoken: speak(disclosure, [headline, detail, price + ".", reason]) };
  }

  if (/puka|jacobs|flex|half-ppr|fantasy/.test(text)) {
    const headline = "Start Puka.";
    const detail = "More targets and more upside this week.";
    const price = "Half-PPR flex";
    const reason = "If injury news flips before kickoff, the start flips with it.";
    return { lane: "fantasy", headline, detail, price, reason, href: skill("guythread")?.href, spoken: speak(disclosure, [headline, detail, reason]) };
  }

  if (/country code|india|mill|spam|warranty script|block/.test(text)) {
    const headline = "A mill script is blocked. A country code is not.";
    const detail = "People on the contacts list still ring the cell. Everyone else gets Higgins.";
    const reason = "Warranty, press-1, and fake-agency scripts die here. A real HVAC quote from an unfamiliar number becomes a note.";
    return { lane: "line", headline, detail, reason, spoken: speak(disclosure, [headline, detail, reason]) };
  }

  if (/who are you|your name|higgins/.test(text) && !/stand|setup|price|cost/.test(text)) {
    const headline = "Higgins. Daniel's line.";
    const detail = "I book, I take the note, and I get him when it cannot wait.";
    const reason = "The cell still rings for the contacts list. I am the forward for everyone else.";
    return { lane: "desk", headline, detail, reason, spoken: speak(disclosure, [headline, detail, reason]) };
  }

  if (/stand up|standup|another (owner|shop|client)|your own being|surname|\$1,?750|setup fee/.test(text)) {
    const headline = "Same desk, their surname.";
    const detail = "Their contacts, their voice sample, their logins. The recipe does not copy Daniel's.";
    const price = PRICE_LABEL;
    const reason = "That is the First Deploy setup. Book the free 30 and the invoice follows the written plan.";
    return {
      lane: "shop",
      headline,
      detail,
      price,
      reason,
      href: CALENDLY_URL,
      spoken: speak(disclosure, [headline, detail, price + ".", reason]),
    };
  }

  if (/night call|after hours|missed call|stop missing/.test(text)) {
    const yard = skill("askyard");
    const headline = "The night call should land on a desk, not a voicemail grave.";
    const detail = "Higgins is that desk for this line. AskYard answers the same question for a shop that is not ready to buy.";
    const price = yard?.price;
    const reason = "Free answer first. The paid forward is the setup.";
    return { lane: "shop", headline, detail, price, reason, href: yard?.href, spoken: speak(disclosure, [headline, detail, reason]) };
  }

  if (/windows server|samba|network|wifi|wi-fi/.test(text)) {
    const net = skill("netyard");
    const headline = "Skip the Windows Server quote.";
    const detail = "NetYard asks six questions and writes the Debian plan, the guest Wi-Fi, and the shopping list.";
    const price = net?.price;
    const reason = "The wizard is free. The install, if they want us to do it, is First Deploy.";
    return { lane: "shop", headline, detail, price, reason, href: net?.href, spoken: speak(disclosure, [headline, detail, reason]) };
  }

  if (/job|veteran|hiring|stateside/.test(text)) {
    const jobs = skill("stateside");
    const headline = "Post it on Stateside.";
    const detail = "US work location, US work authorization, veterans see it first.";
    const price = jobs?.price;
    const reason = "Seekers don't pay. The posting is ten dollars.";
    return { lane: "shop", headline, detail, price, reason, href: jobs?.href, spoken: speak(disclosure, [headline, detail, reason]) };
  }

  if (/adhd|audhd|too much|one task|latch|focus/.test(text)) {
    const latch = skill("latch");
    const headline = "One task. A timer you can see coming.";
    const detail = "Latch parks the other thought and stops when it is too much.";
    const price = latch?.price;
    const reason = "The timer is free. The record of time on task is $29 once. It is not a treatment.";
    return { lane: "shop", headline, detail, price, reason, href: latch?.href, spoken: speak(disclosure, [headline, detail, reason]) };
  }

  if (/voice|talk|video|reel|body double/.test(text)) {
    const headline = "I can say it out loud and cut the caption reel.";
    const detail = "The reel is Higgins on a black card, not a fake face. A cloned voice stays on the operator's own ElevenLabs account.";
    const reason = "Talk is in the browser. The file is theirs to send.";
    return { lane: "desk", headline, detail, reason, spoken: speak(disclosure, [headline, detail, reason]) };
  }

  const headline = "I'll take that to Daniel.";
  const detail = "If it is a shop question, AskYard will answer it free. If you want him in the room, the 30 is on the calendar.";
  const reason = "I don't invent a price I don't have.";
  return {
    lane: "desk",
    headline,
    detail,
    reason,
    href: "https://askyard.firstdeploy.ai/",
    spoken: speak(disclosure, [headline, detail, reason]),
  };
}
