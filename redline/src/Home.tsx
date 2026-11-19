import { formatUsd } from "../shared/money";
import { NOT_A_FIRM, PRICE_DETAIL, PRIVACY } from "../shared/offer";
import { FLAG_LABEL, parseBill, reviewLines, sumCents } from "../shared/review";
import { SAMPLE_BILL } from "../shared/sample";

export default function Home() {
  const parsed = parseBill(SAMPLE_BILL);
  const lines = reviewLines(parsed.lines);
  const billed = sumCents(lines, (line) => line.billedCents);
  const ask = sumCents(lines, (line) => line.askCents);
  const savings = sumCents(lines, (line) => line.savingsCents);
  const preview = lines.filter((line) => line.flags.length > 0).slice(0, 4);

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <p className="kicker">Hospital bills</p>
          <h1>Mark the bill. Send the dispute. $9 once.</h1>
          <p className="lede">
            Upload a PDF, a photo, or a screenshot, or paste the itemized charges. Redline flags duplicates, charges already
            inside a panel, a second emergency-visit level, and lines many times a Medicare reference. Then it writes the
            letters. You send them.
          </p>
          <div className="facts">
            <span className="fact">{PRICE_DETAIL}</span>
            <span className="fact">The bill stays in this browser</span>
            <span className="fact">You send the letter</span>
          </div>
          <div className="actions">
            <a className="btn btn-primary" href="#/case/sample">
              See the sample fight
            </a>
            <a className="btn btn-ghost" href="#/new">
              Use it on your bill
            </a>
          </div>
        </div>
        <article className="paper">
          <div className="paper-head">
            <div>
              <div className="hospital">{parsed.hospital}</div>
              <p className="muted">
                {parsed.patient} · Account {parsed.account}
              </p>
            </div>
            <div>
              <div className="figure big">{formatUsd(savings)}</div>
              <p className="muted">marked off the sample charges</p>
            </div>
          </div>
          {preview.map((line) => (
            <div className="preview-line" key={line.id}>
              <div>
                {line.flags.map((flag) => (
                  <span className="tag" key={flag.kind}>
                    {FLAG_LABEL[flag.kind]}
                  </span>
                ))}
                <div className={line.askCents === 0 ? "struck" : undefined}>{line.description}</div>
              </div>
              <div className={line.askCents === 0 ? "money struck" : "money"}>{formatUsd(line.billedCents)}</div>
            </div>
          ))}
          <p className="muted" style={{ marginTop: "0.8rem" }}>
            Charges {formatUsd(billed)}. Ask left on the bill {formatUsd(ask)}. Patient balance on the sample{" "}
            {formatUsd(parsed.patientOwesCents ?? 0)}. Four of the flagged lines are above. The full sample has the rest.
          </p>
        </article>
      </section>

      <section className="steps">
        <article className="step">
          <div className="num">1</div>
          <strong>Read the charges</strong>
          <p>PDF, photo, screenshot, or paste. Fix any line Redline misses. The rules run on what is on the screen.</p>
        </article>
        <article className="step">
          <div className="num">2</div>
          <strong>See the ask</strong>
          <p>
            Duplicates, panel parts, and a second visit level go to $0. Everything else stops at 1.5 times the reference on
            file.
          </p>
        </article>
        <article className="step">
          <div className="num">3</div>
          <strong>Send it yourself</strong>
          <p>Give permission, copy the hospital letter, the insurer letter, and the assistance request. The desk tracks what comes off.</p>
        </article>
      </section>
      <p className="muted">{PRIVACY}</p>
      <p className="muted">{NOT_A_FIRM}</p>
    </div>
  );
}
