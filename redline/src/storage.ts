import type { BillCase } from "../shared/case";

const KEY = "redline.v1";
const DRAFT = "redline.draft";

export type Store = {
  pass: string | null;
  cases: BillCase[];
};

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { pass: null, cases: [] };
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      pass: typeof parsed.pass === "string" ? parsed.pass : null,
      cases: Array.isArray(parsed.cases) ? parsed.cases : [],
    };
  } catch {
    return { pass: null, cases: [] };
  }
}

export function saveStore(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function saveDraft(text: string, label: string) {
  sessionStorage.setItem(DRAFT, JSON.stringify({ text, label }));
}

export function peekDraft(): { text: string; label: string } | null {
  try {
    const raw = sessionStorage.getItem(DRAFT);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { text?: string; label?: string };
    if (!parsed.text) return null;
    return { text: parsed.text, label: parsed.label || "paste" };
  } catch {
    return null;
  }
}

export function clearDraft() {
  sessionStorage.removeItem(DRAFT);
}
