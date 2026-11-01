import { useEffect, useState, type FormEvent } from "react";
import AdsShell from "../components/AdsShell";
import {
  ADS_ENGINE_GO,
  ADS_FAQS,
  ADS_INTAKE_PATH,
  ADS_SPRINT_GO,
  SAMPLE_CAPTION,
} from "../../shared/ads";

function Caption() {
  const [lead, tail] = SAMPLE_CAPTION.split(" · ");
  return (
    <span className="ads-ai">
      {lead} · <span className="ads-nw">{tail}</span>
    </span>
  );
}

export default function Ads() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("intake") === "error") {
      setError("Name, email, and a full product or store URL are required.");
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch(ADS_INTAKE_PATH, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) {
        setStatus("idle");
        setError(body?.error || "Could not send that. Try again in a moment.");
        return;
      }
      setStatus("done");
      form.reset();
    } catch {
      setStatus("idle");
      setError("Could not send that. Try again in a moment.");
    }
  }

  return (
    <AdsShell pricing>
      <main id="route-ads">
        <section className="ads-hero" id="top" aria-labelledby="hero-h">
          <div className="ads-wrap ads-hero-grid">
            <div>
              <p className="ads-eyebrow">AI Ad Sprint</p>
              <h1 id="hero-h">
                12 new ads for your product in <span>72 hours.</span>
              </h1>
              <p className="ads-lede">
                6 short video ads and 6 image ads, made from your product page and sized for the feeds you already run.
                $297. AI-generated people are always labeled as AI.
              </p>
              <div>
                <a className="ads-btn ads-btn-p" href={ADS_SPRINT_GO}>
                  Start my sprint — $297
                </a>
              </div>
              <p className="ads-under">
                Want to see the style first? <a href="#samples">See samples below.</a>
              </p>
            </div>
            <figure className="ads-hero-vis">
              <div className="ads-slot ads-r916" data-hero-sample>
                <img
                  src="/ads/samples/supplement.webp"
                  alt="Spec ad, AI-generated, 9:16"
                  width={1200}
                  height={1490}
                />
                <span className="ads-tag">Spec ad · AI-generated</span>
              </div>
              <figcaption>
                <Caption />
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="ads-section" id="samples" aria-labelledby="samples-h">
          <div className="ads-wrap">
            <h2 id="samples-h">A few we made on spec</h2>
            <p className="ads-sub">
              These are concept ads built from public product pages to show the style. Nobody paid for them, and we
              don't claim they ran.
            </p>
            <div className="ads-samples">
              <figure className="ads-sample">
                <div className="ads-slot ads-r916" data-slot="1">
                  <img
                    src="/ads/samples/supplement.webp"
                    alt="Sample ad, supplement, 9:16. Spec concept, AI-generated."
                    width={1200}
                    height={1490}
                  />
                </div>
                <figcaption>
                <Caption />
              </figcaption>
              </figure>
              <figure className="ads-sample">
                <div className="ads-slot ads-r11" data-slot="2">
                  <img
                    src="/ads/samples/skincare.webp"
                    alt="Sample ad, skincare, 1:1. Spec concept, AI-generated."
                    width={1200}
                    height={1490}
                  />
                </div>
                <figcaption>
                <Caption />
              </figcaption>
              </figure>
              <figure className="ads-sample">
                <div className="ads-slot ads-r45" data-slot="3">
                  <img
                    src="/ads/samples/homegoods.webp"
                    alt="Sample ad, home goods, 4:5. Spec concept, AI-generated."
                    width={1200}
                    height={1490}
                  />
                </div>
                <figcaption>
                <Caption />
              </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="ads-section" id="how" aria-labelledby="how-h">
          <div className="ads-wrap">
            <h2 id="how-h">How it works</h2>
            <ol className="ads-steps">
              <li>
                <strong>Send your product page.</strong>{" "}
                <span>Plus your offer, who it's for, and a few ads you like the look of.</span>
              </li>
              <li>
                <strong>We make the set.</strong>{" "}
                <span>
                  Hooks, product-in-scene shots, a short story ad and UGC-style clips, then we pick the best 6 video and
                  6 image ads.
                </span>
              </li>
              <li>
                <strong>You get a download link within 72 hours.</strong>{" "}
                <span>Every file is exported in 9:16, 1:1 and 4:5, ready to upload.</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="ads-section" id="included" aria-labelledby="inc-h">
          <div className="ads-wrap">
            <h2 id="inc-h">One sprint. 12 ads.</h2>
            <div className="ads-get">
              <div className="ads-card">
                <h3>6 video ads</h3>
                <ul className="ads-check">
                  <li>Hook variations, so you can test openings</li>
                  <li>Product-in-scene clips</li>
                  <li>An animated story ad</li>
                  <li>UGC-style clips with AI presenters, labeled as AI</li>
                </ul>
              </div>
              <div className="ads-card">
                <h3>6 image ads</h3>
                <ul className="ads-check">
                  <li>Headline and product shots built around your offer</li>
                  <li>Variations you can test against each other</li>
                </ul>
              </div>
              <div className="ads-card ads-every">
                <h3>Every ad</h3>
                <ul className="ads-check">
                  <li>Made from your product page and your offer</li>
                  <li>Exported in 9:16 (Stories/short video), 1:1 and 4:5 (feed)</li>
                  <li>Delivered within 72 hours of your intake form</li>
                  <li>AI-generated people labeled as AI</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="ads-section" id="pricing" aria-labelledby="price-h">
          <div className="ads-wrap">
            <h2 id="price-h">Pricing</h2>
            <div className="ads-plans">
              <article className="ads-plan ads-plan-main">
                <p className="ads-k">One time</p>
                <h3>AI Ad Sprint</h3>
                <p className="ads-price">
                  $297<small> one time</small>
                </p>
                <ul>
                  <li>6 video ads + 6 image ads</li>
                  <li>Delivered in 72 hours</li>
                </ul>
                <a className="ads-btn ads-btn-p" href={ADS_SPRINT_GO}>
                  Start my sprint
                </a>
              </article>
              <article className="ads-plan">
                <p className="ads-k">Ongoing</p>
                <h3>Monthly</h3>
                <p className="ads-price">
                  $997<small>/mo</small>
                </p>
                <ul>
                  <li>20 new ads every month: 12 video + 8 image</li>
                  <li>Cancel anytime before your next billing date</li>
                  <li>Keep fresh creative in rotation without briefing a new team each time</li>
                </ul>
                <a className="ads-btn ads-btn-g" href={ADS_ENGINE_GO}>
                  Start monthly
                </a>
              </article>
            </div>
            <p className="ads-small">Paid upfront by card. Monthly plan: cancel anytime before your next billing date.</p>
          </div>
        </section>

        <section className="ads-section" id="intake" aria-labelledby="intake-h">
          <div className="ads-wrap">
            <h2 id="intake-h">What we need from you</h2>
            <div className="ads-need">
              <ul>
                <li>Your product page link</li>
                <li>The offer you want to push (price, bundle, discount, launch, anything)</li>
                <li>Who it's for, in a sentence</li>
                <li>2–3 ads you like the look of, from any brand</li>
                <li>Your logo and brand colors, if you have them</li>
                <li>Anything we must not say (claims your category doesn't allow, for example)</li>
              </ul>
              <p>That's it. No calls needed.</p>
            </div>
            {status === "done" ? (
              <div className="ads-form ads-success" role="status">
                <h3>Got it. Your product is in.</h3>
                <p>
                  We have your name, email, and product page. We'll reply by email to confirm the details. Your sprint
                  starts once payment and this intake are both in. You get a download link within 72 hours of that.
                </p>
              </div>
            ) : (
              <form name="ads-intake" method="POST" action={ADS_INTAKE_PATH} onSubmit={onSubmit}>
                <input type="hidden" name="form-name" value="ads-intake" />
                <p className="ads-hp" aria-hidden="true">
                  <label htmlFor="bot-field">Leave this empty</label>
                  <input id="bot-field" name="bot-field" type="text" tabIndex={-1} autoComplete="off" />
                </p>
                <div className="ads-field">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" type="text" required autoComplete="name" placeholder="Your name" />
                </div>
                <div className="ads-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@yourbrand.com"
                    autoComplete="email"
                  />
                </div>
                <div className="ads-field">
                  <label htmlFor="product_url">Product or store URL</label>
                  <input
                    id="product_url"
                    name="product_url"
                    type="url"
                    required
                    placeholder="https://yourstore.com/products/..."
                    autoComplete="url"
                    inputMode="url"
                  />
                </div>
                <div className="ads-field">
                  <label htmlFor="note">
                    Note <span className="ads-opt">(optional)</span>
                  </label>
                  <textarea id="note" name="note" placeholder="Your offer, who it's for, ads you like" />
                </div>
                {error ? (
                  <p className="ads-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button className="ads-btn ads-btn-p" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send my product"}
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="ads-section" id="faq" aria-labelledby="faq-h">
          <div className="ads-wrap">
            <h2 id="faq-h">FAQ</h2>
            <div className="ads-faq">
              {ADS_FAQS.map((faq) => (
                <details key={faq.q}>
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ads-section ads-final" aria-labelledby="final-h">
          <div className="ads-wrap">
            <h2 id="final-h">Your next 12 ads, in 72 hours.</h2>
            <p className="ads-final-line">Send your product page. We'll do the rest.</p>
            <a className="ads-btn ads-btn-p" href={ADS_SPRINT_GO}>
              Start my sprint — $297
            </a>
          </div>
        </section>
      </main>
    </AdsShell>
  );
}
