import { Link } from "react-router-dom";
import { FD_AUDIT_URL, FD_PACK_URL } from "../../shared/brand";

/** Current First Deploy path with live checkout links: $150 audit, $1,250 pack ($625 deposit), $2,000/mo Concierge. */
export default function FdPath() {
  return (
    <>
      First Deploy AI path: a{" "}
      <a href={FD_AUDIT_URL} rel="noopener">
        $150 burn-audit hour
      </a>
      , then the{" "}
      <a href={FD_PACK_URL} rel="noopener">
        $1,250 operator pack ($625 deposit)
      </a>
      , then <Link to="/concierge">Concierge at $2,000/mo</Link>.
    </>
  );
}
