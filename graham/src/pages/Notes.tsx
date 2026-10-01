import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { sessionHolds, sessionSlips, subscribeSession } from "../session";

export default function Notes() {
  useEffect(() => {
    document.title = "Notes | Graham";
  }, []);
  const slips = useSyncExternalStore(subscribeSession, sessionSlips);
  const holds = useSyncExternalStore(subscribeSession, sessionHolds);
  const alerts = slips.filter((slip) => slip.result.action === "alert");

  return (
    <div className="container">
      <p className="kicker">The desk</p>
      <h1>Notes, messages, alerts.</h1>
      <p className="lede">Urgent calls sit at the top. A blocked mill stays on the slip so you can see what was refused.</p>
      <section>
        <h2>Urgent</h2>
        {alerts.length === 0 ? <p className="muted">Nothing urgent on this screen.</p> : null}
        <div className="stack">
          {alerts.map((slip) => (
            <article key={slip.id} className="card verdict alert">
              <p className="kicker">{slip.result.reason}</p>
              <h3>{slip.from || "No number"}</h3>
              <p>{slip.said}</p>
              <p>{slip.result.say}</p>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>Holds</h2>
        {holds.length === 0 ? <p className="muted">No holds yet.</p> : null}
        <ul className="plain">
          {holds.map((hold) => (
            <li key={hold.id}>
              <strong>{hold.slot.label}</strong> · {hold.name} · {hold.topic}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>All slips</h2>
        {slips.length === 0 ? <p className="muted">Screen a call and it lands here.</p> : null}
        <div className="stack">
          {slips.map((slip) => (
            <article key={slip.id} className="card">
              <p className="kicker">
                {slip.result.action} · {slip.result.reason}
              </p>
              <h3>{slip.from || "No number"}</h3>
              <p>{slip.said || "No message yet."}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
