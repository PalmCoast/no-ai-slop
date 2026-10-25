import type { ScreenResult } from "../shared/calls.ts";
import type { Slot } from "../shared/slots.ts";

export type SessionHold = {
  id: string;
  at: string;
  name: string;
  topic: string;
  slot: Slot;
};

export type SessionSlip = {
  id: string;
  at: string;
  from: string;
  said: string;
  result: ScreenResult;
};

type Listener = () => void;

let slips: SessionSlip[] = [];
let holds: SessionHold[] = [];
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function sessionSlips(): SessionSlip[] {
  return slips;
}

export function sessionHolds(): SessionHold[] {
  return holds;
}

export function pushSlip(slip: SessionSlip): void {
  slips = [slip, ...slips].slice(0, 40);
  emit();
}

export function pushHold(hold: SessionHold): void {
  holds = [hold, ...holds].slice(0, 20);
  emit();
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
