import type { Contact } from "../../shared/calls.ts";
import { OPERATOR_CONTACTS } from "../../shared/private.ts";
import type { Slot } from "../../shared/slots.ts";

export type Slip = {
  id: string;
  at: string;
  from: string;
  said: string;
  action: string;
  summary: string;
};

export type Hold = {
  id: string;
  at: string;
  name: string;
  topic: string;
  slot: Slot;
};

export type Alert = {
  id: string;
  at: string;
  from: string;
  said: string;
  reason: string;
};

export type DeskFile = {
  contacts: Contact[];
  notes: Slip[];
  bookings: Hold[];
  alerts: Alert[];
};

function fresh(): DeskFile {
  return {
    contacts: OPERATOR_CONTACTS.map((row) => ({ ...row, phones: [...row.phones], emails: [...(row.emails ?? [])] })),
    notes: [],
    bookings: [],
    alerts: [],
  };
}

let memory = fresh();

export function resetDesk(): void {
  memory = fresh();
}

export function readMemory(): DeskFile {
  return memory;
}

export async function readDesk(): Promise<DeskFile> {
  return memory;
}

export async function writeDesk(next: DeskFile): Promise<void> {
  memory = next;
  if (!process.env.NETLIFY) return;
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("graham-desk");
    await store.setJSON("desk", next);
  } catch (error) {
    console.error("graham desk persist failed", error);
  }
}

export function publicContacts(contacts: Contact[]): { name: string; rings: boolean }[] {
  return contacts.map((row) => ({ name: row.name, rings: row.phones.length > 0 }));
}
