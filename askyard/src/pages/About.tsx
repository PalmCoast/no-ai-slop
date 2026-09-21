import BoardQa from "../components/BoardQa";
import IdentityFacts from "../components/IdentityFacts";
import {
  BRAND_COMPANY,
  BRAND_NAME,
  BRAND_PARENT,
  BRAND_PLACE,
  CALENDLY_URL,
  COMPANY_URL,
  CONSULT_DISPLAY_SEO,
  CONSULT_TEL,
  FD_PRICE_LONG,
  LEGAL_NAME,
  OTHER_HIVES,
  PARENT_URL,
} from "../../shared/brand";

export default function About() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="eyebrow">
          {BRAND_NAME} · {BRAND_COMPANY} · {BRAND_PLACE}
        </div>
        <h1 className="display">About {BRAND_NAME}</h1>
        <p className="lede">
          {BRAND_NAME} is the free Q&A front door from {BRAND_PARENT}. It is not the paid after-hours desk.
        </p>
        <IdentityFacts />
        <p className="muted" style={{ marginTop: 12 }}>
          {BRAND_COMPANY} / {LEGAL_NAME} builds it in {BRAND_PLACE}. {BRAND_PARENT} is {FD_PRICE_LONG}. Phone{" "}
          <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY_SEO}</a>. {OTHER_HIVES} Distinct from other AgentHive names in
          insurance, OSS, or QpiAI.
        </p>
        <div className="hero-actions" style={{ marginTop: 18 }}>
          <a className="btn btn-primary" href={PARENT_URL}>
            {BRAND_PARENT}
          </a>
          <a className="btn btn-outline" href={COMPANY_URL}>
            {BRAND_COMPANY}
          </a>
          <a className="btn btn-outline" href={CALENDLY_URL} rel="noreferrer" target="_blank">
            Book the free 30
          </a>
        </div>
        <BoardQa heading="Board questions" />
      </div>
    </section>
  );
}
