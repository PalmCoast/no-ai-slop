/**
 * Marketing page: wires the "Get a license" buttons to /api/checkout. In demo
 * mode (no Stripe) the response carries a demo key, which we store and use to
 * open the console.
 */
import { api } from "./api";

const msg = document.getElementById("checkout-msg");

function say(text: string): void {
  if (msg) msg.textContent = text;
}

async function checkout(plan: "one_time" | "monthly"): Promise<void> {
  say("Opening checkout…");
  try {
    const r = await api.checkout(plan);
    if (r.url) {
      location.href = r.url;
      return;
    }
    if (r.demo && r.licenseKey) {
      localStorage.setItem("sonaris_license", r.licenseKey);
      say(`Stripe is not configured on this deployment, so you received a demo license (${r.licenseKey}). Opening the console…`);
      window.setTimeout(() => (location.href = `/app.html?key=${encodeURIComponent(r.licenseKey!)}`), 1200);
      return;
    }
    say(r.message ?? "Checkout did not return a URL.");
  } catch (e) {
    say(`Checkout failed: ${(e as Error).message}`);
  }
}

document.querySelectorAll<HTMLElement>("[data-checkout]").forEach((el) => {
  el.addEventListener("click", (ev) => {
    if (el instanceof HTMLButtonElement && el.disabled) return;
    const plan = el.dataset.checkout === "monthly" ? "monthly" : "one_time";
    // Anchor buttons in the hero jump to #pricing; only the pricing button pays.
    if (el.tagName === "A") return;
    ev.preventDefault();
    void checkout(plan);
  });
});
