import { Link, useLocation } from "react-router-dom";
import FaqList from "../components/FaqList";
import { BOOK_CTA_LABEL, CALENDLY_URL, CONSULT_DISPLAY, CONSULT_TEL, HIVE_CONSULT_PATH } from "../../shared/brand";
import { CONSULT_COST_PATH } from "../../shared/consult";
import { CONSULT_COMPARE_CHECKED, CONSULT_COMPARE_PAGES, consultComparePageFor } from "../../shared/consultCompare";
import NotFound from "./NotFound";

export default function ConsultComparePage() {
  const { pathname } = useLocation();
  const page = consultComparePageFor(pathname.replace(/\/$/, ""));
  if (!page) return <NotFound />;
  const others = CONSULT_COMPARE_PAGES.filter((p) => p.path !== page.path);
  return (
    <>
      <section className="section">
        <div className="container">
          <p className="fine">
            <Link to={HIVE_CONSULT_PATH}>Consult</Link> / {page.crumb}
          </p>
          <div className="eyebrow">
            <span className="dot" /> Comparison · checked {CONSULT_COMPARE_CHECKED}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}>
            {page.h1}
          </h1>
          <p className="lede">{page.lede}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {BOOK_CTA_LABEL}
            </a>
            <Link className="btn btn-outline" to={`${HIVE_CONSULT_PATH}#pricing`}>
              See our pricing
            </Link>
            <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
              Call {CONSULT_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {page.sections.map((section, i) => (
        <section key={section.h2} className={i % 2 === 0 ? "section section-alt" : "section"}>
          <div className="container">
            <div className="section-head">
              <h2>{section.h2}</h2>
            </div>
            {section.paras?.map((para) => <p key={para}>{para}</p>)}
            {section.bullets ? (
              <ul>
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
            {section.table ? (
              <>
                <div className="table-wrap">
                  <table className="cost-table">
                    <thead>
                      <tr>
                        {section.table.head.map((h, j) => (
                          <th key={`${h}-${j}`} scope="col">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join("|")}>
                          {row.map((cell, j) => (
                            <td key={j}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {section.table.note ? <p className="fine">{section.table.note}</p> : null}
              </>
            ) : null}
          </div>
        </section>
      ))}

      <section className="section">
        <div className="container">
          <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <article className="trust">
              <h3>{page.pickThem.h2}</h3>
              <ul>
                {page.pickThem.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </article>
            <article className="trust">
              <h3>{page.pickUs.h2}</h3>
              <ul>
                {page.pickUs.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Questions</h2>
          </div>
          <FaqList items={page.faqs} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Sources</h2>
            <p>Plain-text sources, no outbound links. Each was read on the date shown. Prices change, so check before you compare.</p>
          </div>
          <ul>
            {page.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <h2 style={{ marginTop: "2rem" }}>More on AI consulting costs</h2>
          <ul>
            <li>
              <Link to={CONSULT_COST_PATH}>What an AI consultant costs a small business</Link>
            </li>
            {others.map((p) => (
              <li key={p.path}>
                <Link to={p.path}>{p.crumb}</Link>
              </li>
            ))}
          </ul>
          <div className="hero-actions">
            <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {BOOK_CTA_LABEL}
            </a>
            <Link className="btn btn-outline" to={`${HIVE_CONSULT_PATH}#pricing`}>
              See our pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
