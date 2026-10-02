import { toTemplate, type HigginsTemplate } from "./template.ts";

export type StandInput = {
  surname?: string;
  operator?: string;
  shop?: string;
  place?: string;
};

export type StandResult =
  | { ok: true; being: string; template: HigginsTemplate }
  | { ok: false; error: "surname_required" | "surname_invalid" | "operator_required" };

const SURNAME = /^[A-Za-z][A-Za-z'’.-]{0,39}(?: [A-Za-z][A-Za-z'’.-]{0,39})?$/;

export function beingName(surname: string): string {
  return surname
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b([a-z])/g, (letter) => letter.toUpperCase());
}

export function standUp(input: StandInput): StandResult {
  const surname = (input.surname ?? "").trim();
  const operator = (input.operator ?? "").trim();
  if (surname.length < 2) return { ok: false, error: "surname_required" };
  if (!SURNAME.test(surname)) return { ok: false, error: "surname_invalid" };
  if (operator.length < 2) return { ok: false, error: "operator_required" };
  const being = beingName(surname);
  const shop = (input.shop ?? "").trim() || `${operator}'s shop`;
  const place = (input.place ?? "").trim() || "Their town";
  const disclosure = `This is ${being}, ${operator}'s line.`;
  return {
    ok: true,
    being,
    template: toTemplate({ being, operator, shop, place, disclosure }),
  };
}
