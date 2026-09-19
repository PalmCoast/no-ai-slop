import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BRAND_NAME,
  BRAND_PARENT,
  BRAND_PLACE,
  FD_PRICE,
  FD_PROMISE,
  HERO_H1,
  HERO_WHAT,
} from "../../shared/brand";
import {
  DEMO_ANSWERS,
  DESKTOP_META,
  GEAR_META,
  HEADCOUNT_META,
  NEED_META,
  SITE_META,
  clampPeople,
  defaultAnswers,
  validateAnswers,
  withBusinessName,
} from "../../shared/questions";
import { generatePlan } from "../../shared/planner";
import { DESKTOP_MIXES, GEAR_TIERS, HEADCOUNT_BANDS, NEEDS, SITE_SHAPES, type Answers, type Need } from "../../shared/types";
import { saveAnswers } from "../storage";

const STEPS = [
  { key: "shop", title: "Who is the shop?" },
  { key: "people", title: "How many people?" },
  { key: "needs", title: "What does the network have to do?" },
  { key: "desktops", title: "What sits on the desks?" },
  { key: "sites", title: "Where do people work?" },
  { key: "gear", title: "What will you spend on gear?" },
] as const;

export default function Home() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => defaultAnswers());
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    try {
      if (answers.businessName.trim().length < 2) return null;
      return generatePlan(answers);
    } catch {
      return null;
    }
  }, [answers]);

  function next(event?: FormEvent) {
    event?.preventDefault();
    setError(null);
    if (step === 0 && answers.businessName.trim().length < 2) {
      setError("Give the shop a name.");
      return;
    }
    if (step === 2 && answers.needs.length === 0) {
      setError("Pick at least one job.");
      return;
    }
    if (step < STEPS.length - 1) {
      setStep((n) => n + 1);
      return;
    }
    const errors = validateAnswers(answers);
    if (errors.length) {
      setError(errors[0] ?? "Fix the answers.");
      return;
    }
    saveAnswers(answers);
    navigate("/plan");
  }

  function loadDemo() {
    setAnswers(DEMO_ANSWERS);
    saveAnswers(DEMO_ANSWERS);
    navigate("/plan");
  }

  return (
    <>
      <section className="hero hero-plain">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> {BRAND_NAME} · {BRAND_PLACE} · a {BRAND_PARENT} product
          </div>
          <h1 className="display">{HERO_H1}</h1>
          <p className="lede">{HERO_WHAT}</p>
          <p className="fine">
            Microsoft Small Business Server is gone. Essentials is gone. A 12-person shop still needs logins, a share,
            and guest Wi-Fi. NetYard writes the plan for Samba on Debian, then hands you the scripts.
          </p>
        </div>
      </section>

      <section className="section" id="standup">
        <div className="container wizard-layout">
          <form className="panel wizard" onSubmit={next}>
            <div className="wizard-progress" aria-hidden="true">
              {STEPS.map((item, index) => (
                <span key={item.key} className={index <= step ? "on" : ""} />
              ))}
            </div>
            <p className="fine">
              Question {step + 1} of {STEPS.length}
            </p>
            <h2>{STEPS[step]?.title}</h2>

            {step === 0 ? (
              <div className="form">
                <label htmlFor="shop-name">Shop name</label>
                <input
                  id="shop-name"
                  autoComplete="organization"
                  value={answers.businessName}
                  onChange={(e) => setAnswers(withBusinessName(answers, e.target.value))}
                  placeholder="Coastal Plumbing"
                />
                <label htmlFor="shop-domain">Internal DNS (not a public website)</label>
                <input
                  id="shop-domain"
                  value={answers.domain}
                  onChange={(e) => setAnswers({ ...answers, domain: e.target.value })}
                  placeholder="coastalplumbing.lan"
                />
                <p className="fine">Windows PCs will join this realm. We use .lan so we do not fight mDNS .local.</p>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="choice-grid">
                {HEADCOUNT_BANDS.map((band) => {
                  const meta = HEADCOUNT_META[band];
                  return (
                    <button
                      type="button"
                      key={band}
                      className={answers.headcount === band ? "choice on" : "choice"}
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          headcount: band,
                          peopleCount: meta.defaultPeople,
                        })
                      }
                    >
                      <strong>{meta.label}</strong>
                      <span>{meta.range}</span>
                    </button>
                  );
                })}
                <label htmlFor="people-count">Exact headcount if you know it</label>
                <input
                  id="people-count"
                  type="number"
                  min={HEADCOUNT_META[answers.headcount].min}
                  max={HEADCOUNT_META[answers.headcount].max}
                  value={answers.peopleCount}
                  onChange={(e) =>
                    setAnswers({ ...answers, peopleCount: clampPeople(answers.headcount, Number(e.target.value)) })
                  }
                />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="choice-grid">
                {NEEDS.map((need) => {
                  const meta = NEED_META[need];
                  const on = answers.needs.includes(need);
                  return (
                    <button
                      type="button"
                      key={need}
                      className={on ? "choice on" : "choice"}
                      aria-pressed={on}
                      onClick={() => toggleNeed(answers, setAnswers, need)}
                    >
                      <strong>
                        {meta.label}
                        {on ? <span className="on-tag">On</span> : null}
                      </strong>
                      <span>{meta.hint}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="choice-grid">
                {DESKTOP_MIXES.map((mix) => (
                  <button
                    type="button"
                    key={mix}
                    className={answers.desktops === mix ? "choice on" : "choice"}
                    onClick={() => setAnswers({ ...answers, desktops: mix })}
                  >
                    <strong>{DESKTOP_META[mix].label}</strong>
                    <span>{DESKTOP_META[mix].hint}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="choice-grid">
                {SITE_SHAPES.map((site) => (
                  <button
                    type="button"
                    key={site}
                    className={answers.sites === site ? "choice on" : "choice"}
                    onClick={() => setAnswers({ ...answers, sites: site })}
                  >
                    <strong>{SITE_META[site].label}</strong>
                    <span>{SITE_META[site].hint}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 5 ? (
              <div className="choice-grid">
                {GEAR_TIERS.map((tier) => (
                  <button
                    type="button"
                    key={tier}
                    className={answers.gear === tier ? "choice on" : "choice"}
                    onClick={() => setAnswers({ ...answers, gear: tier })}
                  >
                    <strong>{GEAR_META[tier].label}</strong>
                    <span>{GEAR_META[tier].hint}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {error ? <p className="error">{error}</p> : null}

            <div className="hero-actions">
              {step > 0 ? (
                <button type="button" className="btn btn-outline" onClick={() => setStep((n) => n - 1)}>
                  Back
                </button>
              ) : null}
              <button type="submit" className="btn btn-primary">
                {step === STEPS.length - 1 ? "Build the network" : "Next"}
              </button>
              <button type="button" className="btn btn-outline" onClick={loadDemo}>
                See a 12-person plumbing shop
              </button>
            </div>
          </form>

          <aside className="panel preview-card">
            <h3>What you walk out with</h3>
            <ul className="takeaways">
              <li>IP plan and VLANs, including guest and cameras when you asked for them</li>
              <li>Samba AD so Windows PCs join a domain without a Microsoft CAL</li>
              <li>Debian install scripts, user CSV, WireGuard stub, firewall matrix</li>
              <li>Shopping list with street prices next to the Windows Server license math</li>
            </ul>
            {preview ? (
              <p className="fine" style={{ marginTop: "1rem" }}>
                Live sketch: {preview.summary}
              </p>
            ) : (
              <p className="fine" style={{ marginTop: "1rem" }}>
                Name the shop and the sketch fills in.
              </p>
            )}
            <p className="fine">
              {BRAND_PARENT} is {FD_PRICE}. {FD_PROMISE}. If you want someone else to rack it,{" "}
              <Link to="/compare">compare the stack</Link> then book the free 30.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

function toggleNeed(answers: Answers, setAnswers: (next: Answers) => void, need: Need) {
  const has = answers.needs.includes(need);
  setAnswers({
    ...answers,
    needs: has ? answers.needs.filter((item) => item !== need) : [...answers.needs, need],
  });
}
