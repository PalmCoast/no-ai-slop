import { ASK_AI_BRAND, ASK_AI_PROMPT, ASK_AI_SUBTITLE, askAiLinks } from "../../shared/ask-ai";

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
    </svg>
  );
}

function ExtIcon() {
  return (
    <svg className="ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 4h6v6M10 14L20 4M20 14v6H4V4h6" />
    </svg>
  );
}

function ProviderMark({ name }: { name: string }) {
  const slug = name.toLowerCase();
  return <span className={`ask-ai-bar__logo ask-ai-bar__logo--${slug}`} aria-hidden="true" />;
}

export default function AskAiBar() {
  const links = askAiLinks();

  return (
    <section className="ask-ai-wrap">
      <div className="container">
        <div className="ask-ai-bar" role="region" aria-label={`Ask AI about ${ASK_AI_BRAND}`}>
          <div className="ask-ai-bar__brand">
            <div className="ask-ai-bar__icon">
              <SparkIcon />
            </div>
            <div>
              <p className="ask-ai-bar__title">Ask AI about {ASK_AI_BRAND}</p>
              <p className="ask-ai-bar__sub">{ASK_AI_SUBTITLE}</p>
            </div>
          </div>
          <p className="ask-ai-bar__prompt">“{ASK_AI_PROMPT}”</p>
          <div className="ask-ai-bar__btns">
            {links.map((link) => (
              <a
                key={link.name}
                className="ask-ai-bar__btn"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ProviderMark name={link.name} />
                {link.name}
                <ExtIcon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
