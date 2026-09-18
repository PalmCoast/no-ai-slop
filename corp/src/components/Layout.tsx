import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/#roster", label: "The Swarm", hash: true },
  { to: "/buzz", label: "The Buzz" },
  { to: "/rankings", label: "Rankings" },
  { to: "/consult", label: "Consult" },
  { to: "/about", label: "About" },
  { to: "/build", label: "Custom Builds" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="shell">
      <div className="honeycomb" aria-hidden="true" />
      <header className="topbar">
        <div className="container nav">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <img src="/brand/mark-bee.jpg" alt="" width={36} height={36} />
            <span>
              Agent<span className="gold">Hive</span>
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
            <a href="tel:+15093572230" className="phone">
              (509) 357-2230
            </a>
            <a href="/#roster" className="btn btn-primary">
              Recruit a Bot
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
            <a href="tel:+15093572230" onClick={() => setOpen(false)}>
              (509) 357-2230
            </a>
            <a href="/#roster" className="btn btn-primary" onClick={() => setOpen(false)}>
              Recruit a Bot
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
            <img className="footer-mark" src="/brand/wordmark.jpg" alt="AgentHive Inc" />
            <p>
              AI-native product studio. Palm Coast, Florida.
              <br />
              Ship fast. Learn in public. Build AI that earns while you sleep.
            </p>
            <p>
              24/7 AI Voice:{" "}
              <a href="tel:+15093572230">
                <strong>(509) 357-2230</strong>
              </a>
            </p>
          </div>
          <div>
            <strong>Hive</strong>
            <Link to="/">Home</Link>
            <Link to="/buzz">The Buzz</Link>
            <Link to="/rankings">Rankings</Link>
            <Link to="/consult">Consult</Link>
            <Link to="/about">About</Link>
            <Link to="/build">Custom Builds</Link>
          </div>
          <div>
            <strong>Live work</strong>
            <a href="https://firstdeploy.ai/">First Deploy</a>
            <Link to="/consult">Consult</Link>
            <a href="https://claudefarm.com/">ClaudeFarm</a>
            <a href="https://writehive.netlify.app/">WriteHive</a>
            <a href="https://bot-lock.netlify.app/">Bot Lock</a>
          </div>
          <div>
            <strong>Contact</strong>
            <a href="mailto:coltsinsider@gmail.com">coltsinsider@gmail.com</a>
            <a href="mailto:daniel@agenthiveinc.com">daniel@agenthiveinc.com</a>
            <a href="tel:+15093572230">(509) 357-2230</a>
            <a href="tel:+13203356186">First Deploy (320) 335-6186</a>
            <a href="/llms.txt">llms.txt</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <div>© 2026 AgentHive Inc. · Florida LLC</div>
          <div>THE HIVE · We SWARM with GROK BOTS</div>
        </div>
      </footer>
    </div>
  );
}
