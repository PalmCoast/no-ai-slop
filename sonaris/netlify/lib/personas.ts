/**
 * Server-side persona registry: built-ins from src/personas.ts plus custom
 * personas stored per license in the `personas` store.
 */
import { BUILTIN_PERSONAS, findPersona, type Persona } from "../../src/personas";
import { openStore } from "./store";

export { BUILTIN_PERSONAS };

function key(licenseKey: string): string {
  return `${licenseKey}.json`;
}

export async function loadCustomPersonas(licenseKey: string): Promise<Persona[]> {
  const raw = await openStore("personas").get(key(licenseKey));
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as Persona[];
    return Array.isArray(list) ? list.filter((p) => p && typeof p.id === "string") : [];
  } catch {
    return [];
  }
}

export async function saveCustomPersonas(licenseKey: string, list: Persona[]): Promise<void> {
  await openStore("personas").set(key(licenseKey), JSON.stringify(list));
}

export async function resolvePersona(personaId: string | undefined, licenseKey: string): Promise<Persona> {
  const custom = licenseKey ? await loadCustomPersonas(licenseKey) : [];
  return findPersona(personaId, custom);
}
