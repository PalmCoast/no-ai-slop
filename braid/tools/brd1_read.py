#!/usr/bin/env python3
"""Read a BRD1 stamp and check the SHA-256 of the original bytes.

Usage: python3 tools/brd1_read.py examples/sensor.stamp
"""

import hashlib
import struct
import sys

METHODS = ("raw", "rle", "lzss")
MIN_MATCH = 3
MAX_RAW = 1_000_000


def unpack_rle(packed: bytes) -> bytearray:
    if len(packed) % 2:
        raise SystemExit("truncated rle")
    out = bytearray()
    for i in range(0, len(packed), 2):
        count = packed[i]
        if count == 0:
            raise SystemExit("empty rle run")
        out.extend([packed[i + 1]] * count)
    return out


def unpack_lzss(packed: bytes) -> bytearray:
    out = bytearray()
    i = 0
    while i < len(packed):
        tag = packed[i]
        i += 1
        if tag == 0:
            if i >= len(packed):
                raise SystemExit("truncated lzss literal")
            out.append(packed[i])
            i += 1
        elif tag == 1:
            if i + 3 > len(packed):
                raise SystemExit("truncated lzss match")
            off = packed[i] | (packed[i + 1] << 8)
            length = packed[i + 2] + MIN_MATCH
            i += 3
            if off < 1 or off > len(out):
                raise SystemExit("bad lzss offset")
            for _ in range(length):
                out.append(out[-off])
        else:
            raise SystemExit("bad lzss tag")
    return out


def expand(method: str, packed: bytes, raw_len: int) -> bytes:
    if method == "raw":
        out = packed
    elif method == "rle":
        out = unpack_rle(packed)
    else:
        out = unpack_lzss(packed)
    if len(out) != raw_len:
        raise SystemExit(f"expand length {len(out)} != {raw_len}")
    return bytes(out)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: python3 tools/brd1_read.py <stamp>")
    blob = open(sys.argv[1], "rb").read()
    if len(blob) < 48 or blob[:4] != b"BRD1":
        raise SystemExit("not a braid stamp")
    if blob[4] != 1:
        raise SystemExit("unsupported stamp version")
    method_i = blob[5]
    if method_i >= len(METHODS):
        raise SystemExit("bad stamp method")
    raw_len, packed_len, note_len = struct.unpack_from("<IIH", blob, 6)
    if raw_len > MAX_RAW:
        raise SystemExit("stamp is too large")
    note_at = 16
    packed_at = note_at + note_len
    hash_at = packed_at + packed_len
    if hash_at + 32 != len(blob):
        raise SystemExit("truncated stamp")
    method = METHODS[method_i]
    note = blob[note_at:packed_at].decode("utf-8", "replace")
    raw = expand(method, blob[packed_at:hash_at], raw_len)
    digest = hashlib.sha256(raw).hexdigest()
    stored = blob[hash_at:].hex()
    print(f"sha256 {digest}")
    print(f"note {note}")
    print(f"method {method}")
    print(f"raw {raw_len}")
    if digest != stored:
        print("hash mismatch")
        raise SystemExit(1)
    print("ok")


if __name__ == "__main__":
    main()
