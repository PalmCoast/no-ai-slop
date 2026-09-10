import { NavLink } from "react-router-dom";
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

export function Layout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Brand />
        <nav className="nav" aria-label="Primary">
          <NavLink to="/library" className={({ isActive }) => (isActive ? "active" : "")}>
            Library
          </NavLink>
          <NavLink to="/record" className="btn amber">
            Record
          </NavLink>
        </nav>
      </header>
      <main id="main" className={wide ? "wide" : undefined}>
        {children}
      </main>
      <footer className="site-footer">
        <div className="inner">
          <span>Flick records in the browser and hosts the file on Netlify. Watchers do not need an account.</span>
          <span>No custom domain. Default Netlify URL.</span>
        </div>
      </footer>
    </>
  );
}
