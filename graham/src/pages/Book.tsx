import { FormEvent, useEffect, useState } from "react";
import { postJson } from "../api";
import { CALENDLY_URL } from "../../shared/public.ts";
import { nextSlots, type Slot } from "../../shared/slots.ts";
import { pushHold } from "../session";

export default function Book() {
  const [slots, setSlots] = useState<Slot[]>(() => nextSlots(new Date(), 4));
  const [slot, setSlot] = useState(slots[0]?.iso ?? "");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [held, setHeld] = useState("");

  useEffect(() => {
    document.title = "Book | Higgins";
    void postJson<{ slots: Slot[] }>("/api/book")
      .then((body) => {
        if (body.slots?.length) {
          setSlots(body.slots);
          setSlot(body.slots[0].iso);
        }
      })
      .catch(() => undefined);
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const chosen = slots.find((row) => row.iso === slot) ?? slots[0];
    if (!chosen || name.trim().length < 2) return;
    const hold = {
      id: `hold_${Date.now()}`,
      at: new Date().toISOString(),
      name: name.trim(),
      topic: topic.trim() || "30 minutes",
      slot: chosen,
    };
    pushHold(hold);
    setHeld(`${chosen.label} held for ${hold.name}. Put it on the live calendar if it should be official.`);
    void postJson("/api/book", { name: hold.name, topic: hold.topic, slot: chosen.iso }).catch(() => undefined);
  }

  return (
    <div className="container narrow">
      <p className="kicker">30 minutes</p>
      <h1>Hold a meeting.</h1>
      <p className="lede">
        Weekday slots at 3:00 and 4:00 ET. The hold sits on this desk. The calendar that other people already use is Calendly.
      </p>
      <p>
        <a href={CALENDLY_URL}>Open the live book</a>
      </p>
      <form className="stack" onSubmit={onSubmit}>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          What it's about
          <input value={topic} onChange={(event) => setTopic(event.target.value)} />
        </label>
        <label>
          Slot
          <select value={slot} onChange={(event) => setSlot(event.target.value)}>
            {slots.map((row) => (
              <option key={row.iso} value={row.iso}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="submit">
          Hold it
        </button>
      </form>
      {held ? <p className="card">{held}</p> : null}
    </div>
  );
}
