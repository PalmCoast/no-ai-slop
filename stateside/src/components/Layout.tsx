import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

function Logo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#c8a24a" />
      <path d="M14 40 L32 14 L50 40 Z" fill="#0b1f3a" />
      <rect x="14" y="44" width="36" height="6" rx="3" fill="#0b1f3a" />
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
