import { useEffect } from "react";
import { PLUGINS, SKILLS } from "../../shared/catalog.ts";

export default function Apps() {
  useEffect(() => {
    document.title = "Apps | Graham";
  }, []);
  const live = PLUGINS.filter((plugin) => plugin.mode === "on");
  const connect = PLUGINS.filter((plugin) => plugin.mode === "plugin");

  return (
    <div className="container">
      <p className="kicker">One being</p>
      <h1>The apps sit inside Graham.</h1>
      <p className="lede">AskYard, GuyThread, NetYard, and the rest are skills. Connectors that need a login stay plugins. You connect yours. Daniel's keys are not in the recipe.</p>
      <section>
        <h2>Skills</h2>
        <div className="grid">
          {SKILLS.map((skill) => (
            <article key={skill.id} className="card">
              <h3>
                <a href={skill.href}>{skill.name}</a>
              </h3>
              <p>{skill.job}</p>
              {skill.price ? <p className="price">{skill.price}</p> : null}
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>Already running</h2>
        <ul className="plain">
          {live.map((plugin) => (
            <li key={plugin.id}>
              <strong>{plugin.name}.</strong> {plugin.job}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Connect when you stand it up</h2>
        <ul className="plain">
          {connect.map((plugin) => (
            <li key={plugin.id}>
              <strong>{plugin.name}.</strong> {plugin.job}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
