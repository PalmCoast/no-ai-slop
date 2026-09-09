import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Connection, Conversation, PublicUser } from "../../shared/types";
import { api, timeAgo } from "../api";
import { useAuth } from "../auth";
import { Chat } from "../components/Chat";
import { Avatar, Empty, ErrorBox, PersonRow, ReportButton, Spinner, StateSelect, VeteranBadge } from "../components/ui";

type Person = PublicUser & { connection_status: string | null };

export function PeoplePage() {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [veterans, setVeterans] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const loadConnections = () => api.get<{ connections: Connection[] }>("/api/connections").then((r) => setConnections(r.connections));
  useEffect(() => {
    void loadConnections();
  }, []);
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (state) params.set("state", state);
    if (veterans) params.set("veterans", "true");
    setPeople(null);
    api.get<{ people: Person[] }>(`/api/people?${params}`).then((r) => setPeople(r.people)).catch(setError);
  }, [q, state, veterans]);

  const connect = async (id: string) => {
    try {
      await api.post(`/api/connections/${id}`);
      setPeople((p) => p?.map((x) => (x.id === id ? { ...x, connection_status: "pending" } : x)) ?? null);
      void loadConnections();
    } catch (e) {
      setError(e);
    }
  };
  const respond = async (id: string, action: "accept" | "decline") => {
    await api.patch(`/api/connections/${id}`, { action });
    void loadConnections();
  };

  const incoming = connections?.filter((c) => c.status === "pending" && c.direction === "incoming") ?? [];
  const accepted = connections?.filter((c) => c.status === "accepted") ?? [];

  return (
    <div className="sidebar-layout">
      <aside className="stack">
        <div className="card">
          <h3>Requests</h3>
          {incoming.length === 0 && <div className="small muted">No pending requests.</div>}
          <ul className="list">
            {incoming.map((c) => (
              <li key={c.id} className="row between">
                <Link to={`/people/${c.user.id}`}>{c.user.name}</Link>
                <span className="row" style={{ gap: "0.3rem" }}>
                  <button className="sm" type="button" onClick={() => void respond(c.id, "accept")}>
                    Accept
                  </button>
                  <button className="ghost sm" type="button" onClick={() => void respond(c.id, "decline")}>
                    Decline
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Your connections ({accepted.length})</h3>
          {accepted.length === 0 && <div className="small muted">Connect with people to open direct messages.</div>}
          <ul className="list">
            {accepted.map((c) => (
              <li key={c.id} className="row between">
                <Link to={`/people/${c.user.id}`}>{c.user.name}</Link>
                <Link className="btn ghost sm" to={`/messages/${c.user.id}`}>
                  Message
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <section>
        <h1>People</h1>
        <p className="muted small">
          Direct messages only open after a connection is accepted, so nobody can cold-pitch you. Connection requests are limited to 20 a day.
        </p>
        <div className="card filters" style={{ gridTemplateColumns: "2fr 1fr auto", marginBottom: "1rem" }}>
          <label className="field">
            Search
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, headline, skill, city" />
          </label>
          <label className="field">
            State
            <StateSelect value={state} onChange={setState} />
          </label>
          <label className="check" style={{ paddingBottom: "0.6rem" }}>
            <input type="checkbox" checked={veterans} onChange={(e) => setVeterans(e.target.checked)} /> Veterans
          </label>
        </div>
        <ErrorBox error={error} />
        {people === null && <Spinner />}
        {people && people.length === 0 && <Empty>No members match yet.</Empty>}
        <ul className="list">
          {people?.map((p) => (
            <PersonRow
              key={p.id}
              person={p}
              action={
                p.connection_status === "accepted" ? (
                  <Link className="btn ghost sm" to={`/messages/${p.id}`}>
                    Message
                  </Link>
                ) : p.connection_status === "pending" ? (
                  <span className="small muted">Requested</span>
                ) : p.connection_status ? null : (
                  <button className="sm" type="button" onClick={() => void connect(p.id)}>
                    Connect
                  </button>
                )
              }
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

export function PersonDetail() {
  const { id } = useParams();
  const { me } = useAuth();
  const [person, setPerson] = useState<PublicUser | null>(null);
  const [connection, setConnection] = useState<{ id: string; status: string; direction: string } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const load = () =>
    api
      .get<{ person: PublicUser; connection: { id: string; status: string; direction: string } | null }>(`/api/people/${id}`)
      .then((r) => {
        setPerson(r.person);
        setConnection(r.connection);
      })
      .catch(setError);
  useEffect(() => {
    void load();
  }, [id]);

  if (error) return <ErrorBox error={error} />;
  if (!person) return <Spinner />;
  const self = me?.id === person.id;

  return (
    <div className="card" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="person" style={{ gridTemplateColumns: "64px 1fr auto", alignItems: "start" }}>
        <div style={{ transform: "scale(1.4)", transformOrigin: "top left" }}>
          <Avatar name={person.name} veteran={person.veteran_status} />
        </div>
        <div>
          <h1 style={{ marginBottom: "0.2rem" }}>{person.name}</h1>
          <div className="row" style={{ gap: "0.5rem" }}>
            <VeteranBadge status={person.veteran_status} branch={person.veteran_branch} />
            {person.open_to_work && <span className="badge status">Open to work</span>}
          </div>
          <p className="muted" style={{ margin: "0.4rem 0" }}>
            {person.headline || "IT professional"}
            {person.city || person.state ? ` · ${[person.city, person.state].filter(Boolean).join(", ")}` : ""}
            {person.years_experience ? ` · ${person.years_experience} years in IT` : ""}
            {person.veteran_branch ? ` · ${person.veteran_branch}` : ""}
          </p>
        </div>
        <div className="stack" style={{ gap: "0.4rem" }}>
          {self && (
            <Link className="btn ghost sm" to="/profile">
              Edit profile
            </Link>
          )}
          {!self && !connection && (
            <button className="sm" type="button" onClick={() => api.post(`/api/connections/${person.id}`).then(load)}>
              Connect
            </button>
          )}
          {!self && connection?.status === "pending" && connection.direction === "incoming" && (
            <button className="sm" type="button" onClick={() => api.patch(`/api/connections/${connection.id}`, { action: "accept" }).then(load)}>
              Accept request
            </button>
          )}
          {!self && connection?.status === "pending" && connection.direction === "outgoing" && <span className="small muted">Request sent</span>}
          {!self && connection?.status === "accepted" && (
            <Link className="btn sm" to={`/messages/${person.id}`}>
              Message
            </Link>
          )}
          {!self && <ReportButton type="user" id={person.id} />}
        </div>
      </div>
      {person.bio && <p className="prose" style={{ marginTop: "1rem" }}>{person.bio}</p>}
      <div className="chips" style={{ marginTop: "1rem" }}>
        {person.skills.map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
      </div>
      <p className="tiny muted" style={{ marginTop: "1.5rem" }}>
        Member since {new Date(person.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}

export function MessagesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [other, setOther] = useState<PublicUser | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    api.get<{ conversations: Conversation[] }>("/api/messages").then((r) => setConversations(r.conversations)).catch(setError);
  }, [userId]);
  useEffect(() => {
    setOther(null);
    setError(null);
    if (!userId) return;
    api
      .get<{ other: PublicUser }>(`/api/messages/${userId}`)
      .then((r) => setOther(r.other))
      .catch(setError);
  }, [userId]);

  return (
    <div className="sidebar-layout">
      <aside className="card">
        <h3>Conversations</h3>
        {conversations === null && <Spinner />}
        {conversations && conversations.length === 0 && (
          <div className="small muted">
            No conversations yet. Messages open once a <Link to="/people">connection</Link> is accepted.
          </div>
        )}
        <ul className="list">
          {conversations?.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="ghost"
                style={{ width: "100%", justifyContent: "flex-start", textAlign: "left", background: c.other.id === userId ? "#f0ece3" : undefined }}
                onClick={() => navigate(`/messages/${c.other.id}`)}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{c.other.name}</div>
                  <div className="tiny muted" style={{ fontWeight: 400 }}>
                    {c.last_message ? `${c.last_message.slice(0, 48)} · ${timeAgo(c.last_at)}` : "No messages yet"}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="card">
        {!userId && <Empty>Pick a conversation, or start one from a connection's profile.</Empty>}
        {userId && !!error && (
          <div className="stack">
            <ErrorBox error={error} />
            <Link to={`/people/${userId}`}>View profile</Link>
          </div>
        )}
        {userId && other && (
          <>
            <div className="row between" style={{ marginBottom: "0.5rem" }}>
              <div className="row">
                <Avatar name={other.name} veteran={other.veteran_status} />
                <div>
                  <Link to={`/people/${other.id}`} style={{ fontWeight: 600, color: "var(--navy)" }}>
                    {other.name}
                  </Link>
                  <div className="tiny muted">{other.headline}</div>
                </div>
              </div>
              <VeteranBadge status={other.veteran_status} />
            </div>
            <Chat endpoint={`/api/messages/${userId}`} canPost placeholder={`Message ${other.name.split(" ")[0]}`} />
          </>
        )}
      </section>
    </div>
  );
}
