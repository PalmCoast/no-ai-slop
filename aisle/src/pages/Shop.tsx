import { useMemo } from "react";
import { useParams } from "react-router-dom";
import Catalog from "../components/Catalog";
import { filterQuery } from "../../shared/match";
import { specChips } from "../../shared/spec";
import { shopBySlug } from "../../shared/shops";
import NotFound from "./NotFound";

export default function Shop() {
  const { slug } = useParams();
  const shop = shopBySlug(slug ?? "");
  const result = useMemo(() => (shop ? filterQuery(shop.query) : null), [shop]);
  if (!shop || !result) return <NotFound />;

  return (
    <div className="container page">
      <p className="kicker">{shop.kicker}</p>
      <h1>{shop.name}</h1>
      <p className="lede">{shop.line}</p>
      <p className="chips" aria-label="Parsed spec">
        {specChips(result.spec).map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </p>
      <Catalog result={result} sheetName={shop.name} allowSheet />
    </div>
  );
}
