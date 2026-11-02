import {
  CONSULT_DISPLAY,
  CONSULT_TEL,
  FD_NAME,
  FD_PRICE_LINE,
  FD_URL,
} from "../../shared/brand";

export default function Build() {
  return (
    <section className="section">
      <div className="container cta-split">
        <div>
          <div className="eyebrow">Custom Builds · via {FD_NAME}</div>
          <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
            One leak.
            <br />
            <em>Built on a written plan.</em>
          </h1>
          <p className="lede">
            The workflow that makes your team look slow, rebuilt to your brand. {FD_NAME} embeds, ships the front desk
            plus the live apps. {FD_PRICE_LINE} Every build runs on a written plan: scope, build, go-live, the same process as our active client builds.
          </p>
          <ul className="takeaways">
            <li>90-day projects: half upfront, half at completion.</li>
            <li>Voice line, intake, quotes, the dashboard your team actually opens.</li>
          </ul>
          <div className="hero-actions" style={{ marginTop: 18 }}>
            <a className="btn btn-primary" href={FD_URL}>
              Start {FD_NAME}
            </a>
            <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
              {FD_NAME} {CONSULT_DISPLAY}
            </a>
          </div>
        </div>
        <div className="frame">
          <img
            src="/brand/queen-full.webp"
            alt="Illustration: AgentHive Inc queen standing in gold armor"
            width={784}
            height={1168}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
