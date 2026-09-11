import { CLIP_ID_ALPHABET } from "../../shared/types";

const DEVICE_KEY = "flick_device";

export function deviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_KEY) ?? "";
    if (/^[a-z0-9]{12,32}$/i.test(existing)) return existing.toLowerCase();
    let id = "";
    for (let i = 0; i < 16; i++) id += CLIP_ID_ALPHABET[Math.floor(Math.random() * CLIP_ID_ALPHABET.length)];
    localStorage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    return "anonymousdevice01";
  }
}
