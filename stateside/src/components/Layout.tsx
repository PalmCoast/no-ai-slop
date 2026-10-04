import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

function Logo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="12" fill="#0b1f3a" />
      <path d="M16 38 L32 16 L48 38 Z" fill="#c8a24a" />
      <rect x="16" y="42" width="32" height="5" fill="#f5f1e8" />
    </svg>
  );
}

export function Layout() {
  const { me, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => {
    await logout();
    navigate("/");
  };
  return (
    <>
      <header className="site-header">
        <div className="inner">
          <Link to="/" className="brand">
            <Logo /> Stateside
          </Link>
          <nav className="nav" aria-label="Main">
            <NavLink to="/jobs">Jobs</NavLink>
            {me && <NavLink to="/groups">Groups</NavLink>}
            {me && <NavLink to="/people">People</NavLink>}
            {me && <NavLink to="/messages">Messages</NavLink>}
            {me?.is_admin && <NavLink to="/admin">Admin</NavLink>}
            <NavLink to="/employer" className="cta">
              Post a job · $10
            </NavLink>
            {me ? (
              <>
                <NavLink to="/profile">{me.name.split(" ")[0]}</NavLink>
                <a href="#" onClick={(e) => { e.preventDefault(); void signOut(); }}>
                  Sign out
                </a>
              </>
            ) : (
              <>
                <NavLink to="/login">Sign in</NavLink>
                <NavLink to="/signup">Join free</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="inner">
          <div>
            <b>Stateside</b> — the job network for American IT professionals. Free for job seekers. Veterans first.
          </div>
          <div className="row">
            <Link to="/policies">Posting rules &amp; non-discrimination policy</Link>
            <Link to="/employer">Employers</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
