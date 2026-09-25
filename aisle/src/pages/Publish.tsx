import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { startCheckout } from "../api";
import { doorHref } from "../components/Catalog";
import { filterQuery, merchantsOf } from "../../shared/match";
import { PUBLISH_LABEL, validQuery, validShopName } from "../../shared/offers";
import { suggestShopName } from "../../shared/spec";

export default function Publish() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const seedQuery = params.get("q") ?? "brown wool sweater";
  const [query, setQuery] = useState(seedQuery);
  const [shopName, setShopName] = useState(params.get("name") ?? suggestShopName(filterQuery(seedQuery).spec));
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const result = useMemo(() => (validQuery(query) ? filterQuery(query) : null), [query]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!validShopName(shopName)) {
      setError("Give the shop a name, 2 to 48 characters.");
      return;
    }
    if (!validQuery(query)) {
      setError("The spec needs to be at least 3 characters.");
      return;
    }
    setPending(true);
    try {
      const data = await startCheckout(shopName.trim(), query.trim(), email.trim());
      if (data.url) {
        if (data.demo || data.url.startsWith("/")) navigate(data.url.replace(/^https?:\/\/[^/]+/, ""));
        else window.location.assign(data.url);
        return;
      }
      setError("Checkout did not return a URL.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="container page narrow">
      <p className="kicker">{PUBLISH_LABEL} once</p>
      <h1>Publish this aisle</h1>
      <p className="lede">
        The catalog is free to read. {PUBLISH_LABEL} puts your name on a door you can send, plus the shelf sheet and a one-page brief.
      </p>
      <form className="stack" onSubmit={submit}>
        <label htmlFor="shop-name">Shop name</label>
        <input id="shop-name" value={shopName} onChange={(event) => setShopName(event.target.value)} maxLength={48} />
        <label htmlFor="pub-spec">Spec</label>
        <input id="pub-spec" value={query} onChange={(event) => setQuery(event.target.value)} />
        <label htmlFor="email">Receipt email, optional</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        {result ? (
          <p className="note">
            {result.matches.length} listings clear it across {merchantsOf(result.matches).length} shops.{" "}
            <Link to={doorHref(shopName.trim() || "Aisle", query.trim())}>Preview the door</Link>
          </p>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Opening checkout" : `Pay ${PUBLISH_LABEL}`}
        </button>
      </form>
    </div>
  );
}
