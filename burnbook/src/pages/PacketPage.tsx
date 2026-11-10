import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { runBook } from "../../shared/book.ts";
import { fileSlug, lettersFor, memoText, packetJson, packetPlain } from "../../shared/memo.ts";
import { BuyLink } from "../components/BuyLink.tsx";
import { loadBook, loadPaid, starterBook } from "../lib/store.ts";

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PacketPage() {
  const [paid] = useState(() => loadPaid());
  const book = useMemo(() => runBook(loadBook() ?? starterBook()), []);
  const memo = memoText(book);
  const letters = lettersFor(book);
  const slug = fileSlug(book.company);

  return (
    <article data-page="packet" className={paid ? "packet" : "packet draft"}>
      <header className="page-head">
        <h1>Board packet</h1>
        {paid ? (
          <p>Paid in full. Session {paid} unlocked the files in this browser.</p>
        ) : (
          <p>Draft. The memo is on the screen. Download and print come with the $750 packet.</p>
        )}
      </header>

      {!paid ? (
        <div className="buy-row">
          <BuyLink>Buy the packet, $750</BuyLink>
          <p className="quiet">One Stripe checkout. $750.00 charged in full.</p>
        </div>
      ) : null}

      <div className="packet-actions">
        <button type="button" disabled={!paid} onClick={() => download(`${slug}-burn-book.txt`, packetPlain(book))}>
          Download the memo
        </button>
        <button type="button" disabled={!paid} onClick={() => download(`${slug}-burn-book.json`, packetJson(book))}>
          Download JSON
        </button>
        <button type="button" disabled={!paid} onClick={() => window.print()}>
          Print
        </button>
        <Link to="/book">Edit the book</Link>
      </div>

      <pre className="memo">{memo}</pre>
      {letters.length > 0 ? (
        <section>
          <h2>Letters</h2>
          {letters.map((letter) => (
            <pre key={letter.vendorId} className="memo letter">
              {letter.body}
            </pre>
          ))}
        </section>
      ) : null}
    </article>
  );
}
