import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { BuyButtons } from "../components/BuyButtons";
import { formatUsd, FREE_MAX_DURATION_MS, PAID_PLANS } from "../../shared/plans";

export function Pricing() {
  return (
    <Layout marquee>
      <p className="now-showing">Payment gate · watch is free · publish is the ticket</p>
      <section className="billboard compact">
        <div className="chaser" aria-hidden="true">
          {Array.from({ length: 40 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${(i % 8) * 0.12}s` }} />
          ))}
        </div>
        <p className="kicker lights-kicker">The house</p>
        <h1 className="marquee-title smaller">
          <span>LIGHTS</span>
        </h1>
        <p className="marquee-tag">PAY TO PUBLISH. NEVER TO WATCH.</p>
      </section>

      <section className="price-grid">
        <article className="price-card">
          <p className="kicker">Street</p>
          <h2>Free</h2>
          <p className="price-amt">$0</p>
          <ul>
            <li>Record screen, camera, or both</li>
            <li>Download the file on this device</li>
            <li>One published link, {FREE_MAX_DURATION_MS / 60000} minutes max</li>
            <li>Watchers never need an account</li>
          </ul>
          <Link className="btn ghost big" to="/record">
            Record on the street
          </Link>
        </article>
        <article className="price-card featured">
          <p className="kicker">Lights</p>
          <h2>{PAID_PLANS.monthly.name}</h2>
          <p className="price-amt">
            {formatUsd(PAID_PLANS.monthly.cents)}
            <small>/mo</small>
          </p>
          <ul>
            <li>Unlimited published Flicks</li>
            <li>Fifteen minutes / 100 MB</li>
            <li>Cancel any time in the Stripe portal</li>
            <li>The default seat after launch week</li>
          </ul>
          <BuyButtons highlight="monthly" only="monthly" />
        </article>
        <article className="price-card gold">
          <p className="kicker">Marquee</p>
          <h2>{PAID_PLANS.founder.name}</h2>
          <p className="price-amt">
            {formatUsd(PAID_PLANS.founder.cents)}
            <small> once</small>
          </p>
          <ul>
            <li>Founder lifetime. Same limits as Lights</li>
            <li>Pay once during the opening window</li>
            <li>No subscription. No portal to babysit</li>
            <li>Your name on the opening-night board</li>
          </ul>
          <BuyButtons highlight="founder" only="founder" />
        </article>
      </section>
      <p className="fine center">
        Stripe Checkout. No card form on this site. Demo licenses only when Stripe is off and this is not production.
      </p>
    </Layout>
  );
}
