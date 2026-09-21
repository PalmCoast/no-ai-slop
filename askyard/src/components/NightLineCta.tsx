import { BRAND_PARENT, FD_PRICE_LONG, PARENT_URL } from "../../shared/brand";

export default function NightLineCta() {
  return (
    <p className="night-line-cta">
      Need the night line installed? <a href={PARENT_URL}>{BRAND_PARENT}</a> — firstdeploy.ai — {FD_PRICE_LONG}.
    </p>
  );
}
