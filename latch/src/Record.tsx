import { useEffect, useRef, useState, type FormEvent } from "react";
import { CUSTOM_MAX_MINUTES, CUSTOM_MIN_MINUTES, type TimeEntry } from "../shared/latch";
import { isPlausibleLicense, normalizeKey } from "../shared/license";
import {
  DEMO_NOTE,
  FREE_LINE,
  MAKER_NOTE,
  STUDY_NOTE,
  PRICE_DETAIL,
  PRICE_LABEL,
  RECORD_GETS,
  RECORD_STAYS,
  SELLER,
  SELLER_EMAIL,
} from "../shared/offer";
import { exportLog, keptLine, summaryLine } from "../shared/record";

type PayResult = {
  url?: string;
  demo?: boolean;
  licenseKey?: string;
  message?: string;
  valid?: boolean;
};

async function post(path: string, body: unknown): Promise<PayResult> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = (await res.json().catch(() => null)) as (PayResult & { message?: string }) | null;
  if (!res.ok) throw new Error(data?.message || "The request failed.");
  return data ?? {};
}

function download(log: TimeEntry[]) {
  const blob = new Blob([`${exportLog(log)}\n`], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "latch-record.txt";
  link.click();
  URL.revokeObjectURL(url);
}

export default function RecordPanel({
  licensed,
  licenseKey,
  log,
  nowMs,
  hasTask,
  onUnlock,
  onForget,
  onCustom,
}: {
  licensed: boolean;
  licenseKey: string | null;
  log: TimeEntry[];
  nowMs: number;
  hasTask: boolean;
  onUnlock: (key: string) => void;
  onForget: () => void;
  onCustom: (minutes: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [keyDraft, setKeyDraft] = useState("");
  const [minutes, setMinutes] = useState(45);
  const unlockRef = useRef(onUnlock);
  const forgetRef = useRef(onForget);
  unlockRef.current = onUnlock;
  forgetRef.current = onForget;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;
    let cancel = false;
    post("/api/confirm", { sessionId })
      .then((result) => {
        if (cancel || !result.licenseKey) return;
        unlockRef.current(result.licenseKey);
        setNotice("Payment received. The record is on for this browser.");
        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
      })
      .catch((err: unknown) => {
        if (!cancel) setNotice(err instanceof Error ? err.message : "The payment check failed.");
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!licenseKey) return;
    let cancel = false;
    post("/api/license", { key: licenseKey })
      .then((result) => {
        if (!cancel && result.valid === false) forgetRef.current();
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [licenseKey]);

  async function buy() {
    setBusy(true);
    setNotice(null);
    try {
      const result = await post("/api/checkout", {});
      if (result.url) {
        window.location.assign(result.url);
        return;
      }
      if (result.licenseKey) {
        onUnlock(result.licenseKey);
        setNotice(result.message || DEMO_NOTE);
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  async function redeem(event: FormEvent) {
    event.preventDefault();
    const key = normalizeKey(keyDraft);
    if (!isPlausibleLicense(key)) {
      setNotice("That key does not look like a Latch record key.");
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const result = await post("/api/license", { key });
      if (!result.valid) {
        setNotice("That key was not accepted.");
        return;
      }
      onUnlock(key);
      setKeyDraft("");
      setNotice(result.demo ? DEMO_NOTE : "Key accepted on this browser.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "The key check failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" id="record" aria-labelledby="record-heading">
      <p className="kicker" id="record-heading">
        The record
      </p>
      <p>{FREE_LINE}</p>
      <p className="hint maker">{MAKER_NOTE}</p>
      <p className="hint">{STUDY_NOTE}</p>
      {licensed ? (
        <>
          <p className="summary">{summaryLine(log, nowMs)}</p>
          {log.length > 0 ? (
            <ul className="list">
              {log.slice(0, 12).map((entry) => (
                <li key={entry.id}>
                  <p>{keptLine(entry)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hint">Finish a timer, or stop one after 15 seconds, and the line shows up here.</p>
          )}
          <div className="row">
            <button type="button" className="btn btn-ghost" onClick={() => download(log)} disabled={log.length === 0}>
              Download the text file
            </button>
          </div>
          {hasTask ? (
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                onCustom(minutes);
              }}
            >
              <label htmlFor="custom-minutes">Timer length you choose</label>
              <div className="inline">
                <input
                  id="custom-minutes"
                  type="number"
                  min={CUSTOM_MIN_MINUTES}
                  max={CUSTOM_MAX_MINUTES}
                  value={minutes}
                  onChange={(event) => setMinutes(Number(event.target.value))}
                />
                <button className="btn btn-primary" type="submit">
                  Set this timer
                </button>
              </div>
            </form>
          ) : (
            <p className="hint">Name the one thing, then you can set a length here.</p>
          )}
          <p className="hint">{RECORD_STAYS}</p>
          <details className="clear">
            <summary>Your key</summary>
            <p className="key">{licenseKey}</p>
            <button type="button" className="btn btn-ghost" onClick={onForget}>
              Forget the key on this browser
            </button>
          </details>
        </>
      ) : (
        <>
          <ul className="gets">
            {RECORD_GETS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p>{PRICE_DETAIL}</p>
          <p className="hint">{RECORD_STAYS}</p>
          <button type="button" className="btn btn-primary" onClick={() => void buy()} disabled={busy}>
            {busy ? "Opening checkout…" : `Get the record — ${PRICE_LABEL}`}
          </button>
          <form className="stack" onSubmit={(event) => void redeem(event)}>
            <label htmlFor="record-key">Already have a key</label>
            <div className="inline">
              <input
                id="record-key"
                value={keyDraft}
                onChange={(event) => setKeyDraft(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="LATCH-…"
              />
              <button className="btn btn-ghost" type="submit" disabled={busy}>
                Use this key
              </button>
            </div>
          </form>
          <p className="hint">
            {SELLER} <a href={`mailto:${SELLER_EMAIL}`}>{SELLER_EMAIL}</a>
          </p>
        </>
      )}
      {notice ? <p className="notice">{notice}</p> : null}
    </section>
  );
}
