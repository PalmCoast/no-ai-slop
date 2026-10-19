import { Link } from "react-router-dom";
import { CALENDLY_URL, CONSULT_DISPLAY, CONSULT_TEL } from "../../shared/brand";
import { FD_DEPOSIT_URL } from "../../shared/offers";
import { HOW_IT_WORKS, OFFER_FAQS, PRICE_CARD, PROMISE_H2, PROMISE_LEDE, WHAT_YOU_GET } from "../../shared/offerCopy";

export function OfferCtas({ where }: { where: string }) {
  return (
    <div className="hero-actions" data-cta={where}>
      <a className="btn btn-primary" href={FD_DEPOSIT_URL}>
        Start with $875
      </a>
      <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
        Call {CONSULT_DISPLAY}
      </a>
      <a className="btn btn-outline" href={CALENDLY_URL} rel="noreferrer" target="_blank">
        Book the free 30
      </a>
    </div>
  );
}

export default function OfferSection() {
  return (
    <>
      <section className="section" id="promise">
        <div className="container">
          <h2 className="display">{PROMISE_H2}</h2>
          <p className="lede">{PROMISE_LEDE}</p>
          <OfferCtas where="promise" />
        </div>
      </section>

      <section className="section" id="what-you-get">
        <div className="container">
          <h2>What you get</h2>
          <div className="card-grid">
            {WHAT_YOU_GET.map((item) => (
              <article className="card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <h2>How it works</h2>
          <ol className="card-grid steps">
            {HOW_IT_WORKS.map((step, index) => (
              <li className="card" key={step.title}>
                <p className="fine">Step {index + 1}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="fine">
            <a href="#standup">Start the six questions</a> · <Link to="/compare">Samba vs Windows Server</Link>
          </p>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <h2>Pricing</h2>
          <article className="card price-card">
            <h3>{PRICE_CARD.title}</h3>
            <p className="price">{PRICE_CARD.price}</p>
            <p>{PRICE_CARD.sub}</p>
            <ul className="takeaways">
              {PRICE_CARD.includes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="fine">{PRICE_CARD.fine} The plan and scripts are free either way.</p>
            <OfferCtas where="pricing" />
          </article>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <h2>Questions shops ask first</h2>
          <div className="faq-list">
            {OFFER_FAQS.map((faq) => (
              <article key={faq.q} className="card">
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </article>
            ))}
          </div>
          <h2 style={{ marginTop: "2rem" }}>Get the plan, then decide</h2>
          <p className="lede">The plan is free. The build is $875 to start.</p>
          <OfferCtas where="bottom" />
        </div>
      </section>
    </>
  );
}
