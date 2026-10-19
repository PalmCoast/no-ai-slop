import { Link } from "react-router-dom";
import { COMPARE_PAGES } from "../../shared/comparePages";
import { COMPARE_FAQS, LICENSING_CHECKED } from "../../shared/licensing";
import { WINDOWS_PRICES_CHECKED, WINDOWS_SERVER_STANDARD_USD, WINDOWS_USER_CAL_USD } from "../../shared/microsoft";

export default function Compare() {
  return (
    <section className="section">
      <div className="container narrow">
        <h1 className="display">Skip the CALs. Keep the domain join.</h1>
        <p className="lede">
          A 12-person shop used to buy Windows Small Business Server. Microsoft's Windows Server 2025 licensing guide now
          lists three editions: Datacenter, Standard, and Essentials. Essentials is sold only by OEM server makers, for up
          to 25 users and 50 devices, and needs no base CAL. Standard is ${WINDOWS_SERVER_STANDARD_USD.toLocaleString()}{" "}
          (Microsoft's suggested price for 16 cores) plus ${WINDOWS_USER_CAL_USD} per person in User CALs at one
          reseller's published list price, and you still buy a box, a switch, and a UPS.
        </p>

        <div className="card-grid plan-grid">
          <article className="card">
            <h2>What Samba AD still does</h2>
            <ul className="takeaways">
              <li>Windows PCs join a realm and sign in with one password</li>
              <li>File shares with groups, home drives, and a recycle bin</li>
              <li>DNS for the shop, NTP, CUPS printers</li>
              <li>No CAL. Debian is the OS.</li>
            </ul>
          </article>
          <article className="card">
            <h2>What it will not do</h2>
            <ul className="takeaways">
              <li>It is not a full Group Policy clone</li>
              <li>It is not Exchange. Keep mail on Google Workspace or Microsoft 365</li>
              <li>It is not SQL Server or RDS</li>
              <li>Someone still has to rack the switch and test a restore</li>
            </ul>
          </article>
          <article className="card">
            <h2>When to skip the server</h2>
            <p>
              Chromebooks, iPads, and Drive-only files do not need a DC. NetYard still writes guest Wi-Fi and a shopping
              list. Pick Chromebooks in the wizard and the directory drops out.
            </p>
          </article>
        </div>

        <h2>Licensing questions</h2>
        <div className="faq-list">
          {COMPARE_FAQS.map((faq) => (
            <article key={faq.q} className="card">
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </article>
          ))}
        </div>
        <p>
          Source: Microsoft's Client Access License page, checked {LICENSING_CHECKED}.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          Prices, checked {WINDOWS_PRICES_CHECKED}: Windows Server 2025 Standard ${WINDOWS_SERVER_STANDARD_USD.toLocaleString()}{" "}
          is Microsoft's suggested MSRP for 16 core licenses (Microsoft's Windows Server 2025 pricing page). The $
          {WINDOWS_USER_CAL_USD} User CAL is a reseller price, not Microsoft's: o365hq.com's published US list price for
          one Windows Server 2025 User CAL, one-time, commercial. Microsoft's pricing page lists no CAL price. Essentials
          limits are from Microsoft's Windows Server 2025 licensing guide. These are list prices, not a quote. Software
          Assurance, extra core licenses, and Remote Desktop CALs are extra on the Windows side. The full arithmetic for 12
          people is on <Link to="/windows-server-cal-math">Windows Server CAL math</Link>.
        </p>
        <h2>More comparisons</h2>
        <ul className="takeaways">
          {COMPARE_PAGES.map((p) => (
            <li key={p.path}>
              <Link to={p.path}>{p.h1}</Link>
            </li>
          ))}
        </ul>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/buy">
            Pay on Stripe
          </Link>
          <Link className="btn btn-outline" to="/">
            Stand up the network
          </Link>
          <Link className="btn btn-outline" to="/plan?demo=1">
            See a 12-person plan
          </Link>
        </div>
      </div>
    </section>
  );
}
