import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FEST_LINKS, GROUP_LABEL, type FestGroup } from "../shared/board";
import {
  CONTACT_EMAIL,
  INDEXME_DESK,
  INDEXME_HOME,
  INDEXME_PRICING,
  PRO_PRICE,
  STUDIO_PRICE,
} from "../shared/brand";
import { anchorSnippet, badgeSnippet, sentenceSnippet } from "../shared/credit";
import type { CheckResult, CheckStatus } from "../shared/check-link";

type Filter = "all" | FestGroup;
type Phase = "idle" | "checking";
type SavedCheck = { url: string; text: string; at: string };

const STORAGE_KEY = "linkfest.checked.v1";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All links" },
  { id: "desk", label: "The desk" },
  { id: "house", label: "The house" },
  { id: "credit", label: "They linked first" },
];

const STATUS_LABEL: Record<CheckStatus, string> = {
  linked: "LINKED",
  unnamed: "NAME MISSING",
  nofollow: "NOFOLLOW",
  missing: "NO LINK",
  unreachable: "NO PAGE",
  blocked: "BLOCKED",
  limited: "WAIT",
};

function Mark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.5 12h17M12 3.2c2.4 2.6 3.6 5.6 3.6 8.8s-1.2 6.2-3.6 8.8c-2.4-2.6-3.6-5.6-3.6-8.8s1.2-6.2 3.6-8.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function readSaved(): SavedCheck[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is SavedCheck =>
        !!row &&
        typeof row === "object" &&
        "url" in row &&
        typeof row.url === "string" &&
        "text" in row &&
        typeof row.text === "string",
    );
  } catch {
    return [];
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [pageUrl, setPageUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [saved, setSaved] = useState<SavedCheck[]>([]);
  const [copied, setCopied] = useState("");
  const anchorRef = useRef<HTMLTextAreaElement>(null);
  const sentenceRef = useRef<HTMLTextAreaElement>(null);
  const badgeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSaved(readSaved());
  }, []);

  const links = useMemo(
    () => (filter === "all" ? FEST_LINKS : FEST_LINKS.filter((link) => link.group === filter)),
    [filter],
  );
  const hosts = useMemo(() => FEST_LINKS.map((link) => hostOf(link.url)), []);
  const sentence = sentenceSnippet(siteName);
  const badge = badgeSnippet(window.location.origin);
  const anchor = anchorSnippet();

  async function copy(id: string, value: string, field: HTMLTextAreaElement | null) {
    let ok = false;
    if (field) {
      field.focus();
      field.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
    }
    setCopied(ok ? id : `${id}-select`);
    window.setTimeout(() => {
      setCopied((current) => (current === id || current === `${id}-select` ? "" : current));
    }, 4000);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
    } catch {
      // The select-and-copy above already set the label.
    }
  }

  function copyLabel(id: string, idle: string) {
    if (copied === id) return "Copied";
    if (copied === `${id}-select`) return "Select the line";
    return idle;
  }

  function remember(next: CheckResult) {
    const text = next.links.find((link) => link.named && !link.nofollow)?.text ?? "IndexMe.lol";
    const row: SavedCheck = { url: next.url, text, at: new Date().toISOString() };
    const rest = readSaved().filter((item) => item.url !== row.url);
    const list = [row, ...rest].slice(0, 8);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setSaved(list);
  }

  async function runCheck(url: string) {
    if (!url) {
      setResult({
        status: "blocked",
        url: "",
        httpStatus: null,
        links: [],
        note: "Paste the page where the IndexMe link sits.",
      });
      return;
    }
    setPhase("checking");
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await response.json()) as CheckResult;
      setResult(data);
      if (data.status === "linked") remember(data);
    } catch {
      setResult({
        status: "unreachable",
        url,
        httpStatus: null,
        links: [],
        note: "The check did not finish. Try the page again.",
      });
    } finally {
      setPhase("idle");
    }
  }

  function onCheck(event: FormEvent) {
    event.preventDefault();
    void runCheck(pageUrl.trim());
  }

  function tryDesk() {
    setPageUrl(INDEXME_HOME);
    void runCheck(INDEXME_HOME);
  }

  return (
    <div className="shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Link Fest home">
          <span className="brand-mark">
            <Mark />
          </span>
          <span>
            INDEXME<span className="brand-dot">.LOL</span>
          </span>
        </a>
        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main">
          <a href="#board" onClick={() => setMenuOpen(false)}>
            The fest
          </a>
          <a href="#check" onClick={() => setMenuOpen(false)}>
            Check a page
          </a>
          <a href="#credit" onClick={() => setMenuOpen(false)}>
            The line
          </a>
          <a href="#pact" onClick={() => setMenuOpen(false)}>
            The pact
          </a>
          <a className="nav-cta" href={INDEXME_DESK}>
            Open the desk
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow">
              <span />
              Link Fest
            </p>
            <h1>
              Link to us.
              <br />
              <em>We link back.</em>
            </h1>
            <p className="lede">
              Put a visible link to IndexMe.lol on your site. This board links out to the pages that
              already point at the desk, and to the page that wrote the idea. The click and the credit
              are the profit.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#check">
                Check your page
              </a>
              <a className="text-link" href="#credit">
                Copy the line
              </a>
            </div>
            <ul className="trust-row">
              <li>Visible anchor</li>
              <li>Follow links</li>
              <li>Credit on the source</li>
            </ul>
          </div>
          <aside className="console" aria-label="Example credit report">
            <div className="console-bar">
              <span className="dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>LINK FEST / 001</span>
              <span className="live">
                <i /> LIVE
              </span>
            </div>
            <div className="console-body">
              <p className="url-line">{INDEXME_HOME}</p>
              <div className="signal">
                <small>CREDIT SIGNAL</small>
                <strong>LINKED</strong>
                <span>Anchor text says IndexMe</span>
              </div>
              <ul className="console-list">
                <li>
                  <span>Follow link</span>
                  <b>YES</b>
                </li>
                <li>
                  <span>Name in the anchor</span>
                  <b>YES</b>
                </li>
                <li>
                  <span>Idea left on the source</span>
                  <b>YES</b>
                </li>
              </ul>
            </div>
            <p className="console-foot">A copied page with the link left off does not go on the board.</p>
          </aside>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[...hosts, ...hosts].map((host, index) => (
              <span key={`${host}-${index}`}>{host}</span>
            ))}
          </div>
        </div>

        <section className="section" id="board">
          <div className="section-head">
            <p className="eyebrow dark">
              <span />
              {String(FEST_LINKS.length).padStart(2, "0")} outbound links
            </p>
            <h2>The fest is a list of real hrefs.</h2>
            <p>
              Every card leaves this site. House cards are pages IndexMe already stands next to.
              The LaunchAF card is a write-up someone else published. We link back.
            </p>
          </div>
          <div className="filters" role="tablist" aria-label="Filter the board">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={filter === item.id ? "filter is-on" : "filter"}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <ul className="board">
            {links.map((link) => (
              <li key={link.url} className="card">
                <p className="card-kicker">{GROUP_LABEL[link.group]}</p>
                <h3>
                  <a href={link.url}>{link.name}</a>
                </h3>
                <p>{link.line}</p>
                <p className="card-host">{hostOf(link.url)}</p>
              </li>
            ))}
          </ul>
          {saved.length > 0 ? (
            <div className="browser-board">
              <h3>Checked in this browser</h3>
              <ul className="board">
                {saved.map((row) => (
                  <li key={row.url} className="card card-yours">
                    <p className="card-kicker">Linked</p>
                    <h3>
                      <a href={row.url}>{hostOf(row.url)}</a>
                    </h3>
                    <p>Anchor text: {row.text}</p>
                    <p className="card-host">Stays in this browser. Email the URL to ask for a public card.</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="check-band" id="check">
          <div className="check-copy">
            <p className="eyebrow">
              <span />
              The check
            </p>
            <h2>Paste your page.</h2>
            <p>
              We fetch the public HTML and look for an anchor whose host is indexme.lol. A pass is a
              follow link with IndexMe in the text, the image alt, or the aria-label. The page body
              is discarded after that scan.
            </p>
            <ol className="rules-mini">
              <li>Use the words IndexMe or IndexMe.lol in the anchor.</li>
              <li>Leave rel="nofollow" off if you want the pass.</li>
              <li>Keep the original page up. Link to it when you use the steps.</li>
            </ol>
          </div>
          <form className="check-form" onSubmit={onCheck}>
            <label htmlFor="page-url">Page URL</label>
            <input
              id="page-url"
              name="url"
              type="text"
              inputMode="url"
              spellCheck={false}
              placeholder="https://your-site.com/notes"
              value={pageUrl}
              onChange={(event) => setPageUrl(event.target.value)}
              autoComplete="url"
            />
            <div className="form-actions">
              <button className="button button-primary" type="submit" disabled={phase === "checking"}>
                {phase === "checking" ? "Checking" : "Check the link"}
              </button>
              <button className="button button-light" type="button" onClick={tryDesk}>
                Try indexme.lol
              </button>
            </div>
            <p className="form-hint" aria-live="polite">
              {result ? (
                <>
                  <strong className={`status status-${result.status}`}>{STATUS_LABEL[result.status]}</strong>
                  {result.note}
                </>
              ) : (
                "A pass stays on this browser. It does not publish a public card by itself."
              )}
            </p>
            {result && result.links.length > 0 ? (
              <ul className="found-links">
                {result.links.map((link) => (
                  <li key={`${link.href}-${link.text}`}>
                    <span>{link.text || "(no text)"}</span>
                    <b>{link.nofollow ? "nofollow" : link.named ? "named" : "unnamed"}</b>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>
        </section>

        <section className="section" id="credit">
          <div className="section-head">
            <p className="eyebrow dark">
              <span />
              The line you paste
            </p>
            <h2>Name the desk. Leave the steps where they were written.</h2>
          </div>
          <div className="snippets">
            <article className="snippet">
              <h3>The anchor</h3>
              <textarea ref={anchorRef} readOnly value={anchor} rows={2} aria-label="Anchor snippet" />
              <button className="button button-outline" type="button" onClick={() => copy("anchor", anchor, anchorRef.current)}>
                {copyLabel("anchor", "Copy the anchor")}
              </button>
            </article>
            <article className="snippet">
              <h3>A sentence</h3>
              <label htmlFor="site-name">Your site name, optional</label>
              <input
                id="site-name"
                value={siteName}
                maxLength={80}
                placeholder="Harbor Notes"
                onChange={(event) => setSiteName(event.target.value)}
              />
              <textarea ref={sentenceRef} readOnly value={sentence} rows={3} aria-label="Sentence snippet" />
              <button className="button button-outline" type="button" onClick={() => copy("sentence", sentence, sentenceRef.current)}>
                {copyLabel("sentence", "Copy the sentence")}
              </button>
            </article>
            <article className="snippet">
              <h3>The badge</h3>
              <a className="badge-preview" href={INDEXME_HOME}>
                <img src="/badge.svg" width="196" height="48" alt="Link Fest. IndexMe.lol" />
              </a>
              <textarea ref={badgeRef} readOnly value={badge} rows={3} aria-label="Badge snippet" />
              <button className="button button-outline" type="button" onClick={() => copy("badge", badge, badgeRef.current)}>
                {copyLabel("badge", "Copy the badge")}
              </button>
            </article>
          </div>
        </section>

        <section className="section pact" id="pact">
          <div className="section-head">
            <p className="eyebrow dark">
              <span />
              The pact
            </p>
            <h2>Share the link. Leave the idea on the page that wrote it.</h2>
          </div>
          <ol className="pact-list">
            <li>
              <span>01</span>
              <h3>The link is the share.</h3>
              <p>
                A follow link to {INDEXME_HOME} with the name in the anchor. People can see who did
                the work, and the click can land on the desk.
              </p>
            </li>
            <li>
              <span>02</span>
              <h3>The original stays up.</h3>
              <p>
                Use your own sentences. When you need the IndexNow steps, the sitemap checklist, or a
                line from a comparison, link to that page instead of pasting it as yours.
              </p>
            </li>
            <li>
              <span>03</span>
              <h3>We link out in return.</h3>
              <p>
                Public cards are pages we already point at. Send a passing URL to {CONTACT_EMAIL} if
                you want one. A copied checklist with the link stripped does not get a card.
              </p>
            </li>
          </ol>
        </section>

        <section className="pricing" id="pricing">
          <p className="eyebrow dark">
            <span />
            The desk, if you want the check run for you
          </p>
          <div className="price-row">
            <article>
              <h3>Starter</h3>
              <p className="price">$0</p>
              <p>The free desk. IndexNow, sitemap, robots, llms.txt.</p>
              <a className="button button-outline" href={INDEXME_DESK}>
                Open the desk
              </a>
            </article>
            <article className="featured">
              <h3>Pro</h3>
              <p className="price">{PRO_PRICE}</p>
              <p>One time. The paid desk on IndexMe. Search inclusion is never guaranteed.</p>
              <a className="button button-primary" href={INDEXME_PRICING}>
                See Pro on IndexMe
              </a>
            </article>
            <article>
              <h3>Studio</h3>
              <p className="price">{STUDIO_PRICE}</p>
              <p>One time. Higher volume for studios and agencies.</p>
              <a className="button button-outline" href={INDEXME_PRICING}>
                See Studio on IndexMe
              </a>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand" href={INDEXME_HOME}>
          <span className="brand-mark">
            <Mark />
          </span>
          <span>
            INDEXME<span className="brand-dot">.LOL</span>
          </span>
        </a>
        <p>Link Fest is a board of outbound links for the IndexMe desk.</p>
        <nav aria-label="Footer">
          <a href={INDEXME_HOME}>IndexMe.lol</a>
          <a href={INDEXME_DESK}>Free desk</a>
          <a href={INDEXME_PRICING}>Pricing</a>
          <a href="https://agenthiveinc.com/">AgentHive Inc</a>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </nav>
        <p className="fine">AgentHive Inc · Palm Coast, FL · © 2026 IndexMe</p>
      </footer>
    </div>
  );
}
