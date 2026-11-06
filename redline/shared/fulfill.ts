/** Whether a verified Stripe event should count as a paid Redline pass. */
export function shouldIssuePass(type: string, paymentStatus: string | null | undefined): boolean {
  if (paymentStatus == null || paymentStatus === "unpaid") return false;
  if (type === "checkout.session.completed" || type === "checkout.session.async_payment_succeeded") {
    return paymentStatus === "paid" || paymentStatus === "no_payment_required";
  }
  return false;
}
