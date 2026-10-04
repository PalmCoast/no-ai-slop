import { Link } from "react-router-dom";
import { COMPARE_FAQS, LICENSING_CHECKED, MICROSOFT_CAL_URL } from "../../shared/licensing";
import { WINDOWS_SERVER_STANDARD_USD, WINDOWS_USER_CAL_USD } from "../../shared/microsoft";

export default function Compare() {
  return (
    <section className="section">
      <div className="container narrow">
        <h1 className="display">Skip the CALs. Keep the domain join.</h1>
        <p className="lede">
          A 12-person shop used to buy Windows Small Business Server. That product is gone. Essentials is gone. What is
          left is Windows Server Standard at about ${WINDOWS_SERVER_STANDARD_USD.toLocaleString()} plus about $
          {WINDOWS_USER_CAL_USD} per person in User CALs, and you still buy a box, a switch, and a UPS.
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
          Microsoft licensing page, checked {LICENSING_CHECKED}: <a href={MICROSOFT_CAL_URL}>{MICROSOFT_CAL_URL}</a>.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          Street prices, not a Microsoft quote. Software Assurance, core packs, and Remote Desktop CALs are extra on the
          Windows side. The ${WINDOWS_SERVER_STANDARD_USD.toLocaleString()} and ${WINDOWS_USER_CAL_USD} figures above are
          those street estimates.
        </p>
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
