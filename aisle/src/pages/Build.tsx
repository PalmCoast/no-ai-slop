import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Catalog, { doorHref, publishHref } from "../components/Catalog";
import { filterQuery } from "../../shared/match";
import { suggestShopName, specChips } from "../../shared/spec";
import { parsePasted } from "../../shared/shelf";

export default function Build() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [pasted, setPasted] = useState("");
  const extra = useMemo(() => parsePasted(pasted), [pasted]);
  const result = useMemo(() => (query.trim().length >= 3 ? filterQuery(query, extra) : null), [query, extra]);
  const name = result ? suggestShopName(result.spec) : "New aisle";

  function submit(event: FormEvent) {
    event.preventDefault();
    const clean = query.trim();
    if (clean.length < 3) return;
    setParams({ q: clean });
  }

  return (
    <div className="container page">
      <p className="kicker">Builder</p>
      <h1>Build the aisle</h1>
      <form className="spec-form" onSubmit={submit}>
        <label htmlFor="build-spec">The spec</label>
        <div className="spec-row">
          <input id="build-spec" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="brown wool sweater" />
          <button className="btn" type="submit">
            Filter the shelf
          </button>
        </div>
      </form>
      {result ? (
        <>
          <p className="chips" aria-label="Parsed spec">
            {specChips(result.spec).map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </p>
          <p className="actions">
            <Link className="btn btn-ghost" to={doorHref(name, result.spec.raw)}>
              Open as {name}
            </Link>
            <Link to={publishHref(name, result.spec.raw)}>Publish this aisle</Link>
          </p>
          <Catalog result={result} sheetName={name} allowSheet={false} />
        </>
      ) : (
        <p className="lede">Type a spec. Size, material, color, and the feature that has to be there.</p>
      )}
      <section className="paste">
        <h2>Add a listing from another site</h2>
        <p className="note">One line per product. Merchant, description, price, link.</p>
        <textarea
          value={pasted}
          onChange={(event) => setPasted(event.target.value)}
          rows={4}
          placeholder={"McMaster | 4 inch aluminum tube with a flange | $82.00 | https://www.mcmaster.com/aluminum-tubes/"}
          aria-label="Paste listings"
        />
        {extra.length ? <p className="note">{extra.length} pasted {extra.length === 1 ? "listing is" : "listings are"} in the filter.</p> : null}
      </section>
    </div>
  );
}
