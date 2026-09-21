import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { runShopCheck } from "../api";
import {
  BRAND_COMPANY,
  BRAND_NAME,
  BRAND_PARENT,
  BRAND_PLACE,
  BRAND_URL,
  COMPANY_URL,
  FD_PROMISE,
} from "../../shared/brand";
import {
  demoReport,
  fallbackCheck,
  placeLine,
  type CheckReport,
} from "../../shared/check";

const VALIDATION = ["Paste a shop name", "Need a shop name", "That URL is not"];

export default function Check() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const demo = location.pathname.replace(/\/$/, "") === "/check/harbor-hvac";
  const search = params.toString();
  const seeded = demo ? "Harbor HVAC, Palm Coast" : (params.get("q") ?? "");
  const [query, setQuery] = useState(seeded);
  const [report, setReport] = useState<CheckReport | null>(demo ? demoReport() : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (demo) {
      setQuery("Harbor HVAC, Palm Coast");
      setReport(demoReport());
      setError(null);
      return;
    }
    const q = new URLSearchParams(search).get("q");
    if (!q) return;
    setQuery(q);
    void run(q);
    // The search string is the trigger. run closes over the latest setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, search]);

  async function run(nextQuery: string) {
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      setReport(await runShopCheck(nextQuery));
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (VALIDATION.some((prefix) => message.startsWith(prefix))) {
        setReport(null);
        setError(message);
      } else {
        const local = fallbackCheck(nextQuery);
        if ("error" in local) {
          setReport(null);
          setError(local.error);
        } else {
          setReport(local);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    if (!demo && params.get("q") === next) {
      void run(next);
      return;
    }
    navigate(`/check?q=${encodeURIComponent(next)}`);
  }

  const shareUrl = report ? `${BRAND_URL}${report.sharePath}` : "";

  async function copyShare() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="section check-page">
      <div className="container check-layout">
        <div>
          <p className="eyebrow">
            {BRAND_NAME} · {BRAND_COMPANY} · {BRAND_PLACE}
          </p>
          <h1 className="display">What AI knows about your shop</h1>
          <p className="lede">
            Paste a business name and city, a website, or a Google or Facebook page. Free. No login. The card shows the
            gaps, then IndexMe.
          </p>
          <form className="ask-box" onSubmit={onSubmit}>
            <label htmlFor="shop-check">Shop name and city, or a page URL</label>
            <div className="ask-row">
              <input
                id="shop-check"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Harbor HVAC, Palm Coast  or  https://yourshop.com"
                maxLength={200}
                autoComplete="off"
              />
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? "Checking…" : "Run the check"}
              </button>
            </div>
            {error ? <p className="fine">{error}</p> : <p className="fine">No account. The share link is the card.</p>}
          </form>
          <p className="fine">
            <Link to="/check/harbor-hvac">See the Harbor HVAC demo card</Link>. Fictional shop. Not a client.
          </p>
        </div>
        {report ? <ShopCard report={report} shareUrl={shareUrl} copied={copied} onCopy={() => void copyShare()} /> : null}
      </div>
    </section>
  );
}

function ShopCard({
  report,
  shareUrl,
  copied,
  onCopy,
}: {
  report: CheckReport;
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <article className="shop-card">
      <p className="shop-card__kicker">
        {report.evidenceLabel}
        {report.demo ? " · Fictional · Not a client" : ""}
      </p>
      <h2>{report.name}</h2>
      <p className="shop-card__place">{placeLine(report) || "No city given"}</p>
      <p className="shop-card__count">
        {report.gaps.length} gap{report.gaps.length === 1 ? "" : "s"} on the public record
      </p>
      <ul className="shop-card__facts">
        {report.facts.map((fact) => (
          <li key={fact.label}>
            <span>{fact.label}</span> {fact.value}
          </li>
        ))}
      </ul>
      <ul className="shop-card__gaps">
        {report.gaps.map((gap) => (
          <li key={gap.id}>{gap.text}</li>
        ))}
      </ul>
      <p>{report.note}</p>
      <p className="shop-card__kicker">Models</p>
      <ul className="shop-card__models">
        {report.models.map((model) => (
          <li key={model.name}>
            <a href={model.href} target="_blank" rel="noopener noreferrer">
              {model.name}
            </a>
            <small>{model.label}</small>
          </li>
        ))}
      </ul>
      <div className="shop-card__actions">
        <a className="check-primary" href={report.ctas.indexme}>
          Get the page found on IndexMe
        </a>
        <p className="shop-card__price">{report.ctas.indexmePrice}</p>
        <a className="check-soft" href={report.ctas.firstDeploy}>
          {BRAND_PARENT} — 2-minute check
        </a>
        <p className="shop-card__price">
          {report.ctas.firstDeployPrice}. {FD_PROMISE}. Free 30, then {report.ctas.consultRates}.{" "}
          <a href={report.ctas.calendly}>Book the free 30</a>.
        </p>
        {report.ctas.netyard ? (
          <p>
            <a href={report.ctas.netyard}>NetYard</a> if the pain is Windows Server or CAL quotes.
          </p>
        ) : null}
        <p>
          <a href={report.ctas.askyard}>Ask a shop-floor question on {BRAND_NAME}</a>
        </p>
      </div>
      <label className="shop-card__kicker" htmlFor="share-url">
        Share card
      </label>
      <div className="shop-card__share">
        <input id="share-url" readOnly value={shareUrl} />
        <button className="check-soft" type="button" onClick={onCopy}>
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      {report.demo ? (
        <img className="shop-card__og" src="/check/harbor-hvac.png" alt="Share card for the fictional Harbor HVAC shop" />
      ) : null}
      <p className="shop-card__kicker">
        {BRAND_NAME} · {BRAND_COMPANY} · {BRAND_PLACE} · <a href={COMPANY_URL}>agenthiveinc.com</a>
      </p>
    </article>
  );
}
