import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EMPLOYMENT_TYPES, LABELS, SENIORITIES, WORKPLACES, type JobInput } from "../../shared/rules";
import type { Applicant, Company, Job } from "../../shared/types";
import { api, timeAgo } from "../api";
import { useAuth } from "../auth";
import { Alert, Avatar, Empty, EmployerBadge, ErrorBox, Spinner, StateSelect, StatusBadge, VeteranBadge } from "../components/ui";

interface CompanyResponse {
  company: Company | null;
  price_cents: number;
  payments: "stripe" | "demo" | "unconfigured";
}

function useCompany() {
  const [data, setData] = useState<CompanyResponse | null>(null);
  const [error, setError] = useState<unknown>(null);
  const reload = () => api.get<CompanyResponse>("/api/employer/company").then(setData).catch(setError);
  useEffect(() => {
    void reload();
  }, []);
  return { data, error, reload, setData };
}

function CompanyForm({ company, onSaved }: { company: Company | null; onSaved: (c: Company) => void }) {
  const [name, setName] = useState(company?.name ?? "");
  const [website, setWebsite] = useState(company?.website ?? "");
  const [description, setDescription] = useState(company?.description ?? "");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api.put<{ company: Company }>("/api/employer/company", { name, website, description });
      onSaved(r.company);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="form" onSubmit={submit}>
      <label className="field">
        Company name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="field">
        Company website
        <span className="help">
          You are verified automatically when your account email is on this domain. Consumer mailboxes (gmail, yahoo, etc.) cannot self-verify.
        </span>
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="acme.com" required />
      </label>
      <label className="field">
        About the company <span className="help">Shown on every posting.</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <ErrorBox error={error} />
      <button type="submit" disabled={busy}>
        {busy ? "Saving…" : company ? "Save company" : "Create company profile"}
      </button>
    </form>
  );
}

