import { JOB_LABEL } from "../../shared/book.ts";
import { formatUsd } from "../../shared/money.ts";
import type { BookResult } from "../../shared/book.ts";

export function Figures({ book }: { book: BookResult }) {
  const items = [
    ["Bill", book.burnUsd],
    ["Idle seats", book.idleWasteUsd],
    ["Vendor cut", book.vendorSaveUsd],
    ["Labor cut", book.laborSaveUsd],
  ] as const;
  return (
    <>
      <dl className="figures">
        {items.map(([label, amount]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{formatUsd(amount)}</dd>
          </div>
        ))}
      </dl>
      <p className="quiet">
        Idle seats is the empty share of each bill. Vendor cut and labor cut are the actions. A cancel already includes
        that vendor’s idle seats, so those boxes are not added together.
      </p>
    </>
  );
}

export function CutList({ book }: { book: BookResult }) {
  if (book.vendors.length === 0) {
    return <p className="quiet">Add a vendor. A blank row is ignored.</p>;
  }
  return (
    <ol className="cuts">
      {book.vendors.map((vendor) => (
        <li key={vendor.id} data-cut={vendor.cut.kind}>
          <div className="cut-meta">
            <span className={`tag tag-${vendor.cut.kind}`}>{vendor.cut.kind}</span>
            <span>{JOB_LABEL[vendor.job]}</span>
            <span>{formatUsd(vendor.monthlyUsd)}</span>
            {vendor.costPerJobUsd !== null ? <span>{formatUsd(vendor.costPerJobUsd)} / job</span> : <span>No finished job</span>}
          </div>
          <p>{vendor.cut.line}</p>
        </li>
      ))}
    </ol>
  );
}
