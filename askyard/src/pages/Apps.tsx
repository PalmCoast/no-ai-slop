import { useMemo, useState } from "react";
import { SALE_APPS, type AppCategory } from "../../shared/catalog";
import { BRAND_PARENT, FD_PRICE, FD_PROMISE } from "../../shared/brand";

const FILTERS: Array<"all" | AppCategory> = ["all", "ops", "field", "saas", "infra", "studio"];

export default function Apps() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const visible = useMemo(
    () => SALE_APPS.filter((app) => filter === "all" || app.category === filter),
    [filter],
  );

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Shelf</div>
          <h1 className="display">Apps for sale</h1>
          <p className="lede">
            {BRAND_PARENT} is the cash product: {FD_PRICE}. {FD_PROMISE}. Everything else is a smaller, priced tool you
            can buy the same day.
          </p>
        </div>
        <div className="filters">
          {FILTERS.map((key) => (
            <button key={key} className={`filter${filter === key ? " on" : ""}`} onClick={() => setFilter(key)}>
              {key}
            </button>
          ))}
        </div>
        <div className="card-grid">
          {visible.map((app) => (
            <a key={app.slug} className="card" href={app.url} rel="noreferrer" target="_blank">
              <p className="eyebrow">{app.who}</p>
              <h3>{app.name}</h3>
              <p className="muted">{app.blurb}</p>
              <p className="price">{app.price}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
