import { useEffect, useRef, useState } from "react";
import { caseFromParsed, makeId, type BillCase } from "../shared/case";
import { DEMO_NOTE, PRICE_LABEL, PRIVACY } from "../shared/offer";
import { parseBill } from "../shared/review";
import { startCheckout } from "./client";
import { textFromFile } from "./readFile";
import { clearDraft, peekDraft, saveDraft } from "./storage";

type Props = {
  pass: string | null;
  demo: boolean;
  onPass: (key: string, message: string) => void;
  onCreate: (bill: BillCase) => void;
};

export default function NewBill({ pass, demo, onPass, onCreate }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [email, setEmail] = useState("");
  const [paying, setPaying] = useState(false);
  const [needsPass, setNeedsPass] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!pass || started.current) return;
    const draft = peekDraft();
    if (!draft) return;
    started.current = true;
    clearDraft();
    const parsed = parseBill(draft.text);
    if (parsed.lines.length === 0) {
      setText(draft.text);
      setError("Redline still could not find charges in that draft. Edit it and try again.");
      return;
    }
    onCreate(caseFromParsed(parsed, draft.label, new Date().toISOString(), makeId(), draft.text));
  }, [pass, onCreate]);

  async function useText(source: string, label: string) {
    const parsed = parseBill(source);
    if (parsed.lines.length === 0) {
      setText(source);
      setError("No charges came off that file. Paste the itemized lines, with a dollar amount on each one.");
      return;
    }
    if (!pass) {
      saveDraft(source, label);
      setText(source);
      setNeedsPass(true);
      setError(null);
      return;
    }
    onCreate(caseFromParsed(parsed, label, new Date().toISOString(), makeId(), source));
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setReading(true);
    setError(null);
    try {
      const source = await textFromFile(file);
      await useText(source, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setReading(false);
    }
  }

  async function pay() {
    setPaying(true);
    setError(null);
    try {
      const result = await startCheckout(email);
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      if (result.licenseKey) onPass(result.licenseKey, result.message || DEMO_NOTE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="stack">
      <div>
        <p className="kicker">New bill</p>
        <h1 className="section-title">Put the charges on the desk</h1>
        <p className="lede">{PRIVACY}</p>
      </div>

      {needsPass && !pass ? (
        <article className="paper stack">
          <h2 className="section-title">{demo ? "Unlock a demo pass" : `Pay ${PRICE_LABEL}`}</h2>
          <p>
            {demo
              ? DEMO_NOTE
              : `${PRICE_LABEL} once for unlimited bills on this browser. Redline does not take a percentage of what the hospital takes off.`}
          </p>
          <label>
            Email for the receipt
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="you@example.com" />
            <span>Optional in the demo. Required later if you need to restore a paid pass.</span>
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="button" onClick={() => void pay()} disabled={paying}>
              {paying ? "Contacting checkout…" : demo ? "Unlock a demo pass" : `Pay ${PRICE_LABEL}`}
            </button>
            <a className="btn btn-ghost" href="#/case/sample">
              See the sample first
            </a>
          </div>
        </article>
      ) : null}

      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          void useText(text, "paste");
        }}
      >
        <div
          className="drop"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void onFile(event.dataTransfer.files[0] ?? null);
          }}
        >
          <strong>PDF, photo, or screenshot</strong>
          <p className="muted">Drop it here, or use a button. A scan with no text layer needs the photo path.</p>
          <div className="file-row">
            <label className="btn btn-ghost file">
              Upload a file
              <input
                type="file"
                accept=".pdf,.txt,.csv,image/*"
                onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <label className="btn btn-ghost file">
              Take a photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          {reading ? <p>Reading the page…</p> : null}
        </div>
        <label>
          Or paste the itemized bill
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={"Riverside General Hospital\n99284 ED visit level 4  1  2,840.00"}
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={!text.trim() || reading}>
            Read this bill
          </button>
        </div>
      </form>
    </div>
  );
}
