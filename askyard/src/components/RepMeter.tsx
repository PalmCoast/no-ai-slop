import type { RepReport } from "../../shared/rep";

export default function RepMeter({ report }: { report: RepReport }) {
  return (
    <div className={`meter meter--${report.label}`} aria-label={`Reputation ${report.score} ${report.label}`}>
      <div className="meter-top">
        <span className="meter-score">{report.score}</span>
        <span className="pill">{report.label}</span>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${report.score}%` }} />
      </div>
      <p className="muted">{report.summary}</p>
      <div className="meter-stats">
        <span>
          <b>{report.helpful}</b> helpful
        </span>
        <span>
          <b>{report.missed}</b> missed
        </span>
        <span>
          <b>{report.watchCount}</b> watch hits
        </span>
      </div>
    </div>
  );
}
