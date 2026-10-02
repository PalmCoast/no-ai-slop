import { FormEvent, useEffect, useState } from "react";
import { postJson } from "../api";
import { CALENDLY_URL, PRICE_LABEL } from "../../shared/public.ts";
import { standUp, type StandResult } from "../../shared/standup.ts";
import { templateLeaks } from "../../shared/template.ts";

export default function Stand() {
  const [surname, setSurname] = useState("");
  const [operator, setOperator] = useState("");
  const [shop, setShop] = useState("");
  const [place, setPlace] = useState("");
  const [stood, setStood] = useState<Extract<StandResult, { ok: true }> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Stand one up | Higgins";
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = standUp({ surname, operator, shop, place });
    if (!result.ok) {
      setStood(null);
      setError(result.error === "operator_required" ? "Need the operator's name." : "Need a surname, letters only.");
      return;
    }
    if (templateLeaks(result.template, [], []).length > 0) {
      setError("That recipe is not safe to hand over.");
      return;
    }
    setError("");
    setStood(result);
    void postJson("/api/standup", { surname, operator, shop, place }).catch(() => undefined);
  }

  function download() {
    if (!stood) return;
    const blob = new Blob([JSON.stringify(stood.template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${stood.being.toLowerCase()}-template.json`;
    link.click();
  }

  return (
    <div className="container narrow">
      <p className="kicker">For the next operator</p>
      <h1>Stand up the same being.</h1>
      <p className="lede">
        The being takes their surname. They get the call screen, the book, the notes, the urgent ping, and the body double. Their contacts and logins are not copied from Daniel.
      </p>
      <p className="price">{PRICE_LABEL}</p>
      <p>
        <a href={CALENDLY_URL}>Book the free 30 to start</a>
      </p>
      <form className="stack" onSubmit={onSubmit}>
        <label>
          Surname
          <input value={surname} onChange={(event) => setSurname(event.target.value)} placeholder="Nguyen" />
        </label>
        <label>
          Operator
          <input value={operator} onChange={(event) => setOperator(event.target.value)} placeholder="Their name" />
        </label>
        <label>
          Shop
          <input value={shop} onChange={(event) => setShop(event.target.value)} placeholder="Optional" />
        </label>
        <label>
          Place
          <input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="Optional" />
        </label>
        <button className="button" type="submit">
          Build the recipe
        </button>
      </form>
      {error ? <p className="card">{error}</p> : null}
      {stood ? (
        <article className="card">
          <p className="kicker">Recipe, not a clone</p>
          <h2>{stood.being}</h2>
          <p>{stood.template.disclosure}</p>
          <p>{stood.template.forward}</p>
          <p className="muted">
            {stood.template.skills.length} skills · {stood.template.plugins.length} plugins · credentials {stood.template.credentials}
          </p>
          <button className="button" type="button" onClick={download}>
            Download the template
          </button>
        </article>
      ) : null}
    </div>
  );
}
