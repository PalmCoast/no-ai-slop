import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { formatSalary, LABELS, US_STATES } from "../../shared/rules";
import type { Job, PublicUser } from "../../shared/types";
import { api, errorMessage, hoursLeft, timeAgo } from "../api";

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return <div className="spinner">{label}</div>;
}

export function Alert({ kind = "info", children }: { kind?: "info" | "error" | "ok" | "gold"; children: ReactNode }) {
  return <div className={`alert ${kind}`}>{children}</div>;
}

export function ErrorBox({ error }: { error: unknown }) {
  if (!error) return null;
  return <Alert kind="error">{errorMessage(error)}</Alert>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function VeteranBadge({ status, branch }: { status: string; branch?: string }) {
  if (status === "verified") return <span className="badge vet-verified" title={branch || "Verified veteran"}>★ Verified veteran</span>;
  if (status === "self_reported") return <span className="badge vet" title={branch || "Veteran"}>Veteran</span>;
  return null;
}

export function EmployerBadge({ status }: { status: string }) {
  if (status === "admin_verified" || status === "domain_verified") return <span className="badge verified">✓ Verified employer</span>;
  return <span className="badge unverified">Unverified employer</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const text: Record<string, string> = { pending_payment: "Awaiting payment", published: "Live", closed: "Closed", removed: "Removed" };
  return <span className={`badge status ${status}`}>{text[status] ?? status}</span>;
}

export function Avatar({ name, veteran }: { name: string; veteran?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return <div className={`avatar ${veteran && veteran !== "none" ? "gold" : ""}`}>{initials || "?"}</div>;
}

export function location(j: { city: string; state: string; workplace?: string }): string {
  if (j.workplace === "remote") return j.state === "US" || !j.state ? "Remote, US" : `Remote (${j.state})`;
  return [j.city, j.state].filter(Boolean).join(", ") || "United States";
}

export function JobCard({ job, windowHours }: { job: Job; windowHours: number }) {
  return (
    <article className="card job-card">
      <div>
        <div className="row" style={{ marginBottom: "0.2rem" }}>
          <h3 style={{ margin: 0 }}>
            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>
          {job.veteran_window && <span className="badge window">Veterans first · {hoursLeft(job.published_at, windowHours)}h left</span>}
          {job.veteran_preferred && <span className="badge vet">Veteran preferred</span>}
        </div>
        <div className="job-meta">
          <span>
            <b>{job.company_name}</b>
          </span>
          <EmployerBadge status={job.company_verification} />
          <span>{location(job)}</span>
          <span>{LABELS[job.workplace]}</span>
          <span>{LABELS[job.employment_type]}</span>
          <span>{LABELS[job.seniority]}</span>
        </div>
        <div className="chips" style={{ marginTop: "0.5rem" }}>
          {job.skills.slice(0, 8).map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 600 }}>{formatSalary(job.salary_min, job.salary_max)}</div>
        <div className="small muted">{timeAgo(job.published_at ?? job.created_at)}</div>
        {job.applied && <div className="small" style={{ color: "var(--green)" }}>Applied</div>}
      </div>
    </article>
  );
}

export function PersonRow({ person, action }: { person: PublicUser; action?: ReactNode }) {
  return (
    <li className="card flat person">
      <Avatar name={person.name} veteran={person.veteran_status} />
      <div>
        <div className="row" style={{ gap: "0.5rem" }}>
          <Link to={`/people/${person.id}`} style={{ fontWeight: 600, color: "var(--navy)" }}>
            {person.name}
          </Link>
          <VeteranBadge status={person.veteran_status} branch={person.veteran_branch} />
          {person.open_to_work && <span className="badge status">Open to work</span>}
        </div>
        <div className="small muted">
          {person.headline || "IT professional"}
          {person.city || person.state ? ` · ${[person.city, person.state].filter(Boolean).join(", ")}` : ""}
          {person.years_experience ? ` · ${person.years_experience} yrs` : ""}
        </div>
      </div>
      <div>{action}</div>
    </li>
  );
}

export function StateSelect({ value, onChange, allowEmpty = true }: { value: string; onChange: (v: string) => void; allowEmpty?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {allowEmpty && <option value="">Any state</option>}
      {!allowEmpty && <option value="">Choose a state…</option>}
      {US_STATES.map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}

export function ReportButton({ type, id }: { type: "job" | "user" | "message" | "group"; id: string | number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<unknown>(null);
  if (done) return <span className="small muted">Reported. Thank you.</span>;
  if (!open)
    return (
      <button className="link small" type="button" onClick={() => setOpen(true)}>
        Report
      </button>
    );
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/reports", { target_type: type, target_id: String(id), reason });
      setDone(true);
    } catch (err) {
      setError(err);
    }
  };
  return (
    <form onSubmit={submit} className="form" style={{ maxWidth: 420 }}>
      <label className="field">
        What is wrong?
        <span className="help">Spam, a fake posting, harassment, or wording that targets a protected group.</span>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} style={{ minHeight: 70 }} required />
      </label>
      <ErrorBox error={error} />
      <div className="row">
        <button type="submit" className="sm">
          Send report
        </button>
        <button type="button" className="ghost sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
