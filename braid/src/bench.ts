/** Mixed-radix hot loop. Decimal, hex, binary, and octal are all in the instruction stream. */
export const HOT_ITERS = 200_000;

export const HOT_LOOP = `let n = 0
let i = 0
while i < ${HOT_ITERS} {
  n = (n + (i & 0xFF) + 0x1F + 0b11 + 0o7) & 0xFFFFFF
  i = i + 1
}
print n
`;

export const PYTHON_HOT_LOOP = `n = 0
i = 0
while i < ${HOT_ITERS}:
    n = (n + (i & 0xFF) + 0x1F + 0b11 + 0o7) & 0xFFFFFF
    i = i + 1
print(n)
`;
