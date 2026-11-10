import { PAYMENT_LINK } from "../../shared/brand.ts";

type BuyLinkProps = {
  children: string;
  className?: string;
};

export function BuyLink({ children, className = "buy" }: BuyLinkProps) {
  return (
    <a
      className={className}
      href={PAYMENT_LINK}
      onClick={(event) => {
        event.preventDefault();
        void startCheckout();
      }}
    >
      {children}
    </a>
  );
}

async function startCheckout() {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offer: "packet" }),
    });
    if (res.ok) {
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
    }
  } catch {
    /* The payment link below is the same $750 charge. */
  }
  window.location.assign(PAYMENT_LINK);
}
