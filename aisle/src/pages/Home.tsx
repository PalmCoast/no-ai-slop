import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HERO_H1, HERO_WHAT, PUBLISH_PRICE } from "../../shared/brand";
import { filterQuery, merchantsOf, money } from "../../shared/match";
import { specChips } from "../../shared/spec";
import { SHOPS } from "../../shared/shops";

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("4 inch aluminum tube with a flange");
  const preview = useMemo(() => (query.trim().length >= 3 ? filterQuery(query) : null), [query]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const clean = query.trim();
    if (clean.length < 3) return;
    navigate(`/build?q=${encodeURIComponent(clean)}`);
  }

  return (
    <div className="container page">
      <p className="kicker">Catalog, not a chat</p>
      <h1>{HERO_H1}</h1>
      <p className="lede">{HERO_WHAT}</p>
      <form className="spec-form" onSubmit={submit}>
        <label htmlFor="spec">The spec</label>
        <div className="spec-row">
          <input
            id="spec"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="brown wool sweater"
            autoComplete="off"
          />
          <button className="btn" type="submit">
            Build the aisle
          </button>
        </div>
      </form>
      {preview ? (
        <p className="chips" aria-label="What the spec means">
          {specChips(preview.spec).map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
          <span className="quiet">
            {preview.matches.length} clear it
            {preview.matches.length ? ` · ${money(preview.matches[0].listing.priceCents)} to ${money(preview.matches[preview.matches.length - 1].listing.priceCents)}` : ""}
            {` · ${merchantsOf(preview.matches).length} shops`}
          </span>
        </p>
      ) : null}
      <div className="doors">
        {SHOPS.map((shop) => {
          const result = filterQuery(shop.query);
          return (
            <Link key={shop.slug} to={`/shop/${shop.slug}`} className={`door theme-${shop.theme}`}>
              <p className="kicker">{shop.kicker}</p>
              <h2>{shop.name}</h2>
              <p>{shop.line}</p>
              <p className="quiet">
                {result.matches.length} on the shelf · {merchantsOf(result.matches).join(", ")}
              </p>
            </Link>
          );
        })}
      </div>
      <section className="sell">
        <h2>Publish yours for {PUBLISH_PRICE}</h2>
        <p>
          Brown Wool and Flange Tube are two aisles standing on their own. Yours is the next one. {PUBLISH_PRICE} puts your name on the door and hands you the shelf sheet: every match, every near miss, and why.
        </p>
        <Link className="btn" to="/publish">
          Publish an aisle
        </Link>
      </section>
    </div>
  );
}
