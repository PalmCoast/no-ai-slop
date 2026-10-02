import type { Contact } from "./calls.ts";
import { PLUGINS, SKILLS } from "./catalog.ts";
import {
  BEING,
  CALENDLY_URL,
  DISCLOSURE,
  FORWARD_RULE,
  MONTHLY_USD,
  MONDAY_DROP,
  OPERATOR,
  PLACE,
  PILLARS,
  PRICE_LABEL,
  ROUTINES,
  SETUP_USD,
  SHOP,
  TEMPLATE_SOURCE,
} from "./public.ts";

export type HigginsTemplate = {
  kind: "higgins-template";
  source: typeof TEMPLATE_SOURCE;
  recipe: true;
  being: string;
  operator: string;
  shop: string;
  place: string;
  disclosure: string;
  forward: string;
  context: string[];
  skills: { id: string; name: string; job: string; href: string }[];
  routines: { id: string; when: string; does: string }[];
  plugins: { id: string; name: string; job: string; secret: false }[];
  pillars: { id: string; name: string; job: string }[];
  monday: { lane: string; thing: string; price: string; reason: string }[];
  memories: "operator-supplied";
  credentials: "not-included";
  contacts: "not-included";
  price: { setupUsd: number; monthlyUsd: number; label: string; book: string };
};

const SECRET_PATTERN = /sk-|api[_-]?key|bearer\s+[a-z0-9]/i;

function containsPhone(packed: string): boolean {
  const hits = packed.match(/\+?\d[\d\s().-]{8,}\d/g) ?? [];
  return hits.some((hit) => hit.replace(/\D/g, "").length >= 10);
}

export function danielTemplate(): HigginsTemplate {
  return toTemplate({
    being: BEING,
    operator: OPERATOR,
    shop: SHOP,
    place: PLACE,
    disclosure: DISCLOSURE,
  });
}

export function toTemplate(input: {
  being: string;
  operator: string;
  shop: string;
  place: string;
  disclosure: string;
}): HigginsTemplate {
  return {
    kind: "higgins-template",
    source: TEMPLATE_SOURCE,
    recipe: true,
    being: input.being,
    operator: input.operator,
    shop: input.shop,
    place: input.place,
    disclosure: input.disclosure,
    forward:
      input.being === BEING
        ? FORWARD_RULE
        : `Unknown callers hit ${input.being}. A number on the contacts list still rings their cell. A mill script is blocked. A country code is not a reason.`,
    context: [
      `${input.being} answers for ${input.operator}.`,
      input.disclosure,
      "Team Bot shape: shared skills, private conversations, no copied logins.",
    ],
    skills: SKILLS.map(({ id, name, job, href }) => ({ id, name, job, href })),
    routines: ROUTINES.map((row) => ({ ...row })),
    plugins: PLUGINS.map(({ id, name, job }) => ({ id, name, job, secret: false as const })),
    pillars: PILLARS.map((row) => ({ ...row })),
    monday: MONDAY_DROP.map((row) => ({ ...row })),
    memories: "operator-supplied",
    credentials: "not-included",
    contacts: "not-included",
    price: { setupUsd: SETUP_USD, monthlyUsd: MONTHLY_USD, label: PRICE_LABEL, book: CALENDLY_URL },
  };
}

/** Fail closed: a template that still holds a phone or a key is not shippable. */
export function templateLeaks(template: HigginsTemplate, contacts: Contact[], secrets: string[]): string[] {
  const packed = JSON.stringify(template);
  const leaks: string[] = [];
  for (const contact of contacts) {
    for (const phone of contact.phones) {
      const digits = phone.replace(/\D/g, "");
      if (digits && packed.includes(digits)) leaks.push(phone);
    }
    for (const email of contact.emails ?? []) {
      if (packed.toLowerCase().includes(email.toLowerCase())) leaks.push(email);
    }
  }
  for (const secret of secrets) {
    if (secret && packed.includes(secret)) leaks.push(secret);
  }
  if (SECRET_PATTERN.test(packed)) leaks.push("secret-pattern");
  if (containsPhone(packed)) leaks.push("phone-pattern");
  return leaks;
}
