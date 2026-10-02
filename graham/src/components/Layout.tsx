import { NavLink, Outlet } from "react-router-dom";

const LINKS = [
  ["/", "Desk"],
  ["/line", "Line"],
  ["/book", "Book"],
  ["/notes", "Notes"],
  ["/double", "Double"],
  ["/apps", "Apps"],
  ["/stand", "Stand one up"],
] as const;

export default function Layout() {
  return (
    <div className="shell">
      <header className="top">
        <a className="brand" href="/">
          <img src="/favicon.svg" alt="" width={36} height={36} />
          <span>Higgins</span>
        </a>
        <p className="brand-line">Daniel's line · AgentHive Inc · Palm Coast</p>
        <nav>
          {LINKS.map(([href, label]) => (
            <NavLink key={href} to={href} end={href === "/"}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>Higgins says who he is before he takes the call. The template is a recipe. Logins stay with the operator.</p>
        <p>
          <a href="https://calendly.com/coltsinsider/30min">Book the free 30</a>
          {" · "}
          <a href="tel:+13203356186">+1 320-335-6186</a>
          {" · "}
          <a href="mailto:daniel@agenthiveinc.com">daniel@agenthiveinc.com</a>
        </p>
      </footer>
    </div>
  );
}
