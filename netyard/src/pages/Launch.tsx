import { Link } from "react-router-dom";
import { BRAND_PARENT, FD_PRICE, FD_PROMISE } from "../../shared/brand";

const SHOTS = [
  { src: "/launch/wizard-home.webp", alt: "NetYard wizard home: stand up a shop network without Microsoft Server" },
  { src: "/launch/wizard-needs.webp", alt: "Need cards with Guest Wi-Fi marked On" },
  { src: "/launch/plan-overview.webp", alt: "Harbor HVAC plan overview with Samba AD and CAL savings" },
  { src: "/launch/vlans.webp", alt: "Addressing table with Staff, Servers, Guest, IoT, and Mgmt VLANs" },
  { src: "/launch/scripts.webp", alt: "Generated install-office-server.sh and config files" },
  { src: "/launch/tools.webp", alt: "Subnet calculator and VLAN cheat sheet" },
  { src: "/launch/compare.webp", alt: "Samba versus Windows Server CAL comparison" },
];

export default function Launch() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="display">NetYard is live. Watch the standup.</h1>
        <p className="lede">
          Six questions. A VLAN plan. Samba on Debian. Pay the rack on Stripe. {BRAND_PARENT} is {FD_PRICE}. {FD_PROMISE}.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/">
            Run the wizard
          </Link>
          <Link className="btn btn-outline" to="/buy">
            Pay on Stripe
          </Link>
        </div>

        <figure className="launch-video">
          <video src="/launch/standup.mp4" controls playsInline poster="/launch/plan-overview.webp" />
          <figcaption className="fine">Harbor HVAC through the wizard, Guest VLAN 30, install scripts, then Stripe buy.</figcaption>
        </figure>

        <div className="shot-grid">
          {SHOTS.map((shot) => (
            <figure key={shot.src} className="shot">
              <img src={shot.src} alt={shot.alt} />
              <figcaption className="fine">{shot.alt}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
