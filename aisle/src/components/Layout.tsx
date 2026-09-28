import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { BRAND_COMPANY, BRAND_NAME, BRAND_PARENT, COMPANY_URL, CONTACT_EMAIL, FOOTER_LINE, PARENT_URL } from "../../shared/brand";
import { PUBLISH_LABEL } from "../../shared/offers";
import { parseSpec } from "../../shared/spec";
import { shopBySlug, type ShopTheme } from "../../shared/shops";
import Seo from "./Seo";

const NAV = [
  { to: "/shop/brown-wool", label: "Brown Wool" },
  { to: "/shop/flange-tube", label: "Flange Tube" },
  { to: "/publish", label: "Publish" },
];

function themeFor(pathname: string, query: string): ShopTheme | "aisle" {
  const slug = pathname.match(/^\/shop\/([^/]+)/)?.[1];
  const shop = slug ? shopBySlug(slug) : undefined;
  if (shop) return shop.theme;
  if (pathname === "/door" || pathname === "/build") {
    const product = parseSpec(query).product;
    if (product === "sweater" || product === "cardigan") return "wool";
    if (product === "tube" || product === "pipe" || product === "rod" || product === "flange") return "metal";
  }
  return "aisle";
}

export default function Layout() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [open, setOpen] = useState(false);
  const slug = pathname.match(/^\/shop\/([^/]+)/)?.[1];
  const shop = slug ? shopBySlug(slug) : undefined;
  const doorName = pathname === "/door" ? params.get("name")?.trim() : "";
  const theme = themeFor(pathname, params.get("q") ?? shop?.query ?? "");
  const brand = shop?.name || doorName || BRAND_NAME;

  return (
    <div className={`shell theme-${theme}`}>
      <Seo />
      <header className="topbar">
        <div className="container nav">
          <Link to={shop ? `/shop/${shop.slug}` : "/"} className="brand" onClick={() => setOpen(false)}>
            <span className="mark" aria-hidden="true" />
            <span>{brand}</span>
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {shop || doorName ? (
              <Link to="/">All aisles</Link>
            ) : (
              NAV.map((item) => (
                <NavLink key={item.to} to={item.to}>
                  {item.label}
                </NavLink>
              ))
            )}
            <NavLink to="/publish" className="btn">
              {PUBLISH_LABEL}
            </NavLink>
          </nav>
          <button className="menu-toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span />
            <span />
            <span />
          </button>
        </div>
        {open ? (
          <div className="mobile-nav">
            <Link to="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </div>
        ) : null}
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <div className="container foot">
          <p>{FOOTER_LINE}</p>
          <p>
            <a href={PARENT_URL}>{BRAND_PARENT}</a>
            {" · "}
            <a href={COMPANY_URL}>{BRAND_COMPANY}</a>
            {" · "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          {shop ? <p>This door is an {BRAND_NAME} shop. The shelf is compiled. Open each listing to confirm stock.</p> : null}
        </div>
      </footer>
    </div>
  );
}