export function EmployerDashboard() {
  const { me } = useAuth();
  const { data, error, setData } = useCompany();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [params] = useSearchParams();

  useEffect(() => {
    if (!me) return;
    api.get<{ jobs: Job[] }>("/api/employer/jobs").then((r) => setJobs(r.jobs)).catch(() => setJobs([]));
  }, [me?.id]);

  const closeJob = async (id: string) => {
    await api.post(`/api/employer/jobs/${id}/close`);
    setJobs((prev) => prev?.map((j) => (j.id === id ? { ...j, status: "closed" } : j)) ?? null);
  };

  if (!me) {
    return (
      <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1>Post a job for $10</h1>
        <p className="lede muted">
          One flat fee per posting, live for 30 days, seen by experienced US-based IT professionals. No subscriptions, no per-click billing,
          no resume database upsell.
        </p>
        <ul>
          <li>Every applicant is a Stateside member with a real profile. Veteran applicants appear first.</li>
          <li>Verified-employer badge when your account email matches your company website.</li>
          <li>Postings must be for a US work location and must not state a preference by protected class. See the <Link to="/policies">rules</Link>.</li>
        </ul>
        <div className="row">
          <Link className="btn gold" to="/signup">
            Create an account
          </Link>
          <Link className="btn ghost" to="/login" state={{ from: "/employer" }}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (error) return <ErrorBox error={error} />;
  if (!data) return <Spinner />;
  const price = (data.price_cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="sidebar-layout">
      <aside className="stack">
        <div className="card">
          <h3>Your company</h3>
          {data.company && !editing ? (
            <>
              <div style={{ fontWeight: 600 }}>{data.company.name}</div>
              <div className="small muted">{data.company.domain}</div>
              <div style={{ margin: "0.5rem 0" }}>
                <EmployerBadge status={data.company.verification_status} />
              </div>
              {data.company.verification_status === "unverified" && (
                <p className="small muted">
                  Your account email is not on {data.company.domain}. You can still post; an admin may verify you manually. Unverified
                  employers are limited to 3 postings per day.
                </p>
              )}
              <button className="ghost sm" type="button" onClick={() => setEditing(true)}>
                Edit
              </button>
            </>
          ) : (
            <CompanyForm
              company={data.company}
              onSaved={(c) => {
                setData({ ...data, company: c });
                setEditing(false);
              }}
            />
          )}
        </div>
        <div className="card">
          <div className="price">
            {price} <small>per posting</small>
          </div>
          <p className="small muted">30 days live. Applicants come to you here; veterans are listed first.</p>
          {data.payments === "demo" && <Alert kind="gold">Payments are in demo mode on this environment: postings publish without a charge.</Alert>}
          {data.payments === "unconfigured" && <Alert kind="error">Payments are not configured. Set STRIPE_SECRET_KEY to accept postings.</Alert>}
          {data.company ? (
            <Link className="btn gold" to="/employer/post">
              Post a job
            </Link>
          ) : (
            <span className="small muted">Create your company profile to post.</span>
          )}
        </div>
      </aside>
      <section>
        <div className="card-title">
          <h1>Your postings</h1>
        </div>
        {params.get("cancelled") && <Alert kind="info">Checkout was cancelled. The posting is saved and you can pay whenever you are ready.</Alert>}
        {jobs === null && <Spinner />}
        {jobs && jobs.length === 0 && <Empty>No postings yet.</Empty>}
        <div className="stack">
          {jobs?.map((j) => (
            <div key={j.id} className="card">
              <div className="card-title">
                <h3 style={{ margin: 0 }}>
                  <Link to={`/jobs/${j.id}`}>{j.title}</Link>
                </h3>
                <StatusBadge status={j.status} />
              </div>
              <div className="job-meta">
                <span>{LABELS[j.workplace]}</span>
                <span>{LABELS[j.employment_type]}</span>
                <span>Created {timeAgo(j.created_at)}</span>
                {j.expires_at && <span>Expires {new Date(j.expires_at).toLocaleDateString()}</span>}
                <span>
                  {j.application_count ?? 0} {j.application_count === 1 ? "applicant" : "applicants"}
                </span>
              </div>
              <div className="row" style={{ marginTop: "0.6rem" }}>
                {j.status === "pending_payment" && (
                  <Link className="btn gold sm" to={`/employer/post?job=${j.id}`}>
                    Pay {price} and publish
                  </Link>
                )}
                <Link className="btn ghost sm" to={`/employer/jobs/${j.id}/applicants`}>
                  Applicants
                </Link>
                <Link className="btn ghost sm" to={`/employer/post?edit=${j.id}`}>
                  Edit
                </Link>
                {j.status === "published" && (
                  <button className="danger sm" type="button" onClick={() => void closeJob(j.id)}>
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const emptyJob: JobInput = {
  title: "",
  description: "",
  employment_type: "full_time",
  workplace: "hybrid",
  city: "",
  state: "",
  salary_min: null,
  salary_max: null,
  seniority: "senior",
  skills: [],
  veteran_preferred: false,
  apply_url: "",
};

export function PostJob() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const payId = params.get("job");
  const { data } = useCompany();
  const [form, setForm] = useState<JobInput>(emptyJob);
  const [skillsText, setSkillsText] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Job | null>(null);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    const id = editId ?? payId;
    if (!id) return;
    api.get<{ job: Job }>(`/api/jobs/${id}`).then((r) => {
      const j = r.job;
      setForm({
        title: j.title,
        description: j.description,
        employment_type: j.employment_type,
        workplace: j.workplace,
        city: j.city,
        state: j.state,
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        seniority: j.seniority,
        skills: j.skills,
        veteran_preferred: j.veteran_preferred,
        apply_url: j.apply_url,
      });
      setSkillsText(j.skills.join(", "));
      if (payId) setCreated(j);
    });
  }, [editId, payId]);

  const set = <K extends keyof JobInput>(k: K, v: JobInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const payload = () => ({ ...form, skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean) });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (editId) {
        await api.put(`/api/employer/jobs/${editId}`, payload());
        navigate("/employer");
        return;
      }
      const r = await api.post<{ job: Job }>("/api/employer/jobs", payload());
      setCreated(r.job);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const pay = async () => {
    if (!created) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.post<{ url: string; demo?: boolean }>(`/api/employer/jobs/${created.id}/checkout`);
      window.location.assign(r.url);
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  const price = data ? (data.price_cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" }) : "$10.00";

  if (created && !editId) {
    return (
      <div className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1>Review and pay</h1>
        <p>
          <b>{created.title}</b> is saved and ready to publish. It goes live for 30 days as soon as payment clears, first to veteran
          members and then to everyone.
        </p>
        <div className="price">
          {price} <small>one-time</small>
        </div>
        {data?.payments === "demo" && <Alert kind="gold">Demo mode: no card will be charged on this environment.</Alert>}
        <ErrorBox error={error} />
        <div className="row" style={{ marginTop: "1rem" }}>
          <button className="gold" type="button" onClick={() => void pay()} disabled={busy || data?.payments === "unconfigured"}>
            {busy ? "Opening checkout…" : data?.payments === "stripe" ? `Pay ${price} with card` : `Publish (demo)`}
          </button>
          <Link className="btn ghost" to="/employer">
            Later
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="card form" style={{ maxWidth: 760, margin: "0 auto" }} onSubmit={save}>
      <h1>{editId ? "Edit posting" : "Post a job"}</h1>
      <Alert kind="info">
        Every Stateside posting is a US work location and requires authorization to work in the United States; both are shown automatically.
        Do not state a preference or exclusion by race, national origin, religion, sex, age, or disability. <Link to="/policies">Read the rules.</Link>
      </Alert>
      <label className="field">
        Job title
        <input value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Senior Network Engineer" />
      </label>
      <div className="grid-3">
        <label className="field">
          Employment type
          <select value={form.employment_type} onChange={(e) => set("employment_type", e.target.value)}>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Workplace
          <select value={form.workplace} onChange={(e) => set("workplace", e.target.value)}>
            {WORKPLACES.map((t) => (
              <option key={t} value={t}>
                {LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Level
          <select value={form.seniority} onChange={(e) => set("seniority", e.target.value)}>
            {SENIORITIES.map((t) => (
              <option key={t} value={t}>
                {LABELS[t]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid-2">
        <label className="field">
          City <span className="help">Required unless remote.</span>
          <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Columbus" />
        </label>
        <label className="field">
          State
          <StateSelect value={form.state} onChange={(v) => set("state", v)} allowEmpty={false} />
        </label>
      </div>
      <div className="grid-2">
        <label className="field">
          Salary minimum (USD/yr) <span className="help">Optional, but postings with pay get far more applicants.</span>
          <input type="number" min={0} step={1000} value={form.salary_min ?? ""} onChange={(e) => set("salary_min", e.target.value ? Number(e.target.value) : null)} />
        </label>
        <label className="field">
          Salary maximum (USD/yr)
          <input type="number" min={0} step={1000} value={form.salary_max ?? ""} onChange={(e) => set("salary_max", e.target.value ? Number(e.target.value) : null)} />
        </label>
      </div>
      <label className="field">
        Skills <span className="help">Comma-separated, up to 20.</span>
        <input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="Cisco, Palo Alto, BGP, Python" />
      </label>
      <label className="field">
        Description <span className="help">At least 80 characters. What the job is, who it reports to, what a good first year looks like.</span>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} style={{ minHeight: 220 }} required />
      </label>
      <label className="field">
        External apply link <span className="help">Optional. Applicants can always apply here on Stateside.</span>
        <input value={form.apply_url} onChange={(e) => set("apply_url", e.target.value)} placeholder="https://" />
      </label>
      <label className="check">
        <input type="checkbox" checked={form.veteran_preferred} onChange={(e) => set("veteran_preferred", e.target.checked)} />
        <span>
          <b>Veteran preferred.</b> Shows a badge and ranks the posting higher in search. Veterans always see new postings first regardless.
        </span>
      </label>
      {!editId && (
        <label className="check">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
          <span>
            I confirm this is a real, currently open role at my company, located in the United States, and that it complies with the{" "}
            <Link to="/policies">Stateside posting rules</Link> and US equal-employment law.
          </span>
        </label>
      )}
      <ErrorBox error={error} />
      <div className="row">
        <button type="submit" className="gold" disabled={busy || (!editId && !agree)}>
          {busy ? "Saving…" : editId ? "Save changes" : `Continue to payment (${price})`}
        </button>
        <Link className="btn ghost" to="/employer">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function PostSuccess() {
  const [params] = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    const q = new URLSearchParams({ job: params.get("job") ?? "", session_id: params.get("session_id") ?? "" });
    api.get<{ job: Job }>(`/api/employer/checkout/confirm?${q}`).then((r) => setJob(r.job)).catch(setError);
  }, [params]);
  if (error) return <ErrorBox error={error} />;
  if (!job) return <Spinner label="Confirming payment…" />;
  const live = job.status === "published";
  return (
    <div className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1>{live ? "Your posting is live" : "Payment is processing"}</h1>
      {live ? (
        <>
          <p>
            <b>{job.title}</b> is published{params.get("demo") ? " (demo mode, no charge)" : ""}. Veteran members see it now; it opens to
            everyone after the veterans-first window. It stays live for 30 days.
          </p>
          <div className="row">
            <Link className="btn" to={`/jobs/${job.id}`}>
              View posting
            </Link>
            <Link className="btn ghost" to="/employer">
              Back to dashboard
            </Link>
          </div>
        </>
      ) : (
        <p>We have not received confirmation from Stripe yet. This page will show the posting as live once payment clears; refresh in a moment.</p>
      )}
    </div>
  );
}

export function Applicants() {
  const { id } = useParams();
  const [data, setData] = useState<{ job: Job; applicants: Applicant[] } | null>(null);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    api.get<{ job: Job; applicants: Applicant[] }>(`/api/employer/jobs/${id}/applicants`).then(setData).catch(setError);
  }, [id]);

  const setStatus = async (appId: string, status: string) => {
    await api.patch(`/api/employer/applications/${appId}`, { status });
    setData((d) => (d ? { ...d, applicants: d.applicants.map((a) => (a.application_id === appId ? { ...a, application_status: status } : a)) } : d));
  };

  if (error) return <ErrorBox error={error} />;
  if (!data) return <Spinner />;
  return (
    <>
      <div className="card-title">
        <h1>Applicants · {data.job.title}</h1>
        <Link to="/employer">← Dashboard</Link>
      </div>
      <p className="muted small">Veterans are listed first, then in the order they applied.</p>
      {data.applicants.length === 0 && <Empty>No applicants yet.</Empty>}
      <ul className="list">
        {data.applicants.map((a) => (
          <li key={a.application_id} className="card">
            <div className="person" style={{ gridTemplateColumns: "44px 1fr auto" }}>
              <Avatar name={a.name} veteran={a.veteran_status} />
              <div>
                <div className="row" style={{ gap: "0.5rem" }}>
                  <Link to={`/people/${a.id}`} style={{ fontWeight: 600, color: "var(--navy)" }}>
                    {a.name}
                  </Link>
                  <VeteranBadge status={a.veteran_status} branch={a.veteran_branch} />
                  <span className="badge status">{a.application_status}</span>
                </div>
                <div className="small muted">
                  {a.headline || "IT professional"} · {a.years_experience} yrs · {[a.city, a.state].filter(Boolean).join(", ") || "US"} · applied {timeAgo(a.applied_at)}
                </div>
                {a.note && <p className="prose small" style={{ margin: "0.5rem 0 0" }}>{a.note}</p>}
                {a.resume_url && (
                  <a className="small" href={a.resume_url} target="_blank" rel="noreferrer">
                    Resume ↗
                  </a>
                )}
                <div className="chips" style={{ marginTop: "0.4rem" }}>
                  {a.skills.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <select value={a.application_status} onChange={(e) => void setStatus(a.application_id, e.target.value)} style={{ width: "auto" }}>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="contacted">Contacted</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
