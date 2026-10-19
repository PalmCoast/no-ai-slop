import { Link, useLocation } from "react-router-dom";
import { CALENDLY_URL, CONSULT_DISPLAY, CONSULT_TEL } from "../../shared/brand";
import { COMPARE_PAGES, comparePageFor } from "../../shared/comparePages";
import NotFound from "./NotFound";

export default function ComparePage() {
  const { pathname } = useLocation();
  const page = comparePageFor(pathname.replace(/\/$/, ""));
  if (!page) return <NotFound />;
  const others = COMPARE_PAGES.filter((p) => p.path !== page.path);
  return (
    <section className="section">
      <div className="container narrow">
        <h1 className="display">{page.h1}</h1>
        <p className="lede">{page.lede}</p>

        {page.sections.map((section) => (
          <div key={section.h2} style={{ marginTop: "2rem" }}>
            <h2>{section.h2}</h2>
            {section.paras?.map((para) => <p key={para}>{para}</p>)}
            {section.bullets ? (
              <ul className="takeaways">
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
            {section.table ? (
              <div style={{ overflowX: "auto" }}>
                <table className="compare-table">
                  <thead>
                    <tr>
                      {section.table.head.map((h, i) => (
                        <th key={`${h}-${i}`} scope="col">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row) => (
                      <tr key={row.join("|")}>
                        {row.map((cell, i) => (i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {section.table.note ? <p className="fine">{section.table.note}</p> : null}
              </div>
            ) : null}
          </div>
        ))}

        <div className="card-grid plan-grid" style={{ marginTop: "2rem" }}>
          <article className="card">
            <h2>{page.pickThem.h2}</h2>
            <ul className="takeaways">
              {page.pickThem.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </article>
          <article className="card">
            <h2>{page.pickUs.h2}</h2>
            <ul className="takeaways">
              {page.pickUs.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="hero-actions" style={{ marginTop: "2rem" }}>
          <Link className="btn btn-primary" to="/">
            Get the free plan
          </Link>
          <a className="btn btn-outline" href={CALENDLY_URL} rel="noreferrer" target="_blank">
            Book the free 30
          </a>
          <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
            Call {CONSULT_DISPLAY}
          </a>
          <Link className="btn btn-outline" to="/buy">
            Pay on Stripe
          </Link>
        </div>

        <h2 style={{ marginTop: "2rem" }}>Questions</h2>
        <div className="faq-list">
          {page.faqs.map((faq) => (
            <article key={faq.q} className="card">
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </article>
          ))}
        </div>

        <h2 style={{ marginTop: "2rem" }}>Sources</h2>
        <p className="fine">Plain-text sources, no outbound links. Each was read on the date shown. Prices change, so check before you buy.</p>
        <ul className="takeaways">
          {page.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <h2 style={{ marginTop: "2rem" }}>More comparisons</h2>
        <ul className="takeaways">
          <li>
            <Link to="/compare">Samba AD vs Windows Server</Link>
          </li>
          {others.map((p) => (
            <li key={p.path}>
              <Link to={p.path}>{p.h1}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
