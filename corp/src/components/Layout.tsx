import { Fragment, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Seo from "./Seo";
import {
  BRAND_NAME,
  CONSULT_TEL,
  CONTACT_EMAIL,
  FD_NAME,
  FD_URL,
  FEATURED_ON,
  LEGAL_NAME,
  FOOTER_LINE,
  MONEY_FOOTER_LINKS,
  PHONE_DISPLAY,
  PICKS_PATH,
  PRODUCT_FOOTER_LINKS,
} from "../../shared/brand";
import { AFFILIATE_TOOLS, DISCLOSURE_LINE, DISCLOSURE_PATH } from "../../shared/disclosure";

const PARTNER_LINKS = AFFILIATE_TOOLS.filter(
  (tool): tool is (typeof AFFILIATE_TOOLS)[number] & { href: string } => "href" in tool && Boolean(tool.href),
);

/** Primary nav. Picks lives on the gold button (PICKS_PATH is a static page, so it is a plain link). */
const NAV = [
  { to: "/ads", label: "AI Ad Sprint" },
  { to: "/concierge", label: "AI Concierge" },
  { to: "/consult", label: "Consult" },
  { to: "/buzz", label: "The Buzz" },
  { to: "/about", label: "About" },
];

const HIVE_LINKS = [
  { to: "/", label: "Home" },
  { to: "/buzz", label: "The Buzz" },
  { to: "/rankings", label: "Rankings" },
  { to: "/about", label: "About" },
];

const GUIDE_LINKS = [
  { to: "/consult/ai-consultant-cost", label: "AI consultant cost" },
  { to: "/consult/ai-consultant-hourly-rate", label: "AI consultant hourly rate" },
  { to: "/consult/ai-audit-cost", label: "AI audit cost" },
];

function LiveDemo({ className = "" }: { className?: string }) {
  return (
    <a href={`tel:${CONSULT_TEL}`} className={`ah-call ${className}`.trim()}>
      <span className="ah-dot" aria-hidden="true" />
      <span className="ah-call-k">Live AI demo</span>
      <span className="ah-call-n">{PHONE_DISPLAY}</span>
    </a>
  );
}

const ARROW = (
  <svg viewBox="0 0 20 20" aria-hidden="true" width="18" height="18">
    <path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("ah-lock", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="shell">
      <Seo />
      <div className="honeycomb" aria-hidden="true" />
      <header className={`ah-head${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
        <div className="container ah-bar">
          <Link to="/" className="ah-brand" aria-label={`${BRAND_NAME} home`}>
            <img src="/brand/mark-bee.webp" alt="" width={36} height={36} />
            <span className="ah-word">
              Agent<span className="gold">Hive</span> <span className="ah-inc">Inc</span>
            </span>
          </Link>
          <nav className="ah-nav" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink key={item.label} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ah-actions">
            <LiveDemo className="ah-call--bar" />
            <a href={PICKS_PATH} className="ah-cta">
              Shop Picks
            </a>
            <button
              type="button"
              className="ah-burger"
              aria-expanded={open}
              aria-controls="ah-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="ah-burger-l">{open ? "Close" : "Menu"}</span>
              <span className="ah-burger-i" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
        <div className="ah-menu" id="ah-menu" hidden={!open}>
          <nav className="container ah-menu-in" aria-label="Menu">
            {NAV.map((item, index) => (
              <NavLink key={item.label} to={item.to} className="ah-m" onClick={() => setOpen(false)}>
                <span className="ah-m-i" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.label}
              </NavLink>
            ))}
            <div className="ah-menu-foot">
              <a href={PICKS_PATH} className="ah-cta ah-cta--lg" onClick={() => setOpen(false)}>
                Shop Picks {ARROW}
              </a>
              <LiveDemo className="ah-call--lg" />
            </div>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="ah-foot">
        <div className="container">
          <div className="ah-foot-top">
            <p className="ah-foot-line">
              Built to your brand. <em>Run for you.</em>
            </p>
            <div className="ah-foot-act">
              <Link to="/ads" className="ah-cta ah-cta--lg">
                See the AI Ad Sprint {ARROW}
              </Link>
              <Link to="/consult" className="ah-ghost">
                Talk to an operator
              </Link>
            </div>
          </div>

          <div className="ah-foot-grid">
            <div className="ah-foot-brand">
              <Link to="/" className="ah-brand" aria-label={`${BRAND_NAME} home`}>
                <img src="/brand/mark-bee.webp" alt="" width={36} height={36} loading="lazy" />
                <span className="ah-word">
                  Agent<span className="gold">Hive</span> <span className="ah-inc">Inc</span>
                </span>
              </Link>
              <p>A done-for-you AI operator for funded teams. We build it to your brand, run it, and hand you the finished result.</p>
              <LiveDemo />
            </div>
            <nav className="ah-foot-cols" aria-label="Footer">
              <div>
                <p className="ah-foot-h">Start</p>
                {MONEY_FOOTER_LINKS.map((link) => (
                  <a key={link.href} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
              <div>
                <p className="ah-foot-h">Hive</p>
                {HIVE_LINKS.map((link) => (
                  <Link key={link.to} to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </div>
              <div>
                <p className="ah-foot-h">Guides</p>
                {GUIDE_LINKS.map((link) => (
                  <Link key={link.to} to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </div>
              <div>
                <p className="ah-foot-h">Contact</p>
                <a href={`mailto:${CONTACT_EMAIL}`}>Email us</a>
                <a href={FD_URL}>{FD_NAME}</a>
                <a href="/llms.txt">llms.txt</a>
                <Link to={DISCLOSURE_PATH}>Disclosure</Link>
              </div>
            </nav>
          </div>

          <p className="ah-foot-row footer-products">
            <span className="ah-foot-k">Products</span>
            {PRODUCT_FOOTER_LINKS.map((link, index) => (
              <Fragment key={link.href}>
                {index > 0 ? <span aria-hidden="true">·</span> : null}
                <a href={link.href}>{link.label}</a>
              </Fragment>
            ))}
          </p>

          <div className="ah-foot-id">
            <p>
              <strong>{BRAND_NAME}</strong> · {LEGAL_NAME} · agenthiveinc.com · {FOOTER_LINE.replace(`${BRAND_NAME} · `, "")}
            </p>
            <p>© 2026 {BRAND_NAME}</p>
          </div>

          <div className="ah-foot-fine">
            <p className="ah-foot-row">
              <span className="ah-foot-k">Tools we use</span>
              {PARTNER_LINKS.map((tool) => (
                <a key={tool.href} href={tool.href} target="_blank" rel="sponsored noopener">
                  {tool.name}
                </a>
              ))}
              <a href={PICKS_PATH}>All picks</a>
            </p>
            <p className="ah-foot-disc">
              {DISCLOSURE_LINE} Partner links are marked sponsored; we may earn a fee at no extra cost to you.{" "}
              <Link to={DISCLOSURE_PATH}>Disclosure</Link> ·{" "}
              <a href="https://join.netlify.com/mn6b2zkzsv2b" target="_blank" rel="sponsored noopener">
                Hosted on Netlify
              </a>
            </p>
            <div className="ah-foot-row ah-badges" aria-label="Featured on">
              <span className="ah-foot-k">Listed on</span>
              {FEATURED_ON.map((item) =>
                "img" in item ? (
                  <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                    <img src={item.img} alt={item.label} width={item.width} height={item.height} loading="lazy" />
                  </a>
                ) : (
                  <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.label.replace(/^Featured on /, "")}
                  </a>
                ),
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
