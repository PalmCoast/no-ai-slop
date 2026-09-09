import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SERVICE_BRANCHES } from "../../shared/rules";
import type { Job, Me } from "../../shared/types";
import { api } from "../api";
import { useAuth } from "../auth";
import { Alert, ErrorBox, JobCard, Spinner, StateSelect, VeteranBadge } from "../components/ui";

export function ProfilePage() {
  const { me, setMe } = useAuth();
  const [params] = useSearchParams();
  const [form, setForm] = useState<Partial<Me> & { veteran?: boolean }>({});
  const [skills, setSkills] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [verification, setVerification] = useState<{ status: string } | null | undefined>(undefined);
  const [vBranch, setVBranch] = useState("");
  const [vYears, setVYears] = useState("");
  const [vEvidence, setVEvidence] = useState("");
  const [tab, setTab] = useState<"profile" | "applications" | "saved">("profile");
  const [applications, setApplications] = useState<(Job & { application_status: string })[] | null>(null);
  const [savedJobs, setSavedJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    if (!me) return;
    setForm({ ...me, veteran: me.veteran_status !== "none" });
    setSkills(me.skills.join(", "));
    setVBranch(me.veteran_branch);
    api.get<{ verification: { status: string } | null }>("/api/me/veteran-verification").then((r) => setVerification(r.verification));
  }, [me?.id]);

  useEffect(() => {
    if (tab === "applications" && applications === null) api.get<{ jobs: (Job & { application_status: string })[] }>("/api/me/applications").then((r) => setApplications(r.jobs));
    if (tab === "saved" && savedJobs === null) api.get<{ jobs: Job[] }>("/api/me/saved").then((r) => setSavedJobs(r.jobs));
  }, [tab]);

  if (!me) return <Spinner />;

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const r = await api.put<{ user: Me }>("/api/me", { ...form, skills, veteran_branch: vBranch });
      setMe(r.user);
      setSaved(true);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const requestVerification = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const r = await api.post<{ status: string }>("/api/me/veteran-verification", { branch: vBranch, service_years: vYears, evidence: vEvidence });
      setVerification({ status: r.status });
      const refreshed = await api.get<{ user: Me }>("/api/auth/me");
      setMe(refreshed.user);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
      <div className="card-title">
        <h1>Your profile</h1>
        <Link to={`/people/${me.id}`}>View as others see it →</Link>
      </div>
      {params.get("welcome") && (
        <Alert kind="ok">
          Welcome to Stateside. Fill in a headline, your skills, and where you are; employers see this with every application.
        </Alert>
      )}
      <div className="tabs" style={{ marginTop: "1rem" }}>
        <button type="button" className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>
          Profile
        </button>
        <button type="button" className={tab === "applications" ? "active" : ""} onClick={() => setTab("applications")}>
          Applications
        </button>
        <button type="button" className={tab === "saved" ? "active" : ""} onClick={() => setTab("saved")}>
          Saved jobs
        </button>
      </div>

      {tab === "applications" && (
        <div className="stack">
          {applications === null && <Spinner />}
          {applications?.length === 0 && <div className="empty">You have not applied to anything yet.</div>}
          {applications?.map((j) => (
            <div key={j.id}>
              <div className="tiny muted" style={{ marginBottom: "0.2rem" }}>
                Status: <b>{j.application_status}</b>
              </div>
              <JobCard job={j} windowHours={48} />
            </div>
          ))}
        </div>
      )}
      {tab === "saved" && (
        <div className="stack">
          {savedJobs === null && <Spinner />}
          {savedJobs?.length === 0 && <div className="empty">No saved jobs.</div>}
          {savedJobs?.map((j) => <JobCard key={j.id} job={j} windowHours={48} />)}
        </div>
      )}

      {tab === "profile" && (
        <div className="sidebar-layout" style={{ gridTemplateColumns: "1fr 340px" }}>
          <form className="card form" onSubmit={save}>
            <div className="grid-2">
              <label className="field">
                Name
                <input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} required />
              </label>
              <label className="field">
                Headline <span className="help">e.g. "Senior network engineer, 18 years, Cisco/Palo Alto"</span>
                <input value={form.headline ?? ""} onChange={(e) => set("headline", e.target.value)} maxLength={140} />
              </label>
            </div>
            <div className="grid-3">
              <label className="field">
                City
                <input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
              </label>
              <label className="field">
                State
                <StateSelect value={form.state ?? ""} onChange={(v) => set("state", v)} />
              </label>
              <label className="field">
                Years in IT
                <input type="number" min={0} max={60} value={form.years_experience ?? 0} onChange={(e) => set("years_experience", Number(e.target.value))} />
              </label>
            </div>
            <label className="field">
              Skills <span className="help">Comma-separated. Up to 30.</span>
              <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Windows Server, Azure, PowerShell, VMware" />
            </label>
            <label className="field">
              About you
              <textarea value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} placeholder="What you have run, built, fixed, or led. Plain language beats buzzwords." />
            </label>
            <label className="check">
              <input type="checkbox" checked={!!form.open_to_work} onChange={(e) => set("open_to_work", e.target.checked)} />
              <span>Open to work (shows a badge to other members and employers)</span>
            </label>
            {me.veteran_status !== "verified" && (
              <label className="check">
                <input type="checkbox" checked={!!form.veteran} onChange={(e) => set("veteran", e.target.checked)} />
                <span>I am a US military veteran</span>
              </label>
            )}
            <ErrorBox error={error} />
            {saved && <Alert kind="ok">Profile saved.</Alert>}
            <div className="row">
              <button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save profile"}
              </button>
              <span className="small muted">Signed in as {me.email}</span>
            </div>
          </form>

          <aside className="stack">
            <div className="card">
              <h3>Veteran status</h3>
              <div style={{ margin: "0.4rem 0 0.8rem" }}>
                <VeteranBadge status={me.veteran_status} branch={me.veteran_branch} />
                {me.veteran_status === "none" && <span className="small muted">Not marked as a veteran.</span>}
              </div>
              {me.veteran_status === "verified" && (
                <p className="small muted">Verified. You see new postings first, and employers see you at the top of applicant lists.</p>
              )}
              {me.veteran_status !== "verified" && verification?.status === "pending" && (
                <Alert kind="info">Verification request received. An admin will review it.</Alert>
              )}
              {me.veteran_status !== "verified" && verification?.status !== "pending" && (
                <form className="form" onSubmit={requestVerification}>
                  <p className="small muted" style={{ margin: 0 }}>
                    Get the verified badge. Tell us your branch and roughly when you served; an admin reviews requests manually. Do not paste
                    your DD-214 or SSN here.
                  </p>
                  <label className="field">
                    Branch
                    <select value={vBranch} onChange={(e) => setVBranch(e.target.value)} required>
                      <option value="">Choose…</option>
                      {SERVICE_BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Years of service <span className="help">e.g. 2001–2009</span>
                    <input value={vYears} onChange={(e) => setVYears(e.target.value)} />
                  </label>
                  <label className="field">
                    Anything that helps us verify <span className="help">Unit, MOS/rating, or a link to a public record such as a LinkedIn or VA profile.</span>
                    <textarea value={vEvidence} onChange={(e) => setVEvidence(e.target.value)} style={{ minHeight: 70 }} />
                  </label>
                  <button type="submit" className="ghost sm">
                    Request verification
                  </button>
                </form>
              )}
            </div>
            <div className="card">
              <h3>Hiring?</h3>
              <p className="small muted">The same account posts jobs. $10 per posting, 30 days.</p>
              <Link className="btn ghost sm" to="/employer">
                Employer dashboard
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
