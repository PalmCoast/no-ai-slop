import { useEffect, useMemo, useState } from "react";
import {
  closeCase,
  markFiled,
  markWaiting,
  recordSavings,
  savePermission,
  STATUS_LABEL,
  type BillCase,
  type CaseStatus,
  type Permission,
} from "../shared/case";
import { buildPacket } from "../shared/letters";
import { formatUsd, parseDollars } from "../shared/money";
import { NOT_A_FIRM } from "../shared/offer";
import { FLAG_LABEL, reviewLines, sumCents, totalGap, type RawLine, type ReviewedLine } from "../shared/review";
import { readWithModel } from "./client";

const ORDER: CaseStatus[] = ["review", "packet", "filed", "waiting", "secured"];

type Props = {
  bill: BillCase;
  sample: boolean;
  onChange: (next: BillCase) => void;
  onDelete: () => void;
};

export default function CaseScreen({ bill, sample, onChange, onDelete }: Props) {
  const lines = useMemo(() => reviewLines(bill.lines), [bill.lines]);
  const billed = sumCents(lines, (line) => line.billedCents);
  const ask = sumCents(lines, (line) => line.askCents);
  const savings = sumCents(lines, (line) => line.savingsCents);
  const gap = totalGap(bill.statedTotalCents, bill.lines);
  const [permission, setPermission] = useState<Permission>(bill.permission);
  const [household, setHousehold] = useState(bill.household ? String(bill.household) : "");
  const [income, setIncome] = useState(bill.incomeCents == null ? "" : (bill.incomeCents / 100).toFixed(2));
  const [eob, setEob] = useState(bill.eobAllowedCents == null ? "" : (bill.eobAllowedCents / 100).toFixed(2));
  const [owes, setOwes] = useState(bill.patientOwesCents == null ? "" : (bill.patientOwesCents / 100).toFixed(2));
  const [secured, setSecured] = useState("");
  const [consent, setConsent] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const householdCount = Number(household);
  const incomeCents = income.trim() ? parseDollars(income) : null;
  const packet = buildPacket({
    hospital: bill.hospital,
    patient: bill.patient,
    account: bill.account,
    serviceDate: bill.serviceDate,
    payer: bill.payer,
    lines,
    patientOwesCents: bill.patientOwesCents,
    eobAllowedCents: bill.eobAllowedCents,
    permission,
    household: Number.isInteger(householdCount) && householdCount > 0 ? householdCount : null,
    incomeCents,
  });

  function patch(partial: Partial<BillCase>) {
    onChange({ ...bill, ...partial });
  }

  function patchLine(id: string, next: RawLine) {
    patch({ lines: bill.lines.map((line) => (line.id === id ? next : line)) });
  }

  function ready() {
    const saved = savePermission(
      bill,
      {
        patient: permission.patient,
        hospital: permission.hospital,
        insurer: permission.insurer,
        assistance: permission.assistance,
      },
      Number.isInteger(householdCount) && householdCount > 0 ? householdCount : null,
      incomeCents,
      new Date().toISOString(),
    );
    if (!saved) {
      setFormError("Check the patient permission box before the letters can be saved.");
      return;
    }
    setFormError(null);
    onChange(saved);
  }

  async function modelRead() {
    setReading(true);
    setModelError(null);
    try {
      const result = await readWithModel(bill.sourceText);
      onChange({
        ...bill,
        lines: result.lines,
        events: [...bill.events, { at: new Date().toISOString(), label: "Model read replaced the lines." }],
      });
    } catch (err) {
      setModelError(err instanceof Error ? err.message : "The model read failed.");
    } finally {
      setReading(false);
    }
  }

  const rank = ORDER.indexOf(bill.status === "closed" ? "secured" : bill.status);

  return (
    <div className="stack">
      {sample ? <p className="banner">This is the sample bill. It is not saved on the desk. Your own bill is the $9 pass.</p> : null}
      <div className="paper-head">
        <div>
          <p className="kicker">{sample ? "Sample" : "Your bill"}</p>
          <h1 className="section-title">{bill.hospital || "Hospital bill"}</h1>
          <p className="muted">
            {bill.patient || "Patient"} · {bill.account || "No account"} · {bill.serviceDate || "No date"}
          </p>
        </div>
      </div>
      <div className="stepper" aria-label="Dispute progress">
        {ORDER.map((status, index) => (
          <span key={status} className={bill.status === "closed" && status === "secured" ? "on" : index < rank ? "done" : index === rank ? "on" : ""}>
            {STATUS_LABEL[status]}
          </span>
        ))}
      </div>
      <div className="stats">
        <div className="stat">
          <span>Charges</span>
          <b>{formatUsd(billed)}</b>
        </div>
        <div className="stat">
          <span>Ask</span>
          <b>{formatUsd(ask)}</b>
        </div>
        <div className="stat good">
          <span>Marked off</span>
          <b>{formatUsd(savings)}</b>
        </div>
        <div className="stat">
          <span>Balance on the bill</span>
          <b>{bill.patientOwesCents == null ? "—" : formatUsd(bill.patientOwesCents)}</b>
        </div>
      </div>
      {gap != null ? (
        <p className="error">
          The printed total is {formatUsd(gap)} away from the lines on this screen. Add the missing charge or fix an amount.
        </p>
      ) : null}

      <section className="fields two noprint">
        <label>
          Hospital
          <input value={bill.hospital} onChange={(event) => patch({ hospital: event.target.value })} />
        </label>
        <label>
          Patient
          <input value={bill.patient} onChange={(event) => patch({ patient: event.target.value })} />
        </label>
        <label>
          Account
          <input value={bill.account} onChange={(event) => patch({ account: event.target.value })} />
        </label>
        <label>
          Date of service
          <input value={bill.serviceDate} onChange={(event) => patch({ serviceDate: event.target.value })} />
        </label>
        <label>
          Insurer
          <input value={bill.payer} onChange={(event) => patch({ payer: event.target.value })} />
        </label>
        <label>
          Billing email, if you have it
          <input value={bill.billingEmail} onChange={(event) => patch({ billingEmail: event.target.value })} type="email" />
        </label>
        <label>
          Patient balance
          <input value={owes} onChange={(event) => setOwes(event.target.value)} onBlur={() => patch({ patientOwesCents: owes.trim() ? parseDollars(owes) : null })} />
          <span>What the bill says you owe, if that number is on it.</span>
        </label>
        <label>
          EOB allowed amount
          <input value={eob} onChange={(event) => setEob(event.target.value)} onBlur={() => patch({ eobAllowedCents: eob.trim() ? parseDollars(eob) : null })} />
          <span>From your explanation of benefits. Redline does not guess what the plan pays.</span>
        </label>
      </section>

      <section className="stack">
        <h2 className="section-title">Lines</h2>
        {lines.map((line) => (
          <LineCard key={line.id} line={line} onSave={(next) => patchLine(line.id, next)} onRemove={() => patch({ lines: bill.lines.filter((item) => item.id !== line.id) })} />
        ))}
        <button
          className="btn btn-ghost noprint"
          type="button"
          onClick={() =>
            patch({
              lines: [...bill.lines, { id: `L${Date.now()}`, description: "Charge", code: null, quantity: 1, billedCents: 0 }],
            })
          }
        >
          Add a line
        </button>
      </section>

      {bill.sourceText ? (
        <section className="paper stack noprint">
          <h2 className="section-title">Model read</h2>
          <p>The rules above already ran on this device. A model read sends the bill text out, then the same rules run on whatever comes back.</p>
          <label className="check">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>Send this bill text to the model. It leaves this browser.</span>
          </label>
          <div className="actions">
            <button className="btn btn-ghost" type="button" disabled={!consent || reading} onClick={() => void modelRead()}>
              {reading ? "Reading…" : "Try a model read"}
            </button>
          </div>
          {modelError ? <p className="error">{modelError}</p> : null}
        </section>
      ) : null}

      <section className="paper stack" id="letters">
        <h2 className="section-title">Permission</h2>
        <p>Redline writes the letters. It does not call the hospital or the insurer. You send them.</p>
        <label className="check">
          <input type="checkbox" checked={permission.patient} onChange={(event) => setPermission({ ...permission, patient: event.target.checked })} />
          <span>I am the patient, or I have the patient’s permission to dispute this bill.</span>
        </label>
        <label className="check">
          <input type="checkbox" checked={permission.hospital} onChange={(event) => setPermission({ ...permission, hospital: event.target.checked })} />
          <span>Prepare the letter to the hospital billing office.</span>
        </label>
        <label className="check">
          <input type="checkbox" checked={permission.insurer} onChange={(event) => setPermission({ ...permission, insurer: event.target.checked })} />
          <span>Prepare the letter to the insurer.</span>
        </label>
        <label className="check">
          <input type="checkbox" checked={permission.assistance} onChange={(event) => setPermission({ ...permission, assistance: event.target.checked })} />
          <span>Prepare a financial assistance request.</span>
        </label>
        <div className="fields two">
          <label>
            Household size
            <input value={household} onChange={(event) => setHousehold(event.target.value)} inputMode="numeric" />
          </label>
          <label>
            Annual income
            <input value={income} onChange={(event) => setIncome(event.target.value)} inputMode="decimal" />
            <span>2026 HHS guideline, 48 states and DC. Alaska and Hawaii are higher.</span>
          </label>
        </div>
        {formError ? <p className="error">{formError}</p> : null}
        <div className="actions noprint">
          <button className="btn btn-primary" type="button" onClick={ready}>
            Letters are ready
          </button>
        </div>
        <p className="muted">{NOT_A_FIRM}</p>
      </section>

      {permission.patient ? (
        <section className="letters">
          {packet.hospital ? <LetterCard title="Hospital dispute" text={packet.hospital} email={bill.billingEmail} filename="hospital-dispute.txt" /> : null}
          {packet.insurer ? <LetterCard title="Insurer appeal" text={packet.insurer} email="" filename="insurer-appeal.txt" /> : null}
          {packet.assistance ? <LetterCard title="Financial assistance" text={packet.assistance} email={bill.billingEmail} filename="financial-assistance.txt" /> : null}
          {packet.script ? <LetterCard title="Phone script" text={packet.script} email="" filename="phone-script.txt" /> : null}
        </section>
      ) : null}

      <section className="paper stack noprint">
        <h2 className="section-title">Track the fight</h2>
        <div className="actions">
          <button className="btn btn-ghost" type="button" disabled={!bill.permission.at} onClick={() => onChange(markFiled(bill, new Date().toISOString()))}>
            I sent this
          </button>
          <button className="btn btn-ghost" type="button" disabled={bill.status !== "filed"} onClick={() => onChange(markWaiting(bill, new Date().toISOString()))}>
            They wrote back
          </button>
          <button className="btn btn-ghost" type="button" disabled={bill.status === "closed"} onClick={() => onChange(closeCase(bill, new Date().toISOString()))}>
            Close
          </button>
          {sample ? null : (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                if (window.confirm("Remove this bill from the desk?")) onDelete();
              }}
            >
              Remove
            </button>
          )}
        </div>
        <label>
          Dollars the hospital took off
          <input value={secured} onChange={(event) => setSecured(event.target.value)} inputMode="decimal" placeholder="4280.00" />
          <span>The amount you were relieved of. Not the whole bill.</span>
        </label>
        <div className="actions">
          <button
            className="btn btn-fair"
            type="button"
            onClick={() => {
              const cents = parseDollars(secured);
              const next = cents == null ? null : recordSavings(bill, cents, new Date().toISOString());
              if (!next) {
                setFormError("Enter the dollars that actually came off.");
                return;
              }
              setFormError(null);
              setSecured("");
              onChange(next);
            }}
          >
            Record the savings
          </button>
        </div>
        {bill.securedCents > 0 ? <p>Secured on this bill: {formatUsd(bill.securedCents)}.</p> : null}
        <ol className="timeline">
          {bill.events.map((event) => (
            <li key={`${event.at}-${event.label}`}>
              <span className="muted">{event.at.slice(0, 10)} · </span>
              {event.label}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function LineCard({ line, onSave, onRemove }: { line: ReviewedLine; onSave: (next: RawLine) => void; onRemove: () => void }) {
  const [description, setDescription] = useState(line.description);
  const [code, setCode] = useState(line.code ?? "");
  const [qty, setQty] = useState(String(line.quantity));
  const [billed, setBilled] = useState((line.billedCents / 100).toFixed(2));

  useEffect(() => {
    setDescription(line.description);
    setCode(line.code ?? "");
    setQty(String(line.quantity));
    setBilled((line.billedCents / 100).toFixed(2));
  }, [line.id, line.description, line.code, line.quantity, line.billedCents]);

  return (
    <article className={line.flags.length ? "line has-flag" : "line"}>
      <div className="line-top">
        <strong className={line.askCents === 0 ? "struck" : undefined}>{line.description}</strong>
        <span className="muted">{line.code || "No code"}{line.quantity > 1 ? ` · qty ${line.quantity}` : ""}</span>
      </div>
      <div>
        {line.flags.map((flag) => (
          <span className="tag" key={flag.kind}>
            {FLAG_LABEL[flag.kind]}
          </span>
        ))}
      </div>
      <div className="line-money">
        <span>
          Billed <b className={line.askCents === 0 ? "struck" : "money"}>{formatUsd(line.billedCents)}</b>
        </span>
        <span>Reference {line.referenceCents == null ? "none on file" : formatUsd(line.referenceCents)}</span>
        <span>
          Ask <b className="ask">{formatUsd(line.askCents)}</b>
        </span>
      </div>
      {line.flags.map((flag) => (
        <p className="note" key={flag.note}>
          {flag.note}
        </p>
      ))}
      {line.referenceNote ? (
        <details>
          <summary>Where this reference comes from</summary>
          <p className="note">{line.referenceNote}</p>
        </details>
      ) : null}
      <details className="editor noprint">
        <summary>Edit line</summary>
        <div className="editor-grid">
          <label>
            Description
            <input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label>
            Code
            <input value={code} onChange={(event) => setCode(event.target.value)} />
          </label>
          <label>
            Qty
            <input value={qty} onChange={(event) => setQty(event.target.value)} inputMode="numeric" />
          </label>
          <label>
            Billed
            <input value={billed} onChange={(event) => setBilled(event.target.value)} inputMode="decimal" />
          </label>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              const cents = parseDollars(billed);
              const quantity = Number(qty);
              if (cents == null || !Number.isInteger(quantity) || quantity < 1 || quantity > 30) return;
              onSave({ id: line.id, description: description.trim() || "Charge", code: code.trim().toUpperCase() || null, quantity, billedCents: cents });
            }}
          >
            Save line
          </button>
          <button className="btn btn-ghost" type="button" onClick={onRemove}>
            Remove line
          </button>
        </div>
      </details>
    </article>
  );
}

function LetterCard({ title, text, email, filename }: { title: string; text: string; email: string; filename: string }) {
  const [note, setNote] = useState<string | null>(null);
  const mailto =
    email.includes("@") && text.length < 1500
      ? `mailto:${email}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`
      : null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setNote("Copied.");
    } catch {
      setNote("Select the letter and copy it.");
    }
  }

  function download() {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <article className="paper">
      <h2 className="section-title">{title}</h2>
      <textarea className="letter" readOnly value={text} />
      <div className="letter-actions noprint">
        <button className="btn btn-ghost" type="button" onClick={() => void copy()}>
          Copy
        </button>
        <button className="btn btn-ghost" type="button" onClick={download}>
          Download
        </button>
        {mailto ? (
          <a className="btn btn-ghost" href={mailto}>
            Email draft
          </a>
        ) : null}
        {note ? <span className="muted">{note}</span> : null}
      </div>
    </article>
  );
}
