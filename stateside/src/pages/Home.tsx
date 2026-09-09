import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Job } from "../../shared/types";
import { api } from "../api";
import { useAuth } from "../auth";
import { JobCard, Spinner } from "../components/ui";

export function Home() {
  const { me } = useAuth();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [windowHours, setWindowHours] = useState(48);
  useEffect(() => {
    api
      .get<{ jobs: Job[]; veteran_window_hours: number }>("/api/jobs")
      .then((r) => {
        setJobs(r.jobs.slice(0, 5));
        setWindowHours(r.veteran_window_hours);
      })
      .catch(() => setJobs([]));
  }, [me?.id]);

  return (
    <>
      <section className="hero">
        <div>
          <h1>American IT jobs. Real employers. No noise.</h1>
          <p className="lede">
            Stateside is a job network built for experienced IT professionals in the United States. It is free for job seekers, veterans
            get first look at every new posting, and employers pay a flat $10 per job so the listings you see are ones someone stood
            behind.
          </p>
          <div className="row">
            {me ? (
              <Link className="btn gold" to="/jobs">
                Browse jobs
              </Link>
            ) : (
              <Link className="btn gold" to="/signup">
                Join free
              </Link>
            )}
            <Link className="btn ghost" to="/employer">
              Post a job for $10
            </Link>
          </div>
        </div>
        <aside className="hero-panel">
          <h3>How Stateside is different</h3>
          <ul>
            <li>
              <b>01</b>
              <span>
                <b>Free for job seekers, always.</b> Profiles, applications, groups, and messaging cost nothing.
              </span>
            </li>
            <li>
              <b>02</b>
              <span>
                <b>Veterans first.</b> New postings open to veteran members {windowHours} hours before everyone else, and employers see veteran
                applicants at the top of the list.
              </span>
            </li>
            <li>
              <b>03</b>
              <span>
                <b>US jobs only.</b> Every posting is a US work location and requires authorization to work in the United States.
              </span>
            </li>
            <li>
              <b>04</b>
              <span>
                <b>No cold recruiter spam.</b> Direct messages only open between accepted connections. Employers are verified against their
                company domain, and every posting costs $10.
              </span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="pillars">
        <div className="card">
          <h3>Built for experienced people</h3>
          <p className="muted small" style={{ margin: 0 }}>
            Mid-career and senior roles by default: mid-level, senior, lead, principal, manager, director. Years of experience is a feature, not a
            filter to hide.
          </p>
        </div>
        <div className="card">
          <h3>Your own groups</h3>
          <p className="muted small" style={{ margin: 0 }}>
            Create a group for your city, your stack, or your old unit. Chat in real time, invite who you want, moderate it yourself.
          </p>
        </div>
        <div className="card">
          <h3>Equal footing, enforced</h3>
          <p className="muted small" style={{ margin: 0 }}>
            Postings that state a preference by race, national origin, religion, sex, age, or disability are rejected automatically and can
            be reported by any member. See the <Link to="/policies">posting rules</Link>.
          </p>
        </div>
      </section>

      <section>
        <div className="card-title" style={{ marginBottom: "1rem" }}>
          <h2>Latest postings</h2>
          <Link to="/jobs">All jobs →</Link>
        </div>
        {jobs === null && <Spinner />}
        {jobs && jobs.length === 0 && (
          <div className="card empty">
            {me ? "No open postings yet." : "Sign in to see postings. New jobs open to veteran members first."}
          </div>
        )}
        <div className="stack">{jobs?.map((j) => <JobCard key={j.id} job={j} windowHours={windowHours} />)}</div>
      </section>
    </>
  );
}
