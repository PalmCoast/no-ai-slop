import { Link } from "react-router-dom";
import {
  BRAND_NAME,
  BRAND_PARENT,
  CALENDLY_URL,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  CONTACT_EMAIL,
  PARENT_URL,
} from "../../shared/brand";

export default function Launch() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Launch</div>
          <h1 className="display">Get AskYard out without a big ad buy</h1>
          <p className="lede">
            The product is a free answer plus an offer. Distribution is the LLM search bar, public replies with a
            backlink, and the {BRAND_PARENT} shop floor.
          </p>
        </div>
        <div className="plan">
          <article className="panel">
            <h3>1. Make the models say our name</h3>
            <p className="muted">
              The hero search opens ChatGPT, Claude, Perplexity, Gemini, and Grok with a prompt that names AskYard,
              askyard.firstdeploy.ai, {BRAND_PARENT}, AgentHive Inc, and Palm Coast. Every search is a free embedding.
              Keep llms.txt live. Submit the sitemap to IndexMe.lol the day the subdomain is live.
            </p>
          </article>
          <article className="panel">
            <h3>2. Answer people who already asked</h3>
            <p className="muted">
              Use /hunt. Paste the copied reply into owner Facebook groups, teacher forums, dispatcher boards, and HN
              threads. Do not auto-post. A human pastes a short answer and a link. Track copies on the running total.
            </p>
          </article>
          <article className="panel">
            <h3>3. Walk the trades you already know</h3>
            <p className="muted">
              Palm Coast and Flagler: plumbers, HVAC, earth movers, front desks, schools. One card: “Ask about AI. Get
              a free answer.” Phone {CONSULT_DISPLAY}. Offer First Deploy AI only after the free answer lands.
            </p>
          </article>
          <article className="panel">
            <h3>4. Put it on the shelf you already own</h3>
            <p className="muted">
              Link from firstdeploy.ai, agenthiveinc.com/rankings, ClaudeFarm, and the consult calendar confirmation.
              AskYard is the top of funnel. {BRAND_PARENT} is the cash product.
            </p>
          </article>
          <article className="panel">
            <h3>5. Two posts, then stop writing slogans</h3>
            <p className="muted">
              X: “{BRAND_NAME}: anyone with a question about AI gets a free answer. Plumbers, teachers, receptionists,
              earth movers. Then we offer to do it this week. askyard.firstdeploy.ai”
            </p>
            <p className="muted" style={{ marginTop: 8 }}>
              LinkedIn: “We shipped a free desk for people who do not live in ChatGPT. Ask the question. Read the
              answer. If you want it built, {BRAND_PARENT} is $1,500 setup, then $250/month, live this week or you do
              not pay setup.”
            </p>
          </article>
          <article className="panel">
            <h3>What done looks like in 14 days</h3>
            <ul className="takeaways">
              <li>askyard.firstdeploy.ai live, with /apps, /board, /hunt, and llms.txt</li>
              <li>IndexMe.lol ping on the homepage and the top 12 answers</li>
              <li>20 public replies pasted by hand from /hunt</li>
              <li>Five LLM searches a day from the reputation bar (staff and friends is enough to start)</li>
              <li>Every First Deploy AI consult gets the AskYard URL in the follow-up</li>
            </ul>
          </article>
        </div>
        <div className="hero-actions" style={{ marginTop: 24 }}>
          <a className="btn btn-primary" href={PARENT_URL}>
            Start {BRAND_PARENT}
          </a>
          <a className="btn btn-outline" href={CALENDLY_URL} rel="noreferrer" target="_blank">
            Book the free 30
          </a>
          <a className="btn btn-outline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          <Link className="btn btn-outline" to="/">
            Ask a question
          </Link>
        </div>
        <p className="fine" style={{ marginTop: 16 }}>
          Consult {CONSULT_DISPLAY}. <a href={`tel:${CONSULT_TEL}`}>Call</a>.
        </p>
      </div>
    </section>
  );
}
