import { Link, useLocation } from "react-router-dom";
import FaqList from "../components/FaqList";
import { BOOK_CTA_LABEL, BOOK_HREF, CONSULT_DISPLAY, CONSULT_TEL, HIVE_CONSULT_PATH } from "../../shared/brand";
import { CONSULT_COST_PATH } from "../../shared/consult";
import { CONSULT_COMPARE_CHECKED, CONSULT_COMPARE_PAGES, consultComparePageFor } from "../../shared/consultCompare";
import NotFound from "./NotFound";

function stripeBuyAttrs(href: string, content: string) {
  const product = href.includes("eVq9ATbaY6CT6iF7ea2ZO1g") || href.includes("/go/ads-sprint")
    ? "audit150"
    : href.includes("7sY9ATenabXd7mJ7ea2ZO1i") || href.includes("/go/deposit") || href.includes("/go/pack")
      ? "pack1250"
      : href.includes("fZufZh92Qf9p5eB2XU2ZO1h") || href.includes("/go/consult-30")
        ? "consult75"
      : href.includes("6oUeVd7YM3qH0Ylbuq2ZO1u") || href.includes("/go/concierge")
        ? "concierge2000"
        : undefined;
  return {
    ...(product ? { "data-product": product } : {}),
    "data-utm-source": "dir",
    "data-utm-medium": "page",
    "data-utm-content": content,
  };
}

function isOnSitePage(href: string) {
  return href.startsWith("/") && !href.startsWith("/go/");
}

function isTrackedCheckout(href: string) {
  return href.includes("buy.stripe.com") || href.startsWith("/go/") || href.includes("/go/");
}


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
            <span className="dot" /> Consult · checked {page.checked ?? CONSULT_COMPARE_CHECKED}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}>
            {page.h1}
          </h1>
          <p className="lede">{page.lede}</p>
          <div className="hero-actions">
            {page.actions ? (
              page.actions.map((action, i) =>
                isOnSitePage(action.href) ? (
                  <Link key={action.href} className={i === 0 ? "btn btn-primary" : "btn btn-outline"} to={action.href}>
                    {action.label}
                  </Link>
                ) : (
                  <a
                    key={action.href}
                    className={i === 0 ? "btn btn-primary" : "btn btn-outline"}
                    href={action.href}
                    rel="noopener"
                    {...(isTrackedCheckout(action.href)
                      ? stripeBuyAttrs(action.href, "ah-consult-compare")
                      : {})}
                  >
                    {action.label}
                  </a>
                ),
              )
            ) : (
              <>
                <a className="btn btn-primary" href={BOOK_HREF}>
                  {BOOK_CTA_LABEL}
                </a>
                <Link className="btn btn-outline" to={`${HIVE_CONSULT_PATH}#pricing`}>
                  See our pricing
                </Link>
                <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
                  Call {CONSULT_DISPLAY}
                </a>
              </>
            )}
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
          <div className="card-grid cols-2">
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
            <p>These prices are the ones published on our consult page.</p>
          </div>
          <ul>
            {page.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <h2 style={{ marginTop: "2rem" }}>More on AI consulting costs</h2>
          <ul>
            <li>
              <Link to={CONSULT_COST_PATH}>What an AI consultant costs a growing company</Link>
            </li>
            {others.map((p) => (
              <li key={p.path}>
                <Link to={p.path}>{p.crumb}</Link>
              </li>
            ))}
          </ul>
          <div className="hero-actions">
            <a className="btn btn-primary" href={BOOK_HREF}>
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
