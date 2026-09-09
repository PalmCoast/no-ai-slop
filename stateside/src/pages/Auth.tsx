import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { Me } from "../../shared/types";
import { api } from "../api";
import { useAuth } from "../auth";
import { ErrorBox } from "../components/ui";

export function Login() {
  const { setMe } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const next = (location.state as { from?: string } | null)?.from ?? "/jobs";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api.post<{ user: Me }>("/api/auth/login", { email, password });
      setMe(r.user);
      navigate(next);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 440, margin: "0 auto" }}>
      <h1>Sign in</h1>
      <form className="form" onSubmit={submit}>
        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label className="field">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        <ErrorBox error={error} />
        <button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="small muted" style={{ margin: 0 }}>
          New here? <Link to="/signup">Create a free account</Link>.
        </p>
      </form>
    </div>
  );
}

export function Signup() {
  const { setMe } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [veteran, setVeteran] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api.post<{ user: Me }>("/api/auth/signup", { name, email, password, veteran });
      setMe(r.user);
      navigate("/profile?welcome=1");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1>Join Stateside</h1>
      <p className="muted">Free for job seekers. No credit card, no upsell. Employers use the same account to post jobs.</p>
      <form className="form" onSubmit={submit}>
        <label className="field">
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required minLength={2} />
        </label>
        <label className="field">
          Email
          <span className="help">Employers: use your work email. It is how we verify you against your company website.</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label className="field">
          Password
          <span className="help">At least 10 characters.</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={10} />
        </label>
        <label className="check">
          <input type="checkbox" checked={veteran} onChange={(e) => setVeteran(e.target.checked)} />
          <span>
            I am a US military veteran. <span className="muted small">You get first look at new postings. You can verify later from your profile.</span>
          </span>
        </label>
        <ErrorBox error={error} />
        <button type="submit" className="gold" disabled={busy}>
          {busy ? "Creating account…" : "Create free account"}
        </button>
        <p className="small muted" style={{ margin: 0 }}>
          By joining you agree to the <Link to="/policies">community and posting rules</Link>. Already a member? <Link to="/login">Sign in</Link>.
        </p>
      </form>
    </div>
  );
}
