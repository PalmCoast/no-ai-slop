import { STATUS_LABEL, type BillCase } from "../shared/case";
import { formatUsd } from "../shared/money";
import { reviewLines, sumCents } from "../shared/review";

export default function Desk({ cases }: { cases: BillCase[] }) {
  const reviewed = cases.map((bill) => ({ bill, lines: reviewLines(bill.lines) }));
  const billed = reviewed.reduce((total, row) => total + sumCents(row.lines, (line) => line.billedCents), 0);
  const savings = reviewed.reduce((total, row) => total + sumCents(row.lines, (line) => line.savingsCents), 0);
  const secured = cases.reduce((total, bill) => total + bill.securedCents, 0);

  return (
    <div className="stack">
      <div>
        <p className="kicker">Desk</p>
        <h1 className="section-title">Bills in this browser</h1>
      </div>
      <div className="stats">
        <div className="stat">
          <span>Bills</span>
          <b>{cases.length}</b>
        </div>
        <div className="stat">
          <span>Charges read</span>
          <b>{formatUsd(billed)}</b>
        </div>
        <div className="stat good">
          <span>Marked off</span>
          <b>{formatUsd(savings)}</b>
        </div>
        <div className="stat good">
          <span>Secured</span>
          <b>{formatUsd(secured)}</b>
        </div>
      </div>
      {cases.length === 0 ? (
        <article className="paper">
          <p>No bill of yours is on the desk yet. The sample is free to open. Your own bill is the $9 pass.</p>
          <div className="actions">
            <a className="btn btn-ghost" href="#/case/sample">
              Open the sample
            </a>
            <a className="btn btn-primary" href="#/new">
              Add a bill
            </a>
          </div>
        </article>
      ) : (
        <div className="desk-list">
          {reviewed.map(({ bill, lines }) => (
            <a className="case-row" href={`#/case/${bill.id}`} key={bill.id}>
              <div>
                <strong>{bill.hospital || "Hospital"}</strong>
                <div className="muted">
                  {bill.patient || "Patient"} · {bill.serviceDate || "No date"}
                </div>
              </div>
              <div className={`status ${STATUS_LABEL[bill.status].toLowerCase()}`}>{STATUS_LABEL[bill.status]}</div>
              <div>
                <div className="money">{formatUsd(sumCents(lines, (line) => line.savingsCents))}</div>
                <div className="muted">marked off</div>
              </div>
              <div>
                <div className="money">{formatUsd(bill.securedCents)}</div>
                <div className="muted">secured</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
