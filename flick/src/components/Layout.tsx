import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <NavLink to={to} className="brand" aria-label="Flick home">
      <span className="mark" aria-hidden="true">
        <span />
      </span>
      Flick
    </NavLink>
  );
}

export function Layout({
  children,
  wide = false,
  marquee = false,
}: {
  children: ReactNode;
  wide?: boolean;
  marquee?: boolean;
}) {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Brand />
        <nav className="nav" aria-label="Primary">
          <NavLink to="/launch" className={({ isActive }) => (isActive ? "active" : "")}>
            Launch
          </NavLink>
          <NavLink to="/marketing" className={({ isActive }) => (isActive ? "active" : "")}>
            Marketing
          </NavLink>
          <NavLink to="/pricing" className={({ isActive }) => (isActive ? "active" : "")}>
            Pricing
          </NavLink>
          <NavLink to="/record" className="btn amber">
            Record
          </NavLink>
        </nav>
      </header>
      <main id="main" className={`${wide ? "wide" : ""} ${marquee ? "marquee-main" : ""}`.trim()}>
        {children}
      </main>
      <footer className="site-footer">
        <div className="inner">
          <span>Watch is free. Publish is the gate. Recorded in the browser, hosted on Netlify.</span>
          <span className="footer-links">
            <Link to="/pricing">Payment gate</Link>
            <Link to="/marketing">Marketing plan</Link>
            <Link to="/launch">Launch plan</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
