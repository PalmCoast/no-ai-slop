import { Link } from "react-router-dom";
import { DANIEL_BIO, DANIEL_JOB_TITLE, DANIEL_NAME } from "../../shared/author";
import { CALENDLY_URL, CONSULT_DISPLAY, CONSULT_TEL, CONTACT_EMAIL, FD_NAME, FD_URL, FLICK_URL, INDEXME_URL, JOBPROOF_URL } from "../../shared/brand";

const PRODUCTS = [
  { href: FD_URL, label: FD_NAME },
  { href: "https://netyard.firstdeploy.ai/", label: "NetYard" },
  { href: INDEXME_URL, label: "IndexMe" },
  { href: FLICK_URL, label: "Flick" },
  { href: JOBPROOF_URL, label: "JobProof" },
];

export default function AuthorCard({ linked = false }: { linked?: boolean }) {
  return (
    <article className="panel" id="daniel-graham">
      <p className="eyebrow">Founder</p>
      <h2>{DANIEL_NAME}</h2>
      <p className="role">{DANIEL_JOB_TITLE}</p>
      <p style={{ marginTop: 12 }}>{DANIEL_BIO}</p>
      <p className="muted" style={{ marginTop: 12 }}>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        {" · "}
        <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
        {" · "}
        <a href={CALENDLY_URL} rel="noreferrer" target="_blank">
          Book 30 minutes
        </a>
      </p>
      <p style={{ marginTop: 12 }}>Live products:</p>
      <ul className="takeaways">
        {PRODUCTS.map((product) => (
          <li key={product.href}>
            <a href={product.href}>{product.label}</a>
          </li>
        ))}
      </ul>
      {linked ? (
        <p style={{ marginTop: 12 }}>
          <Link to="/about">About Daniel Graham</Link>
        </p>
      ) : null}
    </article>
  );
}
