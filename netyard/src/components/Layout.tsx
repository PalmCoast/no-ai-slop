import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Seo from "./Seo";
import {
  BRAND_COMPANY,
  BRAND_NAME,
  BRAND_PARENT,
  BRAND_PLACE,
  CALENDLY_URL,
  COMPANY_URL,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  CONTACT_EMAIL,
  FOOTER_LINE,
  LEGAL_NAME,
  PARENT_URL,
} from "../../shared/brand";

const NAV = [
  { to: "/plan", label: "Plan" },
  { to: "/tools", label: "Tools" },
  { to: "/compare", label: "Vs Server" },
  { to: "/launch", label: "Launch" },
  { to: "/buy", label: "Buy" },
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
            <img src="/brand/mark.svg" alt="" width={36} height={36} />
            <span>
              NET<span className="gold">YARD</span>
            </span>
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
            <a href={`tel:${CONSULT_TEL}`} className="phone">
              {CONSULT_DISPLAY}
            </a>
            <NavLink to="/buy" className="btn btn-primary">
              Pay on Stripe
            </NavLink>
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
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <a href={`tel:${CONSULT_TEL}`} onClick={() => setOpen(false)}>
              {CONSULT_DISPLAY}
            </a>
            <NavLink to="/buy" className="btn btn-primary" onClick={() => setOpen(false)}>
              Pay on Stripe
            </NavLink>
          </div>
        ) : null}
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <div className="container footer-grid">
          <div>
            <img className="footer-mark" src="/brand/wordmark.svg" alt={BRAND_NAME} />
            <p>
              {BRAND_NAME} is a {BRAND_PARENT} product from {BRAND_COMPANY} / {LEGAL_NAME}. {BRAND_PLACE}.
              <br />
              {FOOTER_LINE}
            </p>
          </div>
          <div>
            <strong>NetYard</strong>
            <Link to="/">Stand up</Link>
            <Link to="/plan">Your plan</Link>
            <Link to="/tools">Admin tools</Link>
            <Link to="/compare">Vs Microsoft Server</Link>
            <Link to="/launch">Launch</Link>
          </div>
          <div>
            <strong>Buy</strong>
            <Link to="/buy">Pay on Stripe</Link>
            <a href={PARENT_URL}>{BRAND_PARENT}</a>
            <a href={CALENDLY_URL} rel="noreferrer" target="_blank">
              Free 30
            </a>
            <a href={COMPANY_URL}>{BRAND_COMPANY}</a>
          </div>
          <div>
            <strong>Contact</strong>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
            <a href="/llms.txt">llms.txt</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <div>
            © 2026 {BRAND_COMPANY} · {LEGAL_NAME}
          </div>
          <div>{FOOTER_LINE}</div>
        </div>
      </footer>
    </div>
  );
}
