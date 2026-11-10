import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { BRAND_NAME, COMPANY, COMPANY_URL, PARENT_NAME, PARENT_URL, PLACE } from "../../shared/brand.ts";
import { BuyLink } from "./BuyLink.tsx";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="top">
        <Link className="brand" to="/">
          <img src="/mark.jpg" alt="" width={36} height={36} />
          <span>{BRAND_NAME}</span>
        </Link>
        <nav>
          <NavLink to="/book">Book</NavLink>
          <NavLink to="/packet">Packet</NavLink>
          <NavLink to="/method">Method</NavLink>
        </nav>
        <BuyLink className="buy buy-small">Buy the packet, $750</BuyLink>
      </header>
      <main id="main">{children}</main>
      <footer className="foot">
        <p>
          {BRAND_NAME} is a {PARENT_NAME} product from{" "}
          <a href={COMPANY_URL}>{COMPANY}</a>, {PLACE}. The ledger stays in this browser.{" "}
          <a href={PARENT_URL}>{PARENT_NAME}</a> is the desk if you want the cuts made.
        </p>
      </footer>
    </>
  );
}
