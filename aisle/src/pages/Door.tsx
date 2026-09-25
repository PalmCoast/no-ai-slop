import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Catalog, { publishHref } from "../components/Catalog";
import { filterQuery } from "../../shared/match";
import { PUBLISH_LABEL } from "../../shared/offers";
import { specChips } from "../../shared/spec";
import { claimFor } from "../storage";

export default function Door() {
  const [params] = useSearchParams();
  const name = (params.get("name") ?? "").trim();
  const query = (params.get("q") ?? "").trim();
  const result = useMemo(() => (query.length >= 3 ? filterQuery(query) : null), [query]);
  const claimed = name && query ? claimFor(query, name) : null;

  if (!result || !name) {
    return (
      <div className="container page">
        <h1>Name the aisle first</h1>
        <p className="lede">
          <Link to="/">Start with a spec</Link>, then publish it.
        </p>
      </div>
    );
  }

  return (
    <div className="container page">
      <p className="kicker">Shop door</p>
      <h1>{name}</h1>
      <p className="lede">{query}</p>
      <p className="chips" aria-label="Parsed spec">
        {specChips(result.spec).map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </p>
      {claimed ? <p className="claimed">{claimed.demo ? "Demo claim on this browser." : "Published."} The shelf sheet is unlocked.</p> : null}
      <Catalog result={result} sheetName={name} allowSheet={Boolean(claimed)} />
      {claimed ? null : (
        <p className="note">
          <Link to={publishHref(name, query)}>Publish {name} for {PUBLISH_LABEL}</Link> to unlock the sheet and the brief.
        </p>
      )}
    </div>
  );
}
