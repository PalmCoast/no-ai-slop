import { useEffect, useState } from "react";
import { caseFromParsed, type BillCase } from "../shared/case";
import { DEMO_NOTE, NOT_A_FIRM, SELLER } from "../shared/offer";
import { parseBill } from "../shared/review";
import { SAMPLE_BILL } from "../shared/sample";
import CaseScreen from "./CaseScreen";
import { checkLicense, confirmSession, getOffer, restorePass } from "./client";
import Desk from "./Desk";
import Home from "./Home";
import NewBill from "./NewBill";
import { loadStore, saveStore, type Store } from "./storage";

type Route = { name: "home" } | { name: "desk" } | { name: "new" } | { name: "case"; id: string };

function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, "") || "/";
  if (path.startsWith("/case/")) return { name: "case", id: decodeURIComponent(path.slice("/case/".length)) };
  if (path.startsWith("/new")) return { name: "new" };
  if (path.startsWith("/desk")) return { name: "desk" };
  return { name: "home" };
}

function sampleCase(): BillCase {
  return caseFromParsed(parseBill(SAMPLE_BILL), "sample bill", "2026-03-14T00:00:00.000Z", "sample", SAMPLE_BILL);
}

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6 10h20M6 16h20M6 22h20" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 24 27 8" fill="none" stroke="#e23b2f" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  const [store, setStore] = useState<Store>(() => loadStore());
  const [hash, setHash] = useState(() => window.location.hash);
  const [sample, setSample] = useState<BillCase>(() => sampleCase());
  const [banner, setBanner] = useState<string | null>(null);
  const [demo, setDemo] = useState(true);
  const [checking, setChecking] = useState(() => new URLSearchParams(window.location.search).has("session_id"));
  const [restoreEmail, setRestoreEmail] = useState("");
  const route = parseRoute(hash);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    void getOffer()
      .then((offer) => setDemo(offer.demo))
      .catch(() => setDemo(true));
  }, []);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) return;
    void confirmSession(sessionId)
      .then((result) => {
        setStore((current) => ({ ...current, pass: result.licenseKey }));
        setBanner("Payment received. The pass is on this browser.");
        window.history.replaceState({}, "", `${window.location.pathname}#/desk`);
        setHash("#/desk");
      })
      .catch((err: unknown) => {
        setBanner(err instanceof Error ? err.message : "Could not confirm the payment.");
      })
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!store.pass) return;
    void checkLicense(store.pass).then((result) => {
      if (!result.valid) {
        setStore((current) => ({ ...current, pass: null }));
        setBanner("That pass is not valid on this site.");
      }
    }).catch(() => undefined);
  }, [store.pass]);

  function updateCase(next: BillCase) {
    if (next.id === "sample") {
      setSample(next);
      return;
    }
    setStore((current) => ({ ...current, cases: current.cases.map((item) => (item.id === next.id ? next : item)) }));
  }

  const open = route.name === "case" ? (route.id === "sample" ? sample : store.cases.find((item) => item.id === route.id) ?? null) : null;

  return (
    <>
      <a className="skip" href="#main">
        Skip to the bill
      </a>
      <header className="top">
        <a className="brand" href="#/">
          <Mark />
          Redline
        </a>
        <nav className="nav">
          <a href="#/desk" aria-current={route.name === "desk" ? "page" : undefined}>
            Desk
          </a>
          <a href="#/new" aria-current={route.name === "new" ? "page" : undefined}>
            New bill
          </a>
          <a href="#/case/sample" aria-current={route.name === "case" && route.id === "sample" ? "page" : undefined}>
            Sample
          </a>
        </nav>
      </header>
      <main className="wrap" id="main">
        {banner ? <p className="banner">{banner}</p> : null}
        {checking ? <p>Checking the payment…</p> : null}
        {route.name === "home" ? <Home /> : null}
        {route.name === "desk" ? <Desk cases={store.cases} /> : null}
        {route.name === "new" ? (
          <NewBill
            pass={store.pass}
            demo={demo}
            onPass={(key, message) => {
              setStore((current) => ({ ...current, pass: key }));
              setBanner(message || DEMO_NOTE);
            }}
            onCreate={(bill) => {
              setStore((current) => ({ ...current, cases: [bill, ...current.cases] }));
              window.location.hash = `#/case/${bill.id}`;
            }}
          />
        ) : null}
        {route.name === "case" && open ? (
          <CaseScreen
            key={open.id}
            bill={open}
            sample={open.id === "sample"}
            onChange={updateCase}
            onDelete={() => {
              setStore((current) => ({ ...current, cases: current.cases.filter((item) => item.id !== open.id) }));
              window.location.hash = "#/desk";
            }}
          />
        ) : null}
        {route.name === "case" && !open ? (
          <article className="paper">
            <p>That bill is not on this browser.</p>
            <a className="btn btn-primary" href="#/desk">
              Back to the desk
            </a>
          </article>
        ) : null}
        {(route.name === "new" || route.name === "desk") && !demo && !store.pass ? (
          <form
            className="paper stack restore"
            onSubmit={(event) => {
              event.preventDefault();
              void restorePass(restoreEmail)
                .then((result) => {
                  setStore((current) => ({ ...current, pass: result.licenseKey }));
                  setBanner("Pass restored on this browser.");
                })
                .catch((err: unknown) => setBanner(err instanceof Error ? err.message : "Could not restore the pass."));
            }}
          >
            <h2 className="section-title">I already paid</h2>
            <label>
              Checkout email
              <input value={restoreEmail} onChange={(event) => setRestoreEmail(event.target.value)} type="email" />
            </label>
            <button className="btn btn-ghost" type="submit">
              Restore the pass
            </button>
          </form>
        ) : null}
      </main>
      <footer className="site-footer">
        <p>{SELLER}</p>
        <p>{NOT_A_FIRM}</p>
      </footer>
    </>
  );
}
