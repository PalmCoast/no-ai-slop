import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { formatSalary, LABELS, SENIORITIES, WORKPLACES } from "../../shared/rules";
import type { Job } from "../../shared/types";
import { api, ApiFailure, hoursLeft, timeAgo } from "../api";
import { useAuth } from "../auth";
import { Alert, Empty, EmployerBadge, ErrorBox, JobCard, location, ReportButton, Spinner, StateSelect } from "../components/ui";

export function JobsPage() {
  const { me } = useAuth();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<{ jobs: Job[]; total: number; veteran_window_hours: number } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const q = params.get("q") ?? "";
  const state = params.get("state") ?? "";
  const workplace = params.get("workplace") ?? "";
  const seniority = params.get("seniority") ?? "";
  const veteranOnly = params.get("veteran_preferred") === "true";

  useEffect(() => {
    setData(null);
    api
      .get<{ jobs: Job[]; total: number; veteran_window_hours: number }>(`/api/jobs?${params.toString()}`)
      .then(setData)
      .catch(setError);
  }, [params, me?.id]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <>
      <div className="card-title">
        <h1>Jobs</h1>
        {data && (
          <span className="muted">
            {data.total} open {data.total === 1 ? "posting" : "postings"}
          </span>
        )}
      </div>
      {!me && (
        <Alert kind="gold">
          New postings are visible to veteran members for their first {data?.veteran_window_hours ?? 48} hours. <Link to="/signup">Join free</Link> to
          see everything you are eligible for.
        </Alert>
      )}
      <form
        className="card filters"
        style={{ margin: "1rem 0" }}
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
        }}
      >
        <label className="field">
          Search
          <input value={q} placeholder="Title, skill, or company" onChange={(e) => update("q", e.target.value)} />
        </label>
        <label className="field">
          State
          <StateSelect value={state} onChange={(v) => update("state", v)} />
        </label>
        <label className="field">
          Workplace
          <select value={workplace} onChange={(e) => update("workplace", e.target.value)}>
            <option value="">Any</option>
            {WORKPLACES.map((w) => (
              <option key={w} value={w}>
                {LABELS[w]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Level
          <select value={seniority} onChange={(e) => update("seniority", e.target.value)}>
            <option value="">Any</option>
            {SENIORITIES.map((s) => (
              <option key={s} value={s}>
                {LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="check" style={{ paddingBottom: "0.6rem" }}>
          <input type="checkbox" checked={veteranOnly} onChange={(e) => update("veteran_preferred", e.target.checked ? "true" : "")} />
          Veteran preferred
        </label>
      </form>
      <ErrorBox error={error} />
      {!data && !error && <Spinner />}
      {data && data.jobs.length === 0 && <Empty>No postings match. Try widening the search.</Empty>}
      <div className="stack">{data?.jobs.map((j) => <JobCard key={j.id} job={j} windowHours={data.veteran_window_hours} />)}</div>
    </>
  );
}

export function JobDetail() {
  const { id } = useParams();
  const { me } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isPoster, setIsPoster] = useState(false);
  const [windowHours, setWindowHours] = useState(48);
  const [error, setError] = useState<unknown>(null);
  const [note, setNote] = useState("");
  const [resume, setResume] = useState("");
  const [applyError, setApplyError] = useState<unknown>(null);
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ job: Job; is_poster: boolean; veteran_window_hours: number }>(`/api/jobs/${id}`)
      .then((r) => {
        setJob(r.job);
        setIsPoster(r.is_poster);
        setWindowHours(r.veteran_window_hours);
        setApplied(!!r.job.applied);
      })
      .catch(setError);
  }, [id, me?.id]);

  const toggleSave = async () => {
    if (!job) return;
    if (job.saved) await api.del(`/api/jobs/${job.id}/save`);
    else await api.post(`/api/jobs/${job.id}/save`);
    setJob({ ...job, saved: !job.saved });
  };

  const apply = async (e: FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setBusy(true);
    setApplyError(null);
    try {
      await api.post(`/api/jobs/${job.id}/apply`, { note, resume_url: resume });
      setApplied(true);
    } catch (err) {
      setApplyError(err);
    } finally {
      setBusy(false);
    }
  };

  if (error instanceof ApiFailure && error.code === "veteran_window") {
    return (
      <div className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1>Veterans get first look</h1>
        <p>{error.message}</p>
        <p className="muted small">
          If you served, mark yourself as a veteran on your <Link to="/profile">profile</Link> to see new postings right away.
        </p>
        <Link className="btn ghost" to="/jobs">
          Back to jobs
        </Link>
      </div>
    );
  }
  if (error) return <ErrorBox error={error} />;
  if (!job) return <Spinner />;

  return (
    <div className="sidebar-layout" style={{ gridTemplateColumns: "1fr 320px" }}>
      <article className="card">
        <div className="row" style={{ marginBottom: "0.4rem" }}>
          {job.veteran_window && <span className="badge window">Veterans first · {hoursLeft(job.published_at, windowHours)}h left</span>}
          {job.veteran_preferred && <span className="badge vet">Veteran preferred</span>}
          {job.status !== "published" && <span className="badge status">{job.status.replace("_", " ")}</span>}
        </div>
        <h1>{job.title}</h1>
        <div className="job-meta" style={{ marginBottom: "1rem" }}>
          <span>
            <b>{job.company_name}</b>
          </span>
          <EmployerBadge status={job.company_verification} />
          <span>{location(job)}</span>
          <span>{LABELS[job.workplace]}</span>
          <span>{LABELS[job.employment_type]}</span>
          <span>{LABELS[job.seniority]}</span>
          <span>Posted {timeAgo(job.published_at ?? job.created_at)}</span>
        </div>
        <div className="chips" style={{ marginBottom: "1.25rem" }}>
          {job.skills.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
        <div className="prose">{job.description}</div>
        <p className="small muted" style={{ marginTop: "1.5rem" }}>
          This role is located in the United States and requires authorization to work in the US. Stateside does not permit postings that
          state a preference by race, national origin, religion, sex, age, or disability. {me && !isPoster && <ReportButton type="job" id={job.id} />}
        </p>
      </article>
      <aside className="stack">
        <div className="card">
          <div className="price">
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
          <div className="muted small">{LABELS[job.employment_type]} · {LABELS[job.seniority]}</div>
        </div>
        {isPoster ? (
          <div className="card">
            <p className="muted small">This is your posting.</p>
            <Link className="btn" to={`/employer/jobs/${job.id}/applicants`}>
              View applicants
            </Link>
          </div>
        ) : !me ? (
          <div className="card">
            <p>
              <Link to="/login" state={{ from: `/jobs/${job.id}` }}>
                Sign in
              </Link>{" "}
              or <Link to="/signup">join free</Link> to apply.
            </p>
          </div>
        ) : applied ? (
          <div className="card">
            <Alert kind="ok">Application sent. The employer sees your profile and note.</Alert>
          </div>
        ) : (
          <form className="card form" onSubmit={apply}>
            <h3>Apply</h3>
            <p className="small muted" style={{ margin: 0 }}>
              Your profile goes with the application. Complete it on the <Link to="/profile">profile page</Link>.
            </p>
            <label className="field">
              Note to the employer
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Two or three sentences on why you fit." />
            </label>
            <label className="field">
              Resume link <span className="help">Optional. A link to a PDF you host (Drive, Dropbox, your site).</span>
              <input value={resume} onChange={(e) => setResume(e.target.value)} placeholder="https://" />
            </label>
            <ErrorBox error={applyError} />
            <button type="submit" className="gold" disabled={busy}>
              {busy ? "Sending…" : "Send application"}
            </button>
            {job.apply_url && (
              <a className="small" href={job.apply_url} target="_blank" rel="noreferrer">
                Or apply on the company site ↗
              </a>
            )}
            <button type="button" className="ghost sm" onClick={() => void toggleSave()}>
              {job.saved ? "Saved ✓" : "Save for later"}
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}
