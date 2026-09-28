# Braid

One file holds the code, the binary flags, the hex dump, and the octal note. Braid checks that those spellings are the same value, compresses the bytes, and seals a SHA-256.

Python, `xxd`, and `od` already do these jobs one at a time. Braid is the file you write when you are tired of pasting between them.

## Name

Braid. The four spellings are strands. `agree` is the knot.

## What a program looks like

```braid
let magic = agree[
  0xA55A,
  0b1010010101011010,
  0o122532,
  42330
]

let frame = hex[
  A5 5A 16 00
]

let packed = compress frame
assert expand packed == frame
seal frame, "bench logger frame"
```

`0x`, `0b`, `0o`, and decimal are integers. `hex[ ]`, `bin[ ]`, and `oct[ ]` are bytes, including an `xxd` line or an `od -b` line pasted inside the brackets. `agree` throws if the values differ. A one-byte array agrees with the integer of that byte. `compress` keeps the smallest of the raw bytes, run-length encoding, and LZSS. `seal` writes a stamp: method, sizes, note, and SHA-256 of the original bytes.

`examples/sensor.braid` is a 260-byte logger frame. The magic, the flags, the Unix mode, and the checksum are each written more than one way. Both the bytecode machine and the JavaScript backend print `149`, `42330`, `22`, and `420`.

`braid weave` turns separate dump files into that kind of program:

```bash
npx vite-node src/cli.ts weave \
  --hex examples/frame.hex \
  --oct examples/frame.oct \
  --bin examples/frame.bin
```

If the dumps differ, weave stops and names the byte offset.

## Proof

From `braid/`:

```bash
npm test
npm run prove
```

`npm test` checks SHA-256 against Node's crypto, roundtrips compression, reads `xxd` / `od -b` / binary rows as the same bytes, runs every sample on both backends, and rejects a stamp whose hash was flipped.

One `npm run prove` on this machine printed:

```text
hot loop checksum 139424
js backend 14.1 ms
bytecode vm 106.1 ms
CPython 23.4 ms after startup, same checksum: true
4096-byte repeating buffer packed with lzss: 72 bytes (raw 4096)
hex text of that buffer is 12287 characters; the stamp file is 136 bytes
stamp sha256 638d223b3f122c027c954adb76117cf787b70a1c5a6c67e877fa34902ed03e1f
cross-radix agree checks in the sensor snippet: 1
```

The loop is 200,000 iterations and the body adds a decimal, a hex constant, a binary constant, and an octal constant. The JavaScript backend and CPython printed the same checksum. That run was 14.1 ms against 23.4 ms of CPython after process startup. The bytecode machine took 106.1 ms. It is the portable image you can hash and reload. The speed is the JavaScript kernel, which is the same program lowered from the same AST.

The 4,096-byte repeating buffer became 72 bytes. Writing it as hex text takes 12,287 characters. The stamp file is 136 bytes and opens back to the original SHA-256.

Bitwise operators are 32-bit, matching JavaScript. Division truncates toward zero.

## Read a stamp

`examples/sensor.stamp` is the sealed sensor frame. This reader expands a `BRD1` file and checks the SHA-256 of the original bytes. It does not install Braid.

```bash
python3 tools/brd1_read.py examples/sensor.stamp
```

## Stamp Desk

A local stamp is free. `seal` in the desk, or:

```bash
npx vite-node src/cli.ts stamp examples/sensor.braid
```

The file starts with `BRD1`. `openSeal` expands it and checks the hash.

Stamp Desk is **$29** once, on the same Palm Coast AI Stripe account as AskYard and NetYard. The desk posts the stamp to `POST /api/checkout`, which holds it in the `braid-stamps` Netlify Blobs store and opens Checkout on price `price_1UIE1RFJWYd4pYux4kwJRSfU` (product `prod_VIpgG7x1qvOChf`). The success page `/hosted?session_id=…` checks that the session paid $29, copies the stamp to a public key, and returns a stable URL:

```text
https://braid-firstdeploy.netlify.app/s/<stamp id>
```

That page shows the SHA-256 and the certificate. `/s/<stamp id>/file` is the stamp bytes. The id is the first 32 hex characters of the stamp file's SHA-256, so the same stamp keeps the same path. A client opens the page in a browser. Python, `xxd`, and `od` are not required.

The desk is the Netlify site `braid-firstdeploy` at https://braid-firstdeploy.netlify.app/. Base directory `braid`. Do not point `firstdeploy.ai` at it. On that site:

```text
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=https://braid-firstdeploy.netlify.app
```

`STRIPE_PRICE_STAMP` is optional. When it is unset, Checkout uses `price_1UIE1RFJWYd4pYux4kwJRSfU`. Webhook URL: `https://braid-firstdeploy.netlify.app/api/stripe-webhook`. Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`. The success page stores the stamp. The webhook stores it again if the buyer closes the tab. Do not commit `sk_live` or `whsec`.

When `braid.firstdeploy.ai` is attached, set `SITE_URL` to that name. Until then the public stamp URL uses the Netlify host.

## Run the desk

```bash
cd braid
npm install
npm run dev
```

The desk is at `http://127.0.0.1:5188/`. Run executes the editor on both backends. Weave fills the editor from the three dump boxes. "Time 200,000 mixed-radix adds" replaces the editor with the hot loop.
