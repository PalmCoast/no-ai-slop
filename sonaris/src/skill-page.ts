/**
 * Skill page: validates the stored (or pasted) license and exposes the gated
 * download links for /api/skill.
 */
import { api } from "./api";
import { isPlausibleLicense, normalizeKey } from "./license";

const el = (id: string) => document.getElementById(id)!;
const params = new URLSearchParams(location.search);

function showLicensed(key: string, plan: string, demo: boolean): void {
  el("key-status").textContent = `${demo ? "Demo license" : plan === "monthly" ? "Monthly license" : "One-time license"} ${key} is valid.`;
  (el("download") as HTMLAnchorElement).href = `/api/skill?key=${encodeURIComponent(key)}`;
  (el("view") as HTMLAnchorElement).href = `/api/skill?key=${encodeURIComponent(key)}&inline=1`;
  el("have-key").hidden = false;
  el("no-key").hidden = true;
  localStorage.setItem("sonaris_license", key);
}

async function check(raw: string, quiet: boolean): Promise<boolean> {
  const key = normalizeKey(raw);
  if (!isPlausibleLicense(key)) {
    if (!quiet) el("key-msg").textContent = "That does not look like a Sonaris key.";
    return false;
  }
  try {
    const s = await api.license(key);
    if (s.valid) {
      showLicensed(key, s.plan ?? "one_time", s.demo);
      return true;
    }
    if (!quiet) el("key-msg").textContent = "That key is not valid.";
  } catch (e) {
    if (!quiet) el("key-msg").textContent = `Could not check the key: ${(e as Error).message}`;
  }
  return false;
}

el("key-form").addEventListener("submit", (e) => {
  e.preventDefault();
  void check((el("key-input") as HTMLInputElement).value, false);
});

void (async () => {
  const fromUrl = params.get("key");
  if (fromUrl && (await check(fromUrl, true))) return;
  const stored = localStorage.getItem("sonaris_license");
  if (stored) await check(stored, true);
})();
