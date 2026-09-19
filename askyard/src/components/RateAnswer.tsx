import { useEffect, useState } from "react";
import { rateAnswer } from "../api";

const VOTED_KEY = "askyard-voted";

function votedMap(): Record<string, "helpful" | "missed"> {
  try {
    return JSON.parse(localStorage.getItem(VOTED_KEY) ?? "{}") as Record<string, "helpful" | "missed">;
  } catch {
    return {};
  }
}

export default function RateAnswer({
  slug,
  helpful = 0,
  missed = 0,
}: {
  slug: string;
  helpful?: number;
  missed?: number;
}) {
  const [counts, setCounts] = useState({ helpful, missed });
  const [picked, setPicked] = useState<"helpful" | "missed" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCounts({ helpful, missed });
    setPicked(votedMap()[slug] ?? null);
  }, [slug, helpful, missed]);

  async function vote(next: "helpful" | "missed") {
    if (picked || busy) return;
    setBusy(true);
    try {
      const result = await rateAnswer(slug, next);
      setCounts(result);
      setPicked(next);
      const map = votedMap();
      map[slug] = next;
      localStorage.setItem(VOTED_KEY, JSON.stringify(map));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rate-row">
      <p className="eyebrow">Was this useful?</p>
      <p className="fine">Helpful or missed. No stars. No roast wall.</p>
      <div className="hero-actions">
        <button
          className={`btn ${picked === "helpful" ? "btn-primary" : "btn-outline"}`}
          type="button"
          disabled={busy || Boolean(picked)}
          onClick={() => void vote("helpful")}
        >
          Helpful · {counts.helpful}
        </button>
        <button
          className={`btn ${picked === "missed" ? "btn-primary" : "btn-outline"}`}
          type="button"
          disabled={busy || Boolean(picked)}
          onClick={() => void vote("missed")}
        >
          Missed · {counts.missed}
        </button>
      </div>
    </div>
  );
}
