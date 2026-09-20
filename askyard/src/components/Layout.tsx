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
  MARQUEE_NAME,
  PARENT_URL,
  TWELVE_TOOLS_BADGE,
  TWELVE_TOOLS_URL,
} from "../../shared/brand";

const NAV = [
  { to: "/board", label: "Board" },
  { to: "/rep", label: "Rep" },
  { to: "/marquee", label: MARQUEE_NAME },
  { to: "/apps", label: "Apps" },
  { to: "/hunt", label: "Hunt" },
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
              ASK<span className="gold">YARD</span>
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
            <a href={PARENT_URL} className="btn btn-primary">
              {BRAND_PARENT}
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
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <a href={`tel:${CONSULT_TEL}`} onClick={() => setOpen(false)}>
              {CONSULT_DISPLAY}
            </a>
            <a href={PARENT_URL} className="btn btn-primary" onClick={() => setOpen(false)}>
              {BRAND_PARENT}
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
            <img className="footer-mark" src="/brand/wordmark.svg" alt={BRAND_NAME} />
            <p>
              {BRAND_NAME} is a {BRAND_PARENT} product from {BRAND_COMPANY} / {LEGAL_NAME}. {BRAND_PLACE}.
              <br />
              {FOOTER_LINE}
            </p>
          </div>
          <div>
            <strong>AskYard</strong>
            <Link to="/">Ask</Link>
            <Link to="/board">Ranked board</Link>
            <Link to="/rep">Reputation meter</Link>
            <Link to="/marquee">{MARQUEE_NAME}</Link>
            <Link to="/apps">Apps for sale</Link>
            <Link to="/hunt">Hunt</Link>
          </div>
          <div>
            <strong>Buy</strong>
            <a href={PARENT_URL}>{BRAND_PARENT}</a>
            <a href={CALENDLY_URL} rel="noreferrer" target="_blank">
              Free 30
            </a>
            <Link to="/apps">App shelf</Link>
            <Link to="/marquee">{MARQUEE_NAME} bids</Link>
            <a href={COMPANY_URL}>{BRAND_COMPANY}</a>
            <a href={TWELVE_TOOLS_URL} target="_blank" rel="noreferrer">
              Twelve Tools
            </a>
            <a className="footer-badge" href={TWELVE_TOOLS_URL} target="_blank">
              <img
                src={TWELVE_TOOLS_BADGE}
                alt="Featured on Twelve Tools"
                width={200}
                height={54}
              />
            </a>
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
