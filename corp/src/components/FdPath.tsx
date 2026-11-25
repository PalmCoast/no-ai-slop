import { Link } from "react-router-dom";
import { BOOK_HREF, FD_DEPLOY_AGENT_URL, SPRINT_GO_HREF } from "../../shared/brand";

/**
 * Current path (B2B reset 2026-11-24): free 30-minute Architecture & Spend Triage, $2,500 sprint, $3,500/mo retainer.
 * `deployAgent` adds the Deploy Agent go-live sprint link at the end.
 */
export default function FdPath({ deployAgent = false }: { deployAgent?: boolean }) {
  return (
    <>
      Start with a <a href={BOOK_HREF}>free 30-minute Architecture & Spend Triage</a>, then the{" "}
      <a
        href={SPRINT_GO_HREF}
        data-product="sprint2500"
        data-utm-source="dir"
        data-utm-medium="page"
        data-utm-content="ah-fdpath-sprint"
      >
        $2,500 Agent Audit &amp; Stabilization Sprint
      </a>{" "}
      (5 business days), then the <Link to="/concierge">$3,500/mo Fractional AI Ops retainer</Link>
      {deployAgent ? (
        <>
          . Building a B2B AI product? See <a href={FD_DEPLOY_AGENT_URL}>Deploy Agent</a>
        </>
      ) : null}
      .
    </>
  );
}
