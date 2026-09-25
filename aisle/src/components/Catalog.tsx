import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PUBLISH_LABEL } from "../../shared/offers";
import { merchantsOf, money, toBrief, toCsv, type ShelfResult, type Verdict } from "../../shared/match";
import { parseSpec } from "../../shared/spec";
import { SHELF_NOTE } from "../../shared/brand";

const SWATCH: Record<string, string> = {
  brown: "#6b3e2a",
  navy: "#1d2b4a",
  camel: "#c6a36a",
  rust: "#a24b2d",
  gray: "#8d8a84",
  charcoal: "#3c3c3c",
  cream: "#efe6d4",
  black: "#1b1b1b",
  olive: "#5d6842",
  burgundy: "#6e2434",
  red: "#8e2f2f",
  white: "#f4f1ea",
  tan: "#c3a57a",
};

function download(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Swatch({ verdict }: { verdict: Verdict }) {
  const parsed = parseSpec(`${verdict.listing.title}. ${verdict.listing.detail}`, "listing");
  const metal = verdict.listing.aisle === "industrial" || parsed.product === "tube" || parsed.product === "pipe";
  const color = parsed.colors[0];
  const style = metal
    ? { background: "linear-gradient(145deg, #f7f7f5 0%, #b7c0c8 42%, #eceff2 70%, #8e98a1 100%)" }
    : { background: SWATCH[color ?? ""] ?? "#d9d0c2" };
  return <div className="swatch" style={style} aria-hidden="true" />;
}

function Card({ verdict }: { verdict: Verdict }) {
  const reason = verdict.reasons[0];
  return (
    <article className="card">
      <Swatch verdict={verdict} />
      <p className="merchant">{verdict.listing.merchant}</p>
      <h3>{verdict.listing.title}</h3>
      <p className="price">{money(verdict.listing.priceCents)}</p>
      <p className={verdict.status === "match" ? "why ok" : "why"}>{verdict.status === "match" ? "Clears the spec" : reason}</p>
      <a href={verdict.listing.href} target="_blank" rel="noopener noreferrer">
        Open shop
      </a>
    </article>
  );
}

export default function Catalog({
  result,
  sheetName,
  allowSheet,
}: {
  result: ShelfResult;
  sheetName: string;
  allowSheet: boolean;
}) {
  const merchants = useMemo(() => merchantsOf(result.matches), [result.matches]);
  const [merchant, setMerchant] = useState("all");
  const shown = merchant === "all" ? result.matches : result.matches.filter((item) => item.listing.merchant === merchant);
  const groups = merchants
    .filter((name) => merchant === "all" || name === merchant)
    .map((name) => ({ name, items: shown.filter((item) => item.listing.merchant === name) }));
  const low = result.matches[0] ? money(result.matches[0].listing.priceCents) : "";
  const high = result.matches.length ? money(result.matches[result.matches.length - 1].listing.priceCents) : "";

  return (
    <div className="catalog">
      <p className="tally">
        {result.matches.length} {result.matches.length === 1 ? "listing" : "listings"} across {merchants.length}{" "}
        {merchants.length === 1 ? "shop" : "shops"}
        {low ? ` · ${low} to ${high}` : ""}
      </p>
      <div className="merchant-row" role="toolbar" aria-label="Shops">
        <button type="button" aria-pressed={merchant === "all"} className={merchant === "all" ? "on" : ""} onClick={() => setMerchant("all")}>
          All shops
        </button>
        {merchants.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={merchant === name}
            className={merchant === name ? "on" : ""}
            onClick={() => setMerchant(name)}
          >
            {name}
          </button>
        ))}
      </div>
      {groups.length ? (
        <div className="shop-row">
          {groups.map((group) => (
            <section key={group.name} className="shop-col" aria-label={group.name}>
              <h2>{group.name}</h2>
              {group.items.map((item) => (
                <Card key={item.listing.id} verdict={item} />
              ))}
            </section>
          ))}
        </div>
      ) : (
        <p className="empty">Nothing on the shelf clears that spec.</p>
      )}
      <section className="near">
        <h2>Near misses</h2>
        <p className="note">One part of the spec failed. The reason is the part Google Shopping tends to ignore.</p>
        {result.near.length ? (
          <ul>
            {result.near.map((item) => (
              <li key={item.listing.id}>
                <span className="merchant">{item.listing.merchant}</span>
                <span>{item.listing.title}</span>
                <span className="why">{item.reasons.join("; ")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="note">No near misses on this shelf.</p>
        )}
        <p className="note">{result.dropped.length} more stayed off the shelf because more than one part of the spec failed.</p>
      </section>
      <div className="sheet">
        {allowSheet ? (
          <>
            <button type="button" className="btn" onClick={() => download(`${slugFile(sheetName)}.csv`, toCsv(result), "text/csv")}>
              Download shelf sheet
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => download(`${slugFile(sheetName)}.md`, toBrief(sheetName, result), "text/markdown")}
            >
              Download brief
            </button>
          </>
        ) : (
          <Link className="btn" to={publishHref(sheetName, result.spec.raw)}>
            Publish for {PUBLISH_LABEL} to download the sheet
          </Link>
        )}
      </div>
      <p className="note">{SHELF_NOTE}</p>
    </div>
  );
}

function slugFile(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "aisle";
}

export function publishHref(name: string, query: string): string {
  return `/publish?name=${encodeURIComponent(name)}&q=${encodeURIComponent(query)}`;
}

export function doorHref(name: string, query: string): string {
  return `/door?name=${encodeURIComponent(name)}&q=${encodeURIComponent(query)}`;
}
