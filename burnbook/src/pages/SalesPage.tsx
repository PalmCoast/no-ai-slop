import { useState } from "react";
import { Link } from "react-router-dom";
import { PACKET_LABEL, PARENT_NAME, PARENT_URL } from "../../shared/brand.ts";
import { SALES_NOTE, SALES_SUBJECT } from "../../shared/sales.ts";
import { BuyLink } from "../components/BuyLink.tsx";

export function SalesPage() {
  const [copied, setCopied] = useState(false);
  const mailto = `mailto:?subject=${encodeURIComponent(SALES_SUBJECT)}&body=${encodeURIComponent(SALES_NOTE)}`;

  async function copyNote() {
    await navigator.clipboard.writeText(`${SALES_SUBJECT}\n\n${SALES_NOTE}`);
    setCopied(true);
  }

  return (
    <article data-page="sales" className="prose">
      <header className="page-head">
        <h1>Sales sheet</h1>
        <p>The note to send a buyer who already pays for agents and wants the bill cut before the next invoice.</p>
      </header>

      <p>
        The ledger is free. The buyer types last month, reads the cuts, and pays {PACKET_LABEL} once for the board
        packet. The charge does not include someone making the cuts. That work is{" "}
        <a href={PARENT_URL}>{PARENT_NAME}</a>.
      </p>

      <p className="buy-row">
        <BuyLink>Buy the packet, {PACKET_LABEL}</BuyLink>
        <Link to="/book">Open the book</Link>
      </p>

      <h2>What the {PACKET_LABEL} buys</h2>
      <ul>
        <li>The memo, with the company, this month, and each cut in a sentence.</li>
        <li>A letter for every cut.</li>
        <li>This month times twelve, labeled as a repeat, not a prediction.</li>
        <li>Plain text and JSON, and a print with no draft line, after Stripe confirms the payment.</li>
      </ul>

      <h2>The note</h2>
      <pre className="memo">{SALES_NOTE}</pre>
      <p className="packet-actions">
        <button type="button" onClick={() => void copyNote()}>
          {copied ? "Copied" : "Copy the note"}
        </button>
        <a href={mailto}>Open it in mail</a>
      </p>
      <p className="fine">Northline on the front page is a worked example. It is not a customer.</p>
    </article>
  );
}
