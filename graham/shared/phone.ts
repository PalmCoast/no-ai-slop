/** Compare phone numbers without treating a country code as a verdict. */
export function phoneKey(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
}

export function samePhone(a: string, b: string): boolean {
  const left = phoneKey(a);
  const right = phoneKey(b);
  if (!left || !right) return false;
  return left === right;
}
