import { ADS_H1, ADS_SPRINT_GO } from "../../shared/ads";

/**
 * Short hop in front of /go/ads-sprint so PostHog and buy_click can run
 * before checkout. The old $297 / $997 Ad Sprint landing is no longer published.
 * Standalone on purpose: the site Layout footer contains a phone number that
 * the ads page tests flag, and this hop should stay a short checkout confirm.
 */
export default function Ads() {
  return (
    <main id="route-ads" className="section">
      <div className="container" style={{ maxWidth: "36rem", margin: "0 auto", padding: "3rem 1.25rem" }}>
        <p className="eyebrow">AgentHive Inc</p>
        <h1 className="display">{ADS_H1}</h1>
        <p className="lede">
          The AI Ad Sprint checkout is retired. This page continues to the $150 burn-audit hour.
          One operator, paid on Stripe.
        </p>
        <p>
          If you followed an older sprint link, you are in the right place. The $150 hour is a
          working session with Daniel Graham: one operator in the room, not a slide deck, and no
          contract attached to the hour. Continue below and we send you to checkout with the
          audit150 product key and the standard source, medium, and campaign values on the hop.
        </p>
        <p>
          After the hour you can stop, book more consult time, or look at the 10-hour operator pack
          or monthly Concierge. Those are separate offers. This button only starts the audit hour.
        </p>
        <p>
          <a
            className="btn btn-primary"
            href={`${ADS_SPRINT_GO}?from=ads`}
            rel="noopener"
            data-product="audit150"
            data-utm-source="dir"
            data-utm-medium="page"
            data-utm-campaign="audit150"
            data-utm-content="ah-ads-hop"
          >
            Continue to the $150 audit
          </a>
        </p>
        <p className="fine">
          <a href="/consult">See consulting rates</a>
          {" · "}
          <a href="/concierge">AI Concierge</a>
        </p>
      </div>
    </main>
  );
}
