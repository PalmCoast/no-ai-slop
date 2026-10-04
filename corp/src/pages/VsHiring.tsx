import { Link } from "react-router-dom";
import AuthorCard from "../components/AuthorCard";
import FaqList from "../components/FaqList";
import { CONCIERGE_NAME, CONCIERGE_PATH, CONCIERGE_PRICE } from "../../shared/concierge";
import {
  BLS_CHECKED,
  CONCIERGE_TWELVE_MONTHS,
  HIRING_FAQS,
  IT_MANAGER_SOURCE,
  IT_MANAGER_WAGE,
  SOFTWARE_DEVELOPER_SOURCE,
  SOFTWARE_DEVELOPER_WAGE,
} from "../../shared/faqs";
import { CONSULT_RATES, HIVE_CONSULT_PATH } from "../../shared/brand";

const developer = SOFTWARE_DEVELOPER_WAGE.toLocaleString("en-US");
const manager = IT_MANAGER_WAGE.toLocaleString("en-US");
const year = CONCIERGE_TWELVE_MONTHS.toLocaleString("en-US");

export default function VsHiring() {
  return (
    <section className="section">
      <div className="container">
        <div className="eyebrow">
          <span className="dot" /> {CONCIERGE_NAME} · compared with a hire
        </div>
        <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
          Concierge vs hiring an in-house AI person
        </h1>
        <p className="lede">
          {CONCIERGE_NAME} is {CONCIERGE_PRICE}. Twelve months at that published rate is ${year}. An in-house hire is a
          different purchase: a person on payroll. This page uses our prices and Bureau of Labor Statistics wage
          medians. It does not quote an agency fee.
        </p>
        <p className="muted">
          Checked {BLS_CHECKED}. BLS does not publish a wage for a job titled “AI consultant.” The two medians below are
          the closest occupations on the pages we read. They are wages, not benefits, tools, or recruiting.
        </p>

        <div className="table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th> </th>
                <th>{CONCIERGE_NAME}</th>
                <th>In-house software developer</th>
                <th>In-house IT manager</th>
                <th>Large agency</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Published number</th>
                <td>
                  {CONCIERGE_PRICE}. ${year} if it runs twelve months.
                </td>
                <td>${developer} median annual wage, May 2025.</td>
                <td>${manager} median annual wage, May 2025.</td>
                <td>No price on this page.</td>
              </tr>
              <tr>
                <th>What the number is</th>
                <td>Our retainer, month to month.</td>
                <td>BLS wage only. Not a fully loaded cost.</td>
                <td>BLS wage only. Not a fully loaded cost.</td>
                <td>We did not copy a number from an agency site.</td>
              </tr>
              <tr>
                <th>What you get</th>
                <td>Two 45-minute sessions a month, unlimited async Slack or text, and a shared asset inventory.</td>
                <td>BLS describes software developers as people who design computer applications or programs.</td>
                <td>BLS describes these managers as people who plan, coordinate, and direct computer-related activities.</td>
                <td>A bench of specialists, when that is what you hire.</td>
              </tr>
              <tr>
                <th>When it is the better fit</th>
                <td>You want that scope and you do not need a full-time employee.</td>
                <td>You need someone on payroll writing software every day.</td>
                <td>You need someone directing an IT group, not two sessions a month.</td>
                <td>You need several specialists at once and a statement of work.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Our prices</h2>
        <p>
          Hourly consult stays open if a retainer is more than you need: {CONSULT_RATES}. A 10-hour pack is $1,250, with
          $625 up front. Those prices are on <Link to={HIVE_CONSULT_PATH}>the consult page</Link>, in the section “What
          an AI consultant costs.”
        </p>
        <p>
          {CONCIERGE_NAME} is {CONCIERGE_PRICE} for two 45-minute sessions a month, unlimited async Slack or text, and a
          shared inventory of the assets we build. Cancel any month after the first 30 days. The offer is{" "}
          <Link to={CONCIERGE_PATH}>on the Concierge page</Link>.
        </p>

        <h2>The hire</h2>
        <p>
          The Bureau of Labor Statistics says the median annual wage for software developers was ${developer} in May
          2025. Divide that annual figure by 12 and the wage is $
          {(SOFTWARE_DEVELOPER_WAGE / 12).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
          a month, before benefits. Source:{" "}
          <a href={SOFTWARE_DEVELOPER_SOURCE}>{SOFTWARE_DEVELOPER_SOURCE}</a>, checked {BLS_CHECKED}.
        </p>
        <p>
          The same bureau says the median annual wage for computer and information systems managers was ${manager} in
          May 2025, which is $
          {(IT_MANAGER_WAGE / 12).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} a month
          in wages alone. Source: <a href={IT_MANAGER_SOURCE}>{IT_MANAGER_SOURCE}</a>, checked {BLS_CHECKED}.
        </p>
        <p>
          An “AI person” is not a line in those tables. A shop might be hiring a developer, a manager, or a job BLS
          names differently. Use the median that matches the role you would actually post. This page does not add a
          benefits multiplier, because we are not citing one.
        </p>

        <h2>Where the other options win</h2>
        <p>
          Hire in-house when the work is a job: someone in the business every day, owning the systems. {CONCIERGE_NAME}{" "}
          does not staff your team. A large agency is the better fit when one founder on two calls a month is too small
          and you need a bench under a statement of work. We are not naming an agency weakness or a price we did not
          read.
        </p>
        <p>
          {CONCIERGE_NAME} is the better fit when the published scope is the thing you want: audit the messy task,
          optimize the process, then automate it, with an operator on the calls. If you only need a few hours, use{" "}
          <Link to={HIVE_CONSULT_PATH}>consult</Link> instead of either a retainer or a hire.
        </p>

        <h2>Sources</h2>
        <ul className="takeaways">
          <li>
            Software developers, median annual wage ${developer}, May 2025.{" "}
            <a href={SOFTWARE_DEVELOPER_SOURCE}>{SOFTWARE_DEVELOPER_SOURCE}</a>. Checked {BLS_CHECKED}.
          </li>
          <li>
            Computer and information systems managers, median annual wage ${manager}, May 2025.{" "}
            <a href={IT_MANAGER_SOURCE}>{IT_MANAGER_SOURCE}</a>. Checked {BLS_CHECKED}.
          </li>
          <li>
            {CONCIERGE_NAME} {CONCIERGE_PRICE}, and consult {CONSULT_RATES} plus the $1,250 pack, are the prices published
            on agenthiveinc.com.
          </li>
        </ul>

        <h2>Questions</h2>
        <FaqList items={HIRING_FAQS} />

        <div style={{ marginTop: "1.5rem" }}>
          <AuthorCard linked />
        </div>
      </div>
    </section>
  );
}
