import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { JOBS, JOB_LABEL, blankVendor, runBook, type Job, type VendorInput } from "../../shared/book.ts";
import { sampleBook } from "../../shared/sample.ts";
import { BuyLink } from "../components/BuyLink.tsx";
import { CutList, Figures } from "../components/CutList.tsx";
import { loadBook, saveBook, starterBook, touchVendor } from "../lib/store.ts";

function asNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function BookPage() {
  const [params] = useSearchParams();
  const [book, setBook] = useState(() => loadBook() ?? starterBook());
  const result = useMemo(() => runBook(book), [book]);
  const canceled = params.get("canceled") === "1";

  useEffect(() => {
    saveBook(book);
  }, [book]);

  function patchVendor(id: string, patch: Partial<VendorInput>) {
    setBook((current) => ({ ...current, vendors: touchVendor(current.vendors, id, patch) }));
  }

  return (
    <article data-page="book">
      <header className="page-head">
        <h1>The book</h1>
        <p>Numbers stay in this browser. A blank row is ignored. The cuts update as you type.</p>
      </header>
      {canceled ? <p className="banner">Checkout closed before payment. The book is still here.</p> : null}

      <form
        className="ledger"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="identity">
          <label>
            Company
            <input
              value={book.company}
              onChange={(event) => setBook({ ...book, company: event.target.value })}
              autoComplete="organization"
            />
          </label>
          <label>
            Month
            <input
              value={book.monthLabel}
              onChange={(event) => setBook({ ...book, monthLabel: event.target.value })}
              placeholder="October 2026"
            />
          </label>
          <label>
            Rework rate, $ / hour
            <input
              inputMode="decimal"
              value={book.reworkRateUsd}
              onChange={(event) => setBook({ ...book, reworkRateUsd: asNumber(event.target.value) })}
            />
          </label>
        </div>
        <p className="quiet">The $95 default is a placeholder loaded rate. Change it to yours.</p>

        <div className="vendors">
          {book.vendors.map((vendor, index) => (
            <fieldset key={vendor.id} className="vendor">
              <legend>Vendor {index + 1}</legend>
              <div className="vendor-top">
                <label>
                  Name
                  <input value={vendor.name} onChange={(event) => patchVendor(vendor.id, { name: event.target.value })} />
                </label>
                <label>
                  Job
                  <select
                    value={vendor.job}
                    onChange={(event) => patchVendor(vendor.id, { job: event.target.value as Job })}
                  >
                    {JOBS.map((job) => (
                      <option key={job} value={job}>
                        {JOB_LABEL[job]}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    setBook((current) => ({
                      ...current,
                      vendors: current.vendors.filter((item) => item.id !== vendor.id),
                    }))
                  }
                >
                  Remove
                </button>
              </div>
              <div className="vendor-nums">
                <label>
                  Monthly bill, USD
                  <input
                    inputMode="decimal"
                    value={vendor.monthlyUsd}
                    onChange={(event) => patchVendor(vendor.id, { monthlyUsd: asNumber(event.target.value) })}
                  />
                </label>
                <label>
                  Seats
                  <input
                    inputMode="numeric"
                    value={vendor.seats}
                    onChange={(event) => patchVendor(vendor.id, { seats: asNumber(event.target.value) })}
                  />
                </label>
                <label>
                  Active seats
                  <input
                    inputMode="numeric"
                    value={vendor.activeSeats}
                    onChange={(event) => patchVendor(vendor.id, { activeSeats: asNumber(event.target.value) })}
                  />
                </label>
                <label>
                  Jobs finished
                  <input
                    inputMode="numeric"
                    value={vendor.finishedJobs}
                    onChange={(event) => patchVendor(vendor.id, { finishedJobs: asNumber(event.target.value) })}
                  />
                </label>
                <label>
                  Rework hours
                  <input
                    inputMode="decimal"
                    value={vendor.reworkHours}
                    onChange={(event) => patchVendor(vendor.id, { reworkHours: asNumber(event.target.value) })}
                  />
                </label>
              </div>
            </fieldset>
          ))}
        </div>

        <div className="row-actions">
          <button
            type="button"
            onClick={() =>
              setBook((current) => ({
                ...current,
                vendors: [...current.vendors, blankVendor(crypto.randomUUID())],
              }))
            }
          >
            Add a vendor
          </button>
          <button
            type="button"
            onClick={() => {
              const dirty = book.vendors.some((vendor) => vendor.name.trim() || vendor.monthlyUsd > 0);
              if (dirty && !window.confirm("Replace this book with the Northline sample?")) return;
              setBook(sampleBook());
            }}
          >
            Load the Northline sample
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              if (!window.confirm("Clear the book in this browser?")) return;
              setBook(starterBook());
            }}
          >
            Clear
          </button>
        </div>
      </form>

      <section className="block">
        <div className="section-head">
          <h2>Cuts</h2>
          <Link to="/packet">Open the packet</Link>
        </div>
        <Figures book={result} />
        <CutList book={result} />
        <div className="buy-row">
          <BuyLink>Buy the packet, $750</BuyLink>
          <p className="quiet">Paid in full on Stripe. The rows stay here.</p>
        </div>
      </section>
    </article>
  );
}
