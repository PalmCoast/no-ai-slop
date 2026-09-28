import { STAMP_DESK_CENTS, STAMP_SITE } from "./offer.ts";
import { certificate, type Stamp } from "./stamp.ts";
import { sha256Hex } from "./sha256.ts";

const ID_RE = /^[0-9a-f]{32}$/;

export function isStampId(id: string): boolean {
  return ID_RE.test(id);
}

/** Content address of the stamp file. The same bytes always publish at the same path. */
export function stampPublicId(blob: Uint8Array): string {
  return sha256Hex(blob).slice(0, 32);
}

export function stampPageUrl(id: string, origin = STAMP_SITE): string {
  return `${origin.replace(/\/$/, "")}/s/${id}`;
}

export function stampFileUrl(id: string, origin = STAMP_SITE): string {
  return `${stampPageUrl(id, origin)}/file`;
}

export type PaidSession = {
  id?: string;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  mode?: string | null;
  metadata?: { [key: string]: string } | null;
};

/** Null when this Checkout session may publish the stamp it names. */
export function publishRefusal(session: PaidSession): string | null {
  if (session.payment_status !== "paid") return "unpaid";
  if (session.mode !== "payment") return "wrong_mode";
  if (session.currency !== "usd" || session.amount_total !== STAMP_DESK_CENTS) return "wrong_amount";
  if (session.metadata?.product !== "braid" || session.metadata?.kind !== "stamp-desk") return "wrong_product";
  const id = session.metadata.stampId ?? "";
  if (!isStampId(id)) return "bad_stamp";
  return null;
}

function esc(value: string): string {
  return value.replace(/[&<>"]/g, (ch) => {
    if (ch === "&") return "&amp;";
    if (ch === "<") return "&lt;";
    if (ch === ">") return "&gt;";
    return "&quot;";
  });
}

const PAGE_STYLE = `
  body { margin: 0; padding: 28px 22px 48px; color: #221c16; background: #efe6d6;
    font-family: "Iowan Old Style", Palatino, Georgia, serif; line-height: 1.45; }
  main { max-width: 42rem; margin: 0 auto; }
  .mark { margin: 0; font-family: ui-monospace, Menlo, Consolas, monospace; letter-spacing: 0.14em;
    text-transform: uppercase; font-size: 13px; color: #9d3418; }
  a { color: #9d3418; }
  pre { white-space: pre-wrap; background: #221c16; color: #f4efe4; padding: 12px;
    font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; }
  code { font-family: ui-monospace, Menlo, Consolas, monospace; }
`;

export function pageShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <style>${PAGE_STYLE}</style>
</head>
<body>
  <main>
    <p class="mark">Braid</p>
    ${body}
  </main>
</body>
</html>`;
}

export function hostedResultHtml(input: {
  url: string;
  fileUrl: string;
  certificateText: string;
  sha256: string;
}): string {
  return pageShell(
    "Stamp hosted",
    `<h1>Stamp hosted</h1>
    <p>The client can open this URL in a browser. Python, <code>xxd</code>, and <code>od</code> are not required.</p>
    <p><a href="${esc(input.url)}">${esc(input.url)}</a></p>
    <p>SHA-256 of the original bytes: <code>${esc(input.sha256)}</code></p>
    <p><a href="${esc(input.fileUrl)}">Download the stamp file</a></p>
    <pre>${esc(input.certificateText)}</pre>`,
  );
}

export function hostedErrorHtml(message: string): string {
  return pageShell("Stamp Desk", `<h1>Stamp Desk</h1><p>${esc(message)}</p>`);
}

export function stampPageHtml(stamp: Stamp & { raw: Uint8Array }, pageUrl: string, fileUrl: string): string {
  const preview = [...stamp.raw.slice(0, 32)].map((b) => b.toString(16).padStart(2, "0")).join(" ");
  return pageShell(
    `Stamp ${stamp.sha256.slice(0, 12)}`,
    `<h1>Hosted stamp</h1>
    <p>This page is the stamp. You do not need Python, <code>xxd</code>, or <code>od</code> to read the hash.</p>
    <p>SHA-256 of the original bytes: <code>${esc(stamp.sha256)}</code></p>
    <p><a href="${esc(fileUrl)}">Download the stamp file</a></p>
    <pre>${esc(certificate(stamp))}</pre>
    <p>First bytes: <code>${esc(preview)}</code></p>
    <p><a href="${esc(pageUrl)}">${esc(pageUrl)}</a></p>`,
  );
}
