import {
  BRAND_NAME,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  CONTACT_EMAIL,
  FD_NAME,
  LEGAL_NAME,
} from "../../shared/brand";
import { AFFILIATE_TOOLS, DISCLOSURE_LINE, DISCLOSURE_UPDATED } from "../../shared/disclosure";

export default function Disclosure() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "46rem" }}>
        <div className="eyebrow">Legal · {BRAND_NAME}</div>
        <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
          Affiliate disclosure
        </h1>
        <p className="lede">{DISCLOSURE_LINE}</p>
        <p className="muted">
          {BRAND_NAME} ({LEGAL_NAME}) is a Palm Coast, Florida AI consultant shop. This page covers agenthiveinc.com.
        </p>

        <h2>The short version</h2>
        <p>
          Some links on this site may be affiliate links. If you sign up or buy through one, we may earn a commission.
          We only join affiliate programs for tools we use to run our own business.
        </p>

        <h2>Which tools</h2>
        <p>The tools in our own stack that run affiliate programs:</p>
        <ul className="takeaways">
          {AFFILIATE_TOOLS.map((tool) => (
            <li key={tool.name}>
              {tool.name} ({tool.use})
            </li>
          ))}
        </ul>
        <p>
          When a link to one of these goes through a program we are in, it is an affiliate link. We do not take
          affiliate money for tools we do not use.
        </p>

        <h2>What it costs you</h2>
        <p>
          Nothing extra. You pay the same price you would pay going direct. Some programs give new customers a discount
          through the link; when they do, that discount is the program&rsquo;s offer, not ours.
        </p>

        <h2>What it does not change</h2>
        <p>
          A commission does not decide what we recommend or what we build with. We do not sell reviews, rankings or
          placement. If we stop using a tool, we take its affiliate link down.
        </p>

        <h2>Client work</h2>
        <p>
          On {FD_NAME} builds, consults and AI Concierge work we pick tools for the job. If we suggest a tool where we
          hold an affiliate link, we tell you before you sign up.
        </p>

        <h2>&ldquo;Featured on&rdquo; badges</h2>
        <p>
          The badges in our footer link to directories that list our products. They are not affiliate links, and we
          earn nothing from them.
        </p>

        <h2>Questions</h2>
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or call{" "}
          <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>.
        </p>
        <p className="muted">Last updated {DISCLOSURE_UPDATED}.</p>
      </div>
    </section>
  );
}
