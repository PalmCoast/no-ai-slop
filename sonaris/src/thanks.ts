/**
 * Post-checkout page: turns the Stripe session id into a license key (or
 * shows the demo key passed in the URL) and stores it for the console.
 */
import { api } from "./api";
import { isPlausibleLicense, normalizeKey } from "./license";

const el = (id: string) => document.getElementById(id)!;
const params = new URLSearchParams(location.search);

function showKey(key: string, plan: string): void {
  el("title").textContent = "Your Sonaris license";
  el("intro").textContent = "Keep this key. It unlocks the console and the skill download.";
  el("key").textContent = key;
  el("plan").textContent = plan === "demo" ? "Demo license (Stripe is not configured on this deployment)." : plan === "monthly" ? "Monthly plan." : "One-time license.";
  localStorage.setItem("sonaris_license", key);
  const href = `/app.html?key=${encodeURIComponent(key)}`;
  (el("open-console") as HTMLAnchorElement).href = href;
  (el("console-btn") as HTMLAnchorElement).href = href;
  (el("skill-link") as HTMLAnchorElement).href = `/skill.html?key=${encodeURIComponent(key)}`;
  el("next").hidden = false;
  el("manual").hidden = true;
}

function showProblem(message: string): void {
  el("title").textContent = "We could not confirm the payment";
  el("intro").textContent = message;
  el("key").textContent = "No key yet";
  el("manual").hidden = false;
}

async function init(): Promise<void> {
  const sessionId = params.get("session_id");
  const key = params.get("key");
  if (key && isPlausibleLicense(normalizeKey(key))) {
    const status = await api.license(normalizeKey(key)).catch(() => null);
    if (status?.valid) return showKey(normalizeKey(key), status.plan ?? "one_time");
  }
  if (sessionId) {
    try {
      const r = await api.licenseFromSession(sessionId);
      if (r.paid && r.licenseKey) return showKey(r.licenseKey, r.plan ?? "one_time");
      return showProblem("Stripe reports this session as unpaid. If the charge went through, wait a minute and reload.");
    } catch (e) {
      return showProblem((e as Error).message);
    }
  }
  const stored = localStorage.getItem("sonaris_license");
  if (stored) {
    const status = await api.license(stored).catch(() => null);
    if (status?.valid) return showKey(stored, status.plan ?? "one_time");
  }
  showProblem("No checkout session was found in the URL.");
}

el("manual-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const k = normalizeKey((el("manual-key") as HTMLInputElement).value);
  if (!isPlausibleLicense(k)) return showProblem("That does not look like a Sonaris key.");
  const status = await api.license(k).catch(() => null);
  if (status?.valid) showKey(k, status.plan ?? "one_time");
  else showProblem("That key is not valid.");
});

void init();
