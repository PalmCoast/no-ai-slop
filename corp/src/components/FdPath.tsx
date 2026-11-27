import { Link } from "react-router-dom";
import { FD_CONSULT_URL, HIVE_CONSULT_PATH, triageLinkProps } from "../../shared/brand";

/**
 * Current path (B2B reset 2026-11-24): free 30-minute Architecture & Spend Triage, $2,500 sprint, $3,500/mo retainer.
 * `sprint` adds a cross-link to the First Deploy sprint page at the end.
 */
export default function FdPath({ deployAgent = false, from = "fd-path" }: { deployAgent?: boolean; from?: string }) {
  return (
    <>
      Start with a <a {...triageLinkProps(from)}>free 30-minute Architecture & Spend Triage</a>, then the{" "}
      <a href={HIVE_CONSULT_PATH}>
        $2,500 Agent Audit &amp; Stabilization Sprint
      </a>{" "}
      (5 business days), then the <Link to="/concierge">$3,500/mo Fractional AI Ops retainer</Link>
      {deployAgent ? (
        <>
          . Building a B2B AI product? See the <a href={FD_CONSULT_URL}>$2,500 sprint</a>
        </>
      ) : null}
      .
    </>
  );
}
