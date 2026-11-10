/** Dollars as `$1,234.56`. Rounded half-up to the cent. Independent of locale. */
export function formatUsd(amount: number): string {
  const negative = amount < 0;
  const cents = Math.round(Math.abs(amount) * 100);
  const dollars = Math.floor(cents / 100);
  const rest = cents % 100;
  const body = dollars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}$${body}.${rest.toString().padStart(2, "0")}`;
}

export function cents(amount: number): number {
  return Math.round(amount * 100) / 100;
}
