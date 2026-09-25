export type CheckoutResponse = {
  url?: string;
  demo?: boolean;
  amountCents?: number;
  amountLabel?: string;
  message?: string;
  error?: string;
};

export async function startCheckout(shopName: string, query: string, email?: string): Promise<CheckoutResponse> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ shopName, query, email }),
  });
  const data = (await res.json()) as CheckoutResponse;
  if (!res.ok) throw new Error(data.message ?? "Checkout failed.");
  return data;
}

export async function confirmOrder(sessionId: string): Promise<{ paid: boolean; demo?: boolean; message?: string }> {
  const res = await fetch(`/api/order?session_id=${encodeURIComponent(sessionId)}`);
  const data = (await res.json()) as { paid?: boolean; demo?: boolean; message?: string };
  if (!res.ok) throw new Error(data.message ?? "Could not confirm the payment.");
  return { paid: Boolean(data.paid), demo: data.demo, message: data.message };
}
