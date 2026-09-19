import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ASK_AI_PROMPT, ASK_AI_SUBTITLE, BRAND_NAME } from "../../shared/brand";
import { askAiLinks, reputationPrompt } from "../../shared/reputation";

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
    </svg>
  );
}

export default function ReputationBar() {
  const [topic, setTopic] = useState("");
  const prompt = topic.trim() ? reputationPrompt(topic) : ASK_AI_PROMPT;
  const links = useMemo(() => askAiLinks(prompt), [prompt]);

  return (
    <section className="ask-ai-wrap" id="reputation">
      <div className="container">
        <div className="ask-ai-bar" role="search" aria-label={`Search AI about ${BRAND_NAME}`}>
          <div className="ask-ai-bar__brand">
            <div className="ask-ai-bar__icon">
              <SparkIcon />
            </div>
            <div>
              <p className="ask-ai-bar__title">Search every major LLM about us</p>
              <p className="ask-ai-bar__sub">{ASK_AI_SUBTITLE}</p>
              <p className="ask-ai-bar__sub">
                Look yourself up on the <Link to="/rep">reputation meter</Link>. Chrome toolbar if you want it in one click.
              </p>
            </div>
          </div>
          <div className="rep-search">
            <label className="fine" htmlFor="rep-topic">
              Optional: add a name, shop, or rumor
            </label>
            <input
              id="rep-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="AskYard, First Deploy AI, AgentHive Inc…"
            />
          </div>
          <div className="ask-ai-bar__btns">
            {links.map((link) => (
              <a key={link.name} className="ask-ai-bar__btn" href={link.href} target="_blank" rel="noopener noreferrer">
                <span className={`ask-ai-bar__logo ask-ai-bar__logo--${link.name.toLowerCase()}`} aria-hidden="true" />
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
