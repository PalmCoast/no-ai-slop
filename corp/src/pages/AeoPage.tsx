import { Link, useLocation } from "react-router-dom";
import AskAiBar from "../components/AskAiBar";
import FaqList from "../components/FaqList";
import { ASK_AI_PROMPTS } from "../../shared/ask-ai";
import {
  AEO_BROOMS_TEE_URL,
  AEO_LIMITS,
  AEO_PACK_DEPOSIT_URL,
  AEO_PAGES,
  AEO_PHONE_DISPLAY,
  AEO_SOURCES,
  aeoPageFor,
} from "../../shared/aeo";
import { CONSULT_TEL, HIVE_CONSULT_PATH } from "../../shared/brand";
import { CONCIERGE_PATH, CONCIERGE_STRIPE_URL } from "../../shared/concierge";
import NotFound from "./NotFound";

export default function AeoPage() {
  const { pathname } = useLocation();
  const page = aeoPageFor(pathname);
  if (!page) return <NotFound />;
  const others = AEO_PAGES.filter((item) => item.path !== page.path);
  const packHref = page.packHref ?? HIVE_CONSULT_PATH;
  const packDisclosure =
    page.packDisclosure ??
    "The pack link charges $625 up front. The full ten-hour pack is $1,250. It is not a pay-in-full link.";
  const limits = page.limits ?? AEO_LIMITS;
  const limitsIntro =
    page.limitsIntro ??
    "For funded teams of 30–200 people who already pay for AI, and for founders who want the work to look finished.";

  return (
    <article className="aeo-page">
      <section className="section" id={page.routeId}>
        <div className="container">
          <h1 className="display" style={{ fontSize: "clamp(1.85rem, 4.4vw, 3.1rem)" }}>
            {page.h1}
          </h1>
          <p className="lede">{page.answer}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to={CONCIERGE_PATH}>
              AI Concierge — $2,000/mo
            </Link>
            <Link className="btn btn-outline" to={packHref}>
              10-hour pack — $1,250
            </Link>
            <a className="btn btn-outline" href={CONCIERGE_STRIPE_URL} rel="noreferrer">
              Start AI Concierge — $2,000/mo
            </a>
            <a className="btn btn-outline" href={AEO_PACK_DEPOSIT_URL} rel="noreferrer">
              Pay the $625 deposit on the $1,250 pack
            </a>
          </div>
          <p className="fine">{packDisclosure}</p>
        </div>
      </section>

      <AskAiBar prompt={ASK_AI_PROMPTS[page.ask]} />

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>What to agree before work starts</h2>
          </div>
          <p>{page.agree}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {page.stackH2 && page.stackBody ? (
            <>
              <div className="section-head">
                <h2>{page.stackH2}</h2>
              </div>
              <p>{page.stackBody}</p>
            </>
          ) : null}
          <div className="section-head" style={page.stackH2 ? { marginTop: "2rem" } : undefined}>
            <h2>Price, scope, and limits</h2>
            <p>{limitsIntro}</p>
          </div>
          <ul className="cost-list">
            {limits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Questions</h2>
          </div>
          <FaqList items={page.faqs} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Sources on this site</h2>
            <p>Internal pages. These are published offers, not client results, testimonials, or measured savings.</p>
          </div>
          <ul className="cost-list">
            {AEO_SOURCES.map((source) => (
              <li key={source.href}>
                <Link to={source.href}>{source.label}</Link>. {source.note}
              </li>
            ))}
          </ul>
          <h2 style={{ marginTop: "2rem" }}>Related questions</h2>
          <ul className="cost-list">
            {others.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>{item.h1}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Contact</h2>
          </div>
          <p>
            Call{" "}
            <a href={`tel:${CONSULT_TEL}`}>
              <strong>{AEO_PHONE_DISPLAY}</strong>
            </a>
            . Read the offer before you pay: <Link to={CONCIERGE_PATH}>AI Concierge</Link> or{" "}
            <Link to={HIVE_CONSULT_PATH}>the operator pack</Link>.
          </p>
          <p className="fine">
            Identity apparel is a separate shop, not part of Concierge or the pack.{" "}
            <a href={AEO_BROOMS_TEE_URL} rel="noreferrer">
              My Ram My Rules tee at Brooms.ai
            </a>
            . The current price, fulfillment, and delivery terms are on that product page.
          </p>
        </div>
      </section>
    </article>
  );
}
