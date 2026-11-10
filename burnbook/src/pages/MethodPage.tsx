import { PACKET_LABEL, PARENT_NAME, PARENT_URL, PAYMENT_LINK } from "../../shared/brand.ts";

export function MethodPage() {
  return (
    <article data-page="method" className="prose">
      <header className="page-head">
        <h1>How a cut gets its dollars</h1>
        <p>The book does not ask a model what to cancel. Every line is arithmetic on the numbers you typed.</p>
      </header>

      <h2>The rules, in order</h2>
      <ol>
        <li>
          A bill with no active seat and no finished job is a cancel. The save is the whole monthly bill. A platform
          with no seats that did finish jobs is not a cancel.
        </li>
        <li>
          If two vendors do the same job, the book keeps the one with the lower cost per finished job. A vendor that
          finished something beats one that finished nothing. The other bill is a cancel. Its idle seats are already
          inside that bill, so they are not added again.
        </li>
        <li>
          Idle-seat dollars are the empty seats divided by the seats on the bill, times the bill. The book names that
          cut when it is at least $100, and only if a stronger cut did not already take the vendor.
        </li>
        <li>
          Rework of at least a quarter of the bill, and at least $100, is a rebuild. Those dollars are labor, the hours
          times the rate you set. They are not subtracted from the invoice.
        </li>
        <li>An active vendor that finished nothing, with a bill of at least $200, is capped at half next month.</li>
        <li>Anything else stays.</li>
      </ol>
      <p>Active seats are clamped to the seats on the bill. A blank row is ignored. One action per vendor.</p>

      <h2>The twelve-month line</h2>
      <p>
        The packet multiplies this month’s vendor cuts by twelve, and this month’s rebuild labor by twelve. The memo
        says so. It is not a forecast, and it is not a promise that the next eleven months look like this one.
      </p>

      <h2>What the market figures are</h2>
      <p>
        People who already pay for agents are increasing that spend. IBM’s Institute for Business Value, in 2026, says
        80% of executives are increasing agentic AI investment, and that the spend is projected to nearly triple by
        2027. BCG’s 2026 note puts net new technology-services demand from that work at up to $200 billion over five
        years, and says the C-suite is the buyer. Bain’s Technology Report 2026 puts the US market for software that
        takes the labor between systems at about $100 billion, with about $4 billion to $6 billion already captured by
        vendors.
      </p>
      <p>
        Two firms size the agent-software category differently. MarketsandMarkets says $19.33 billion in 2026.
        Research and Markets says $8.81 billion in 2026. The difference is the boundary. None of those figures are
        inputs to your cuts. The sources are linked on the <a href="/">front page</a>.
      </p>

      <h2>The price</h2>
      <p>
        The ledger is free. The board packet is {PACKET_LABEL}, paid in full, on{" "}
        <a href={PAYMENT_LINK}>Stripe</a>. Checkout sends the product and the price. It does not send the rows. The
        packet does not include someone making the cuts. That work is <a href={PARENT_URL}>{PARENT_NAME}</a>, on a
        written plan.
      </p>
    </article>
  );
}
