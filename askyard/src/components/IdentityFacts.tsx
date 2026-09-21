import {
  BRAND_COMPANY,
  BRAND_NAME,
  BRAND_PARENT,
  BRAND_PLACE,
  CONSULT_DISPLAY_SEO,
  FD_PRICE_LONG,
  PARENT_URL,
} from "../../shared/brand";

export default function IdentityFacts() {
  return (
    <p className="fine identity-facts">
      {BRAND_NAME} is the free Q&A front door from {BRAND_PARENT}. It is not the paid after-hours desk. Built by{" "}
      {BRAND_COMPANY} in {BRAND_PLACE}. Paid desk: <a href={PARENT_URL}>{BRAND_PARENT}</a> — firstdeploy.ai —{" "}
      {FD_PRICE_LONG}. Phone {CONSULT_DISPLAY_SEO}.
    </p>
  );
}
