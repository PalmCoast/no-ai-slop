import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PARENT_NAME, PARENT_URL } from "../../shared/brand.ts";
import { runBook } from "../../shared/book.ts";
import { sampleBook } from "../../shared/sample.ts";
import { BuyLink } from "../components/BuyLink.tsx";
import { CutList, Figures } from "../components/CutList.tsx";
import { saveBook } from "../lib/store.ts";

const SOURCES = [
  {
    name: "Bain, Technology Report 2026",
    href: "https://www.bain.com/insights/100-billion-saas-opportunity-hiding-in-cross-system-labor100-billion-saas-opportunity-hiding-in-cross-system-labor-technology-report-2026/",
    line: "About $100 billion in the US for software that takes over the labor between systems. Vendors have captured about $4 billion to $6 billion of it. Canada, Europe, Australia, and New Zealand roughly double the figure, to about $200 billion.",
  },
  {
    name: "MarketsandMarkets, agentic AI, 2026",
    href: "https://www.marketsandmarkets.com/Market-Reports/agentic-ai-market-208190735.html",
    line: "The agentic AI market at $19.33 billion in 2026, and $205.88 billion by 2033.",
  },
  {
    name: "Research and Markets, AI agents, 2026",
    href: "https://www.researchandmarkets.com/reports/6021504/ai-agents-market-global-forecast",
    line: "A tighter boundary: $8.81 billion in 2026, toward $33.89 billion by 2032. The gap between this and MarketsandMarkets is the edge of the category.",
  },
  {
    name: "BCG, 2026",
    href: "https://www.bcg.com/publications/2026/the-200-billion-dollar-ai-opportunity-in-tech-services",
    line: "Up to $200 billion of net new technology-services demand over five years. The C-suite is more than twice as likely as their direct reports to hire someone to build it.",
  },
  {
    name: "IBM Institute for Business Value, 2026",
    href: "https://www.ibm.com/downloads/documents/us-en/15db52361dc20148",
    line: "80% of executives are increasing what they spend on agentic AI. The same note says that spend is projected to nearly triple by 2027.",
  },
];

export function Home() {
  const navigate = useNavigate();
  const sample = useMemo(() => runBook(sampleBook()), []);

  return (
    <article data-page="home">
      <section className="hero">
        <div>
          <img className="hero-mark" src="/mark.jpg" alt="" width={96} height={96} />
          <p className="kicker">For teams that already pay for agents</p>
          <h1>Where last month’s AI bill meets the jobs it finished.</h1>
          <p className="lede">
            People with a budget want a cut they can make before the next invoice. Type the vendors, the seats, the jobs
            finished, and the hours spent fixing the output. The book prices the idle seats, the second tool on the same
            job, and the rework.
          </p>
          <p className="hero-links">
            <Link to="/book">Open the book</Link>
            <Link to="/method">Read the arithmetic</Link>
          </p>
        </div>
        <aside className="offer" aria-label="Board packet">
          <p className="kicker kicker-light">Board packet</p>
          <p className="price">
            $750 <span>paid in full</span>
          </p>
          <p>One Stripe checkout. No deposit and no monthly fee. The charge is $750.00.</p>
          <ul>
            <li>The memo, with your company, this month, and each cut in a sentence.</li>
            <li>A letter for every cut.</li>
            <li>This month times twelve, labeled as a repeat, not a prediction.</li>
            <li>Plain text and JSON for the finance folder, and a print with no draft line.</li>
          </ul>
          <BuyLink>Buy the packet, $750</BuyLink>
          <p className="fine">
            Checkout sends the product and the price. It does not send the rows you typed. The $750 is the packet. It
            does not include someone making the cuts. That work is <a href={PARENT_URL}>{PARENT_NAME}</a>.
          </p>
        </aside>
      </section>

      <section className="block">
        <div className="section-head">
          <h2>A filled-in month</h2>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              saveBook(sampleBook());
              navigate("/book");
            }}
          >
            Open this sample in the book
          </button>
        </div>
        <p className="quiet">Northline is a sample, not a customer. October 2026. Rework rate $95 an hour, which is a placeholder.</p>
        <Figures book={sample} />
        <CutList book={sample} />
      </section>

      <section className="block">
        <h2>The market around the book</h2>
        <p>
          Bain’s 2026 technology report puts the US market for turning cross-system labor into software at about $100
          billion, with about $4 billion to $6 billion of it already sold. That is the pool. The check on this page is
          the packet for one month of your own bill.
        </p>
        <ul className="sources">
          {SOURCES.map((source) => (
            <li key={source.href}>
              <a href={source.href}>{source.name}</a>
              <span>{source.line}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
