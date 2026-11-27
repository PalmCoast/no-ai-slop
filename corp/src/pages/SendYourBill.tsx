import BillForm from "../components/BillForm";
import {
  BILL_CLOSE_BODY,
  BILL_CLOSE_CTAS_HTML,
  BILL_CLOSE_H,
  BILL_CONTACT_HTML,
  BILL_FAQ_HTML,
  BILL_FOOTER,
  BILL_FORM_TITLE,
  BILL_H1,
  BILL_HERO_CTAS_HTML,
  BILL_NDA_CLAUSE,
  BILL_NDA_LABEL,
  BILL_REDACT_HTML,
  BILL_RETENTION_HTML,
  BILL_SMALL,
  BILL_SUB,
  BILL_TOP_HTML,
} from "../../shared/b2bCopy";

/** /send-your-bill: Free Triage & Send Your AI Bill (COPY.md section 2, approved 2026-11-27). */
export default function SendYourBill() {
  return (
    <article className="cx-page">
      <section className="hero consult-hero">
        <div className="container cx">
          <div className="eyebrow">Free Triage &amp; Send Your AI Bill</div>
          <h1 className="display" style={{ fontSize: "clamp(1.85rem, 4.4vw, 3.1rem)" }}>
            {BILL_H1}
          </h1>
          <p className="lede">{BILL_SUB}</p>
          <div dangerouslySetInnerHTML={{ __html: BILL_HERO_CTAS_HTML }} />
          <p className="fine">{BILL_SMALL}</p>
        </div>
      </section>
      {BILL_TOP_HTML.map((html, i) => (
        <section className={i % 2 ? "section section-alt" : "section"} key={i}>
          <div className="container cx" dangerouslySetInnerHTML={{ __html: html }} />
        </section>
      ))}
      <section className="section section-alt" id="bill-section">
        <div className="container cx">
          <h2>{BILL_FORM_TITLE}</h2>
          <BillForm from="bill-page" />
          <h3>Mutual NDA</h3>
          <p>
            <strong>{BILL_NDA_LABEL}</strong>
          </p>
          <blockquote>
            <p>{BILL_NDA_CLAUSE}</p>
          </blockquote>
        </div>
      </section>
      <section className="section" id="retention">
        <div className="container cx" dangerouslySetInnerHTML={{ __html: BILL_RETENTION_HTML }} />
      </section>
      <section className="section section-alt" id="redact">
        <div className="container cx" dangerouslySetInnerHTML={{ __html: BILL_REDACT_HTML }} />
      </section>
      <section className="section" id="faq">
        <div className="container cx" dangerouslySetInnerHTML={{ __html: BILL_FAQ_HTML }} />
      </section>
      <section className="section section-alt" id="book">
        <div className="container cx">
          <h2>{BILL_CLOSE_H}</h2>
          <p className="lede">{BILL_CLOSE_BODY}</p>
          <div dangerouslySetInnerHTML={{ __html: BILL_CLOSE_CTAS_HTML }} />
          <p dangerouslySetInnerHTML={{ __html: BILL_CONTACT_HTML }} />
          <p className="fine">{BILL_FOOTER}</p>
        </div>
      </section>
    </article>
  );
}
