import type { Faq } from "../../shared/faqs";

export default function FaqList({ items }: { items: readonly Faq[] }) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <article key={item.q} className="trust">
          <h3>{item.q}</h3>
          <p className="muted">{item.a}</p>
        </article>
      ))}
    </div>
  );
}
