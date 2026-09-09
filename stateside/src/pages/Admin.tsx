import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Company, Report } from "../../shared/types";
import { api, timeAgo } from "../api";
import { EmployerBadge, ErrorBox, Spinner } from "../components/ui";

interface Verification {
  id: string;
  branch: string;
  service_years: string;
  evidence: string;
  status: string;
  created_at: string;
  user_id: string;
  name: string;
  email: string;
}
type AdminCompany = Company & { owner_name: string; owner_email: string; job_count: number };

export function AdminPage() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [reports, setReports] = useState<(Report & { target_label: string | null })[] | null>(null);
  const [veterans, setVeterans] = useState<Verification[] | null>(null);
  const [companies, setCompanies] = useState<AdminCompany[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [tab, setTab] = useState<"reports" | "veterans" | "companies">("reports");

  const load = () =>
    Promise.all([
      api.get<{ counts: Record<string, number> }>("/api/admin/overview").then((r) => setCounts(r.counts)),
      api.get<{ reports: (Report & { target_label: string | null })[] }>("/api/admin/reports").then((r) => setReports(r.reports)),
      api.get<{ verifications: Verification[] }>("/api/admin/veterans").then((r) => setVeterans(r.verifications)),
      api.get<{ companies: AdminCompany[] }>("/api/admin/companies").then((r) => setCompanies(r.companies)),
    ]).catch(setError);
  useEffect(() => {
    void load();
  }, []);

  const resolve = (id: string, action: "dismiss" | "remove_target") => api.patch(`/api/admin/reports/${id}`, { action }).then(load);
  const review = (id: string, action: "approve" | "reject") => api.patch(`/api/admin/veterans/${id}`, { action }).then(load);
  const setCompany = (id: string, status: string) => api.patch(`/api/admin/companies/${id}`, { status }).then(load);

  if (error) return <ErrorBox error={error} />;
  if (!counts) return <Spinner />;

  return (
    <>
      <h1>Moderation</h1>
      <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
        <div className="card stat">
          <b>{counts.users}</b> members <span className="small muted">({counts.veterans} veterans)</span>
        </div>
        <div className="card stat">
          <b>{counts.published_jobs}</b> live postings <span className="small muted">({counts.companies} employers)</span>
        </div>
        <div className="card stat">
          <b>${((counts.revenue_cents ?? 0) / 100).toFixed(0)}</b> collected <span className="small muted">({counts.groups} groups)</span>
        </div>
      </div>
      <div className="tabs">
        <button type="button" className={tab === "reports" ? "active" : ""} onClick={() => setTab("reports")}>
          Reports ({counts.open_reports} open)
        </button>
        <button type="button" className={tab === "veterans" ? "active" : ""} onClick={() => setTab("veterans")}>
          Veteran verification ({counts.pending_veterans} pending)
        </button>
        <button type="button" className={tab === "companies" ? "active" : ""} onClick={() => setTab("companies")}>
          Employers
        </button>
      </div>

      {tab === "reports" && (
        <div className="card">
          {reports?.length === 0 && <div className="empty">No reports.</div>}
          {reports && reports.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Reason</th>
                  <th>Reporter</th>
                  <th>When</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} style={{ opacity: r.resolved_at ? 0.55 : 1 }}>
                    <td>
                      <span className="badge status">{r.target_type}</span>{" "}
                      {r.target_type === "job" ? <Link to={`/jobs/${r.target_id}`}>{r.target_label ?? r.target_id}</Link> : r.target_type === "user" ? <Link to={`/people/${r.target_id}`}>{r.target_label ?? r.target_id}</Link> : r.target_label ?? r.target_id}
                    </td>
                    <td>{r.reason}</td>
                    <td>{r.reporter_name}</td>
                    <td className="small muted">{timeAgo(r.created_at)}</td>
                    <td>
                      {r.resolved_at ? (
                        <span className="small muted">{r.resolution}</span>
                      ) : (
                        <span className="row" style={{ gap: "0.3rem" }}>
                          <button className="ghost sm" type="button" onClick={() => void resolve(r.id, "dismiss")}>
                            Dismiss
                          </button>
                          <button className="danger sm" type="button" onClick={() => void resolve(r.id, "remove_target")}>
                            {r.target_type === "user" ? "Ban user" : "Remove"}
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "veterans" && (
        <div className="card">
          {veterans?.length === 0 && <div className="empty">No verification requests.</div>}
          {veterans && veterans.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Branch</th>
                  <th>Service</th>
                  <th>Evidence</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {veterans.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link to={`/people/${v.user_id}`}>{v.name}</Link>
                      <div className="tiny muted">{v.email}</div>
                    </td>
                    <td>{v.branch}</td>
                    <td>{v.service_years}</td>
                    <td className="small">{v.evidence}</td>
                    <td>
                      <span className="badge status">{v.status}</span>
                    </td>
                    <td>
                      {v.status === "pending" && (
                        <span className="row" style={{ gap: "0.3rem" }}>
                          <button className="sm" type="button" onClick={() => void review(v.id, "approve")}>
                            Approve
                          </button>
                          <button className="ghost sm" type="button" onClick={() => void review(v.id, "reject")}>
                            Reject
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "companies" && (
        <div className="card">
          {companies?.length === 0 && <div className="empty">No employers yet.</div>}
          {companies && companies.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Owner</th>
                  <th>Postings</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <b>{c.name}</b>
                      <div className="tiny muted">{c.website}</div>
                    </td>
                    <td>
                      {c.owner_name}
                      <div className="tiny muted">{c.owner_email}</div>
                    </td>
                    <td>{c.job_count}</td>
                    <td>
                      <EmployerBadge status={c.verification_status} />
                      {c.verification_status === "rejected" && <span className="badge status removed">Rejected</span>}
                    </td>
                    <td>
                      <span className="row" style={{ gap: "0.3rem" }}>
                        {c.verification_status !== "admin_verified" && (
                          <button className="sm" type="button" onClick={() => void setCompany(c.id, "admin_verified")}>
                            Verify
                          </button>
                        )}
                        {c.verification_status !== "rejected" && (
                          <button className="danger sm" type="button" onClick={() => void setCompany(c.id, "rejected")}>
                            Reject
                          </button>
                        )}
                        {c.verification_status !== "unverified" && (
                          <button className="ghost sm" type="button" onClick={() => void setCompany(c.id, "unverified")}>
                            Reset
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
