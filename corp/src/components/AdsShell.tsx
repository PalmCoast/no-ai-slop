import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Seo from "./Seo";
import { ADS_FOOTER_NOTE } from "../../shared/ads";
import "../pages/ads.css";

function useAdsDocument() {
  useEffect(() => {
    document.documentElement.classList.add("ads-route");
    const fontLinks = [...document.head.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]')];
    for (const link of fontLinks) link.remove();
    return () => {
      document.documentElement.classList.remove("ads-route");
      for (const link of fontLinks) document.head.appendChild(link);
    };
  }, []);
}

export default function AdsShell({
  children,
  pricing = false,
  skipTo = "#route-ads",
}: {
  children: ReactNode;
  pricing?: boolean;
  skipTo?: string;
}) {
  useAdsDocument();
  return (
    <div className="ads-page">
      <Seo />
      <a className="ads-skip" href={skipTo}>
        Skip to content
      </a>
      <header className="ads-top">
        <div className="ads-wrap">
          <Link className="ads-brand" to="/ads">
            <img src="/ads/favicon.svg" alt="" width={28} height={28} />
            AgentHive Inc
          </Link>
          {pricing ? (
            <a className="ads-navcta" href="#pricing">
              Pricing
            </a>
          ) : null}
        </div>
      </header>
      {children}
      <footer className="ads-foot">
        <div className="ads-wrap">
          <p>{ADS_FOOTER_NOTE}</p>
          <p>© 2026 AgentHive Inc</p>
        </div>
      </footer>
    </div>
  );
}
