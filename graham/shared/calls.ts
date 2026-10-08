import { CALENDLY_URL, DISCLOSURE } from "./public.ts";
import { samePhone } from "./phone.ts";
import { nextSlots, type Slot } from "./slots.ts";

export type Contact = {
  name: string;
  phones: string[];
  emails?: string[];
};

export type CallAction = "ring" | "block" | "alert" | "book" | "note";

export type ScreenResult = {
  action: CallAction;
  reason: string;
  say: string;
  urgent: boolean;
  spam: boolean;
  spamId?: string;
  contactName?: string;
  offerBooking: boolean;
  slot?: Slot;
};

const SPAM: { id: string; test: RegExp; reason: string }[] = [
  { id: "warranty", test: /extended warranty|car warranty|vehicle warranty|auto warranty/i, reason: "Warranty script." },
  { id: "press1", test: /press 1|press one|to be removed from/i, reason: "Press-1 robocall." },
  { id: "irs", test: /\birs\b|social security administration|your ssn\b/i, reason: "Agency-impersonation script." },
  {
    id: "verify",
    test: /verify your (account|identity)|unusual activity on your (card|account)|amazon account (has been )?suspended/i,
    reason: "Account-verification script.",
  },
  { id: "listing", test: /google (my )?business listing|seo package|rank(ing)? on the first page/i, reason: "Listing mill." },
  { id: "debt", test: /student loan forgiveness|lawsuit has been filed against you|final notice of debt/i, reason: "Debt-mill script." },
  { id: "medicare", test: /medicare (advantage )?benefit you qualify|free back brace|free knee brace/i, reason: "Medicare mill." },
  { id: "hold", test: /recorded for quality|do not hang up|stay on the line/i, reason: "Robocall hold script." },
];

const URGENT: { id: string; test: RegExp; reason: string }[] = [
  { id: "emergency", test: /\b(hospital|ambulance|emergency room|fire department|gas leak|house is flooding)\b/i, reason: "Emergency." },
  {
    id: "down",
    test: /\b(crew is down|crew is dark|truck is down|we(?:'re| are) dark|production is down|payroll (?:is )?stuck)\b/i,
    reason: "The work stopped.",
  },
  { id: "outage", test: /\b(outage|deploy failed|the site is down|can't log in|cannot log in)\b/i, reason: "Outage." },
];

const BOOK = /\b(book|schedule|meeting|calendly)\b|30 minutes|hop on a call/i;

export function screenCall(input: {
  from?: string;
  said?: string;
  contacts: Contact[];
  now?: Date;
  disclosure?: string;
  calendly?: string;
}): ScreenResult {
  const said = (input.said ?? "").trim();
  const from = (input.from ?? "").trim();
  const disclosure = input.disclosure ?? DISCLOSURE;
  const calendly = input.calendly ?? CALENDLY_URL;
  const contact = input.contacts.find((row) => row.phones.some((phone) => samePhone(phone, from)));
  const spam = SPAM.find((row) => row.test.test(said));
  const urgent = URGENT.find((row) => row.test.test(said));
  const wantsBook = BOOK.test(said);
  const slot = wantsBook || urgent ? nextSlots(input.now ?? new Date(), 1)[0] : undefined;

  if (contact) {
    return {
      action: "ring",
      reason: "On the contacts list.",
      say: `On the list. Ring ${contact.name}.`,
      urgent: false,
      spam: false,
      contactName: contact.name,
      offerBooking: false,
    };
  }

  if (spam) {
    return {
      action: "block",
      reason: spam.reason,
      say: `${disclosure} We're not taking this call.`,
      urgent: false,
      spam: true,
      spamId: spam.id,
      offerBooking: false,
    };
  }

  if (urgent) {
    const hold = slot ? ` I can hold ${slot.label}.` : "";
    return {
      action: "alert",
      reason: urgent.reason,
      say: `${disclosure} I have that, and I'm getting Daniel now.${hold}`,
      urgent: true,
      spam: false,
      offerBooking: wantsBook,
      slot: wantsBook ? slot : undefined,
    };
  }

  if (wantsBook && slot) {
    return {
      action: "book",
      reason: "They want time on the calendar.",
      say: `${disclosure} I can hold ${slot.label}. The live book is ${calendly}.`,
      urgent: false,
      spam: false,
      offerBooking: true,
      slot,
    };
  }

  if (!said) {
    return {
      action: "note",
      reason: "No message yet.",
      say: `${disclosure} Leave a message and it goes on his desk.`,
      urgent: false,
      spam: false,
      offerBooking: false,
    };
  }

  return {
    action: "note",
    reason: "Message for the desk.",
    say: `${disclosure} I'll put that on his desk.`,
    urgent: false,
    spam: false,
    offerBooking: false,
  };
}
