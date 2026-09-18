import {
  CONSULT_DISPLAY,
  CONSULT_TEL,
  FD_NAME,
  FD_PRICE,
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
            <em>Live this week.</em>
          </h1>
          <p className="lede">
            Missed calls, dead quotes, a board that still lives on the wall. {FD_NAME} embeds, ships the after-hours desk
            plus the live apps, and stays on for $250/month. If it is not live this week, you do not pay the setup.
          </p>
          <ul className="takeaways">
            <li>Setup $1,500. Live this week or you don’t pay.</li>
            <li>Then $250/month per company to keep the desk and the apps on. {FD_PRICE}.</li>
            <li>Voice line, dispatch, quotes, the board your crew actually opens.</li>
          </ul>
          <div className="hero-actions" style={{ marginTop: 18 }}>
            <a className="btn btn-primary" href={`${FD_URL}#check`}>
              Start {FD_NAME}
            </a>
            <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
              {FD_NAME} {CONSULT_DISPLAY}
            </a>
          </div>
        </div>
        <div className="frame">
          <img src="/brand/queen-full.jpg" alt="AgentHive Inc queen standing in gold armor" />
        </div>
      </div>
    </section>
  );
}
