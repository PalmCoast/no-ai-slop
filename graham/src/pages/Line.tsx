import { FormEvent, useEffect, useState } from "react";
import { postJson } from "../api";
import { PUBLIC_CONTACTS } from "../../shared/public.ts";
import { screenCall, type Contact, type ScreenResult } from "../../shared/calls.ts";
import { pushSlip } from "../session";

const SAMPLES: { label: string; from: string; said: string }[] = [
  { label: "On the list", from: "+1 320-335-6186", said: "It's the shop line about a warranty question from a client." },
  { label: "HVAC quote", from: "+91 98400 11122", said: "HVAC quote for Thursday. Can we book 30 minutes?" },
  { label: "Press 1", from: "+1 305 555 0199", said: "Press 1 to be removed from our calling list. This call is recorded for quality." },
  { label: "Site down", from: "+1 904 555 0144", said: "The site is down and the crew is dark. Can we book a call?" },
  { label: "Quote", from: "+1 386 555 0177", said: "Tell Daniel the quote is $4,200 and the truck can start Monday." },
];

export default function Line() {
  const [contacts, setContacts] = useState<Contact[]>(PUBLIC_CONTACTS.map((row) => ({ ...row, phones: [...row.phones] })));
  const [from, setFrom] = useState(SAMPLES[2].from);
  const [said, setSaid] = useState(SAMPLES[2].said);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<ScreenResult | null>(null);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    document.title = "Line | Graham";
  }, []);

  function run(nextFrom: string, nextSaid: string) {
    const screened = screenCall({ from: nextFrom, said: nextSaid, contacts });
    setResult(screened);
    setSaved("On this screen");
    pushSlip({
      id: `local_${Date.now()}`,
      at: new Date().toISOString(),
      from: nextFrom,
      said: nextSaid,
      result: screened,
    });
    void postJson("/api/screen", { from: nextFrom, said: nextSaid })
      .then((body) => {
        const remote = body as { result: ScreenResult };
        setResult(remote.result);
        setSaved("Saved on the desk");
      })
      .catch(() => setSaved("On this screen"));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    run(from, said);
  }

  function addContact(event: FormEvent) {
    event.preventDefault();
    const next = name.trim();
    const number = phone.trim();
    if (next.length < 2 || number.replace(/\D/g, "").length < 7) return;
    setContacts((rows) => [...rows, { name: next, phones: [number] }]);
    setName("");
    setPhone("");
    void postJson("/api/desk", { action: "contact", name: next, phone: number }).catch(() => undefined);
  }

  return (
    <div className="container narrow">
      <p className="kicker">The forward</p>
      <h1>Screen the call.</h1>
      <p className="lede">Graham checks the contacts list first. Then the script. A country code never decides it.</p>
      <div className="row wrap">
        {SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            className="chip"
            onClick={() => {
              setFrom(sample.from);
              setSaid(sample.said);
              run(sample.from, sample.said);
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>
      <form className="stack" onSubmit={onSubmit}>
        <label>
          Number
          <input value={from} onChange={(event) => setFrom(event.target.value)} autoComplete="off" />
        </label>
        <label>
          What they said
          <textarea value={said} onChange={(event) => setSaid(event.target.value)} rows={4} />
        </label>
        <button className="button" type="submit">
          Screen it
        </button>
      </form>
      {result ? (
        <article className={`card verdict ${result.action}`}>
          <p className="kicker">{result.action}</p>
          <h2>{result.reason}</h2>
          <p>{result.say}</p>
          <p className="muted">{saved}</p>
        </article>
      ) : null}
      <section>
        <h2>Contacts list</h2>
        <ul className="plain">
          {contacts.map((contact) => (
            <li key={contact.name}>
              <strong>{contact.name}</strong>
              {contact.phones.length > 0 ? " rings through" : " no phone on file"}
            </li>
          ))}
        </ul>
        <form className="stack" onSubmit={addContact}>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Phone
            <input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="off" />
          </label>
          <button className="button ghost" type="submit">
            Add to the list
          </button>
        </form>
      </section>
    </div>
  );
}
