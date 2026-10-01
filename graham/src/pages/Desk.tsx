import { useEffect, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { MONDAY_DROP, PILLARS, PRICE_LABEL, ROUTINES, FORWARD_RULE } from "../../shared/public.ts";
import { sessionSlips, subscribeSession } from "../session";

export default function Desk() {
  useEffect(() => {
    document.title = "Graham | Daniel's line";
  }, []);
  const slips = useSyncExternalStore(subscribeSession, sessionSlips);
  const urgent = slips.filter((slip) => slip.result.action === "alert").length;

  return (
    <div className="container">
      <p className="kicker">AgentHive Inc · Palm Coast</p>
      <h1>Graham answers Daniel's line.</h1>
      <p className="lede">{FORWARD_RULE}</p>
      <p className="price">{PRICE_LABEL}</p>
      <div className="row">
        <Link className="button" to="/line">
          Screen a call
        </Link>
        <Link className="button ghost" to="/double">
          Talk to Graham
        </Link>
        <Link className="button ghost" to="/stand">
          Stand one up
        </Link>
      </div>
      <p className="status">{urgent > 0 ? `${urgent} urgent on this screen` : slips.length > 0 ? `${slips.length} on this screen` : "Line is quiet."}</p>
      <section className="grid">
        {PILLARS.map((pillar) => (
          <article key={pillar.id} className="card">
            <h2>{pillar.name}</h2>
            <p>{pillar.job}</p>
          </article>
        ))}
      </section>
      <section>
        <h2>Routines</h2>
        <ul className="plain">
          {ROUTINES.map((routine) => (
            <li key={routine.id}>
              <strong>{routine.when}.</strong> {routine.does}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Monday drop</h2>
        <p className="muted">From GuyThread. Three things, a price, and the reason.</p>
        <div className="grid">
          {MONDAY_DROP.map((item) => (
            <article key={item.lane} className="card">
              <p className="kicker">{item.lane}</p>
              <h3>{item.thing}</h3>
              <p className="price">{item.price}</p>
              <p>{item.reason}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
