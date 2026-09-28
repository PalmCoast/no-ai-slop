import { hostedResultHtml, publishRefusal, stampFileUrl, stampPageUrl, type PaidSession } from "../../src/host.ts";
import { certificate, openSeal } from "../../src/stamp.ts";
import { publicOrigin } from "./env.ts";
import { publishStamp } from "./store.ts";

export type FulfillResult =
  | {
      ok: true;
      id: string;
      url: string;
      fileUrl: string;
      sha256: string;
      note: string;
      method: string;
      rawLen: number;
      packedLen: number;
      html: string;
    }
  | { ok: false; status: number; code: string; message: string };

const REFUSAL: Record<string, { status: number; message: string }> = {
  unpaid: { status: 402, message: "Checkout is not paid." },
  wrong_amount: { status: 402, message: "Stamp Desk is $29 USD." },
  wrong_mode: { status: 400, message: "This Checkout session is not a one-time payment." },
  wrong_product: { status: 400, message: "This Checkout session is not Stamp Desk." },
  bad_stamp: { status: 400, message: "This Checkout session has no stamp." },
};

export async function fulfillSession(session: PaidSession): Promise<FulfillResult> {
  const reason = publishRefusal(session);
  if (reason) {
    const known = REFUSAL[reason] ?? { status: 400, message: "This Checkout session cannot host a stamp." };
    return { ok: false, status: known.status, code: reason, message: known.message };
  }
  const id = session.metadata?.stampId ?? "";
  let bytes: Uint8Array | null;
  try {
    bytes = await publishStamp(id);
  } catch (cause) {
    console.error("stamp publish failed", cause);
    return { ok: false, status: 503, code: "store_unavailable", message: "Netlify Blobs is not available for stamp storage." };
  }
  if (!bytes) {
    return { ok: false, status: 409, code: "stamp_missing", message: "The stamp was not held for this payment." };
  }
  const opened = openSeal(bytes);
  const origin = publicOrigin();
  const url = stampPageUrl(id, origin);
  const fileUrl = stampFileUrl(id, origin);
  return {
    ok: true,
    id,
    url,
    fileUrl,
    sha256: opened.sha256,
    note: opened.note,
    method: opened.method,
    rawLen: opened.rawLen,
    packedLen: opened.packedLen,
    html: hostedResultHtml({ url, fileUrl, certificateText: certificate(opened), sha256: opened.sha256 }),
  };
}
