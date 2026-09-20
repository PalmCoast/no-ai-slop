import type { Answers } from "../shared/types";
import { defaultAnswers, DEMO_ANSWERS } from "../shared/questions";

export const STORAGE_KEY = "netyard.answers";

export function loadAnswers(): Answers | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Answers;
    if (!parsed.businessName || !parsed.headcount) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAnswers(answers: Answers): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

export function loadOrDefault(): Answers {
  return loadAnswers() ?? defaultAnswers();
}

export function loadDemo(): Answers {
  saveAnswers(DEMO_ANSWERS);
  return DEMO_ANSWERS;
}
