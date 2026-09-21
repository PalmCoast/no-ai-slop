import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NightLineCta from "../components/NightLineCta";
import OfferPanel from "../components/OfferPanel";
import RateAnswer from "../components/RateAnswer";
import ReputationBar from "../components/ReputationBar";
import { fetchBoard } from "../api";
import { offerFor, rankedSeed, type YardQuestion } from "../../shared/ask";
import { BRAND_COMPANY, BRAND_PLACE, CONSULT_DISPLAY_SEO, CONSULT_TEL, PARENT_URL } from "../../shared/brand";

export default function Answer() {
  const { slug } = useParams();
  const [item, setItem] = useState<YardQuestion | null>(rankedSeed().find((q) => q.slug === slug) ?? null);

  useEffect(() => {
    fetchBoard().then((data) => {
      setItem(data.questions.find((q) => q.slug === slug) ?? null);
    });
  }, [slug]);

  if (!item) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="display">That question is not on the board yet</h1>
          <p className="lede">Ask it on the home page. If other people ask it, the count will climb.</p>
          <Link className="btn btn-primary" to="/">
            Ask AskYard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <p className="eyebrow">{item.trade} · asked {item.asks.toLocaleString()} times</p>
        <OfferPanel question={item} offer={offerFor(item.offerSlug)} />
        <NightLineCta />
        <p className="fine">
          Built by {BRAND_COMPANY} in {BRAND_PLACE}. Phone{" "}
          <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY_SEO}</a>. Paid desk:{" "}
          <a href={PARENT_URL}>firstdeploy.ai</a>.
        </p>
        <RateAnswer slug={item.slug} helpful={item.helpful} missed={item.missed} />
        <p className="fine" style={{ marginTop: 18 }}>
          <Link to="/board">Back to the ranked board</Link>
          {" · "}
          <Link to={`/rep?q=${encodeURIComponent(item.question)}`}>See the meter</Link>
        </p>
      </div>
      <ReputationBar />
    </section>
  );
}
