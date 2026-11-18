import { Link } from "react-router-dom";
import { FD_AUDIT_URL, FD_DEPLOY_AGENT_URL, FD_PACK_URL } from "../../shared/brand";

/**
 * Current First Deploy path with live checkout links: $150 audit, $1,250 pack ($625 deposit), $2,000/mo Concierge.
 * `deployAgent` adds the Deploy Agent go-live sprint link after the pack (homepage, AI visibility packet 2026-11-17).
 */
export default function FdPath({ deployAgent = false }: { deployAgent?: boolean }) {
  return (
    <>
      First Deploy AI path: a{" "}
      <a
        href={FD_AUDIT_URL}
        rel="noopener"
        data-product="audit150"
        data-utm-source="dir"
        data-utm-medium="page"
        data-utm-content="ah-fdpath-audit"
      >
        $150 burn-audit hour
      </a>
      , then the{" "}
      <a
        href={FD_PACK_URL}
        rel="noopener"
        data-product="pack1250"
        data-utm-source="dir"
        data-utm-medium="page"
        data-utm-content="ah-fdpath-pack"
      >
        $1,250 operator pack ($625 deposit)
      </a>
      ,{" "}
      {deployAgent ? (
        <>
          the <a href={FD_DEPLOY_AGENT_URL}>Deploy Agent go-live sprint</a>,{" "}
        </>
      ) : null}
      then <Link to="/concierge">Concierge at $2,000/mo</Link>.
    </>
  );
}
