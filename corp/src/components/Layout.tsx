import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Seo from "./Seo";
import {
  BRAND_NAME,
  BRAND_PLACE,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  CONTACT_EMAIL,
  FD_CONSULT_URL,
  FD_NAME,
  FD_URL,
  INDEXME_NAME,
  INDEXME_URL,
  LEGAL_NAME,
  ADDRESS_LINE,
  VOICE_DISPLAY,
  VOICE_TEL,
} from "../../shared/brand";

const NAV = [
  { to: "/#work", label: "Work", hash: true },
  { to: "/buzz", label: "The Buzz" },
  { to: "/rankings", label: "Rankings" },
  { to: "/about", label: "About" },
  { to: "/build", label: "Custom Builds" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="shell">
      <Seo />
      <div className="honeycomb" aria-hidden="true" />
      <header className="topbar">
        <div className="container nav">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <img src="/brand/mark-bee.jpg" alt="" width={36} height={36} />
            <span>
              Agent<span className="gold">Hive</span> Inc
            </span>
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {NAV.map((item) =>
              item.hash ? (
                <a key={item.label} href={item.to}>
                  {item.label}
                </a>
              ) : (
                <NavLink key={item.label} to={item.to}>
                  {item.label}
                </NavLink>
              ),
            )}
            <a href={`tel:${CONSULT_TEL}`} className="phone">
              {CONSULT_DISPLAY}
            </a>
            <a href={FD_URL} className="btn btn-primary">
              {FD_NAME}
            </a>
          </nav>
          <button
            className="menu-toggle"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        {open ? (
          <div className="mobile-nav">
            {NAV.map((item) =>
              item.hash ? (
                <a key={item.label} href={item.to} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ) : (
                <NavLink key={item.label} to={item.to} onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              ),
            )}
            <a href={`tel:${CONSULT_TEL}`} onClick={() => setOpen(false)}>
              {CONSULT_DISPLAY}
            </a>
            <a href={FD_URL} className="btn btn-primary" onClick={() => setOpen(false)}>
              {FD_NAME}
            </a>
          </div>
        ) : null}
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <div className="container footer-grid">
          <div>
            <img className="footer-mark" src="/brand/wordmark.jpg" alt={BRAND_NAME} />
            <p>
              {BRAND_NAME} · {LEGAL_NAME}
              <br />
              AI consultant shop. {ADDRESS_LINE}.
              <br />
              Ship fast. Learn in public. Build AI that earns while you sleep.
            </p>
            <p>
              Consult:{" "}
              <a href={`tel:${CONSULT_TEL}`}>
                <strong>{CONSULT_DISPLAY}</strong>
              </a>
            </p>
          </div>
          <div>
            <strong>Hive</strong>
            <Link to="/">Home</Link>
            <Link to="/buzz">The Buzz</Link>
            <Link to="/rankings">Rankings</Link>
            <Link to="/about">About</Link>
            <Link to="/build">Custom Builds</Link>
          </div>
          <div>
            <strong>Live work</strong>
            <a href={FD_URL}>{FD_NAME}</a>
            <a href={INDEXME_URL}>{INDEXME_NAME}</a>
            <a href={FD_CONSULT_URL}>Consult</a>
            <a href="https://writehive.netlify.app/">WriteHive</a>
            <a href="https://bot-lock.netlify.app/">Bot Lock</a>
          </div>
          <div>
            <strong>Contact</strong>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href={`tel:${CONSULT_TEL}`}>
              {FD_NAME} {CONSULT_DISPLAY}
            </a>
            <a href={`tel:${VOICE_TEL}`}>Voice {VOICE_DISPLAY}</a>
            <a href="/llms.txt">llms.txt</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <div>
            © 2026 {BRAND_NAME} · {LEGAL_NAME} · {BRAND_PLACE}
          </div>
          <div>agenthiveinc.com</div>
        </div>
      </footer>
    </div>
  );
}
