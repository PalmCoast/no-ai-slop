import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Group, PublicUser } from "../../shared/types";
import { api } from "../api";
import { useAuth } from "../auth";
import { Chat } from "../components/Chat";
import { Empty, ErrorBox, PersonRow, ReportButton, Spinner } from "../components/ui";

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setGroups(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tab === "mine") params.set("mine", "true");
    api.get<{ groups: Group[] }>(`/api/groups?${params}`).then((r) => setGroups(r.groups)).catch(setError);
  }, [q, tab]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const r = await api.post<{ group: Group }>("/api/groups", { name, description, is_private: isPrivate });
      navigate(`/groups/${r.group.slug}`);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="sidebar-layout">
      <aside className="card">
        <h3>Start a group</h3>
        <p className="small muted">A city, a stack, a former unit, a user group. You own it and moderate it.</p>
        {creating ? (
          <form className="form" onSubmit={create}>
            <label className="field">
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={3} />
            </label>
            <label className="field">
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: 80 }} />
            </label>
            <label className="check">
              <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
              <span>
                Private <span className="muted small">(members must be added by an owner or moderator)</span>
              </span>
            </label>
            <ErrorBox error={error} />
            <div className="row">
              <button type="submit">Create</button>
              <button type="button" className="ghost" onClick={() => setCreating(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="gold" type="button" onClick={() => setCreating(true)}>
            New group
          </button>
        )}
      </aside>
      <section>
        <div className="card-title">
          <h1>Groups</h1>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search groups" style={{ maxWidth: 260 }} />
        </div>
        <div className="tabs">
          <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")} type="button">
            Discover
          </button>
          <button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")} type="button">
            My groups
          </button>
        </div>
        {!creating && <ErrorBox error={error} />}
        {groups === null && <Spinner />}
        {groups && groups.length === 0 && <Empty>{tab === "mine" ? "You have not joined a group yet." : "No groups yet. Start the first one."}</Empty>}
        <div className="stack">
          {groups?.map((g) => (
            <Link key={g.id} to={`/groups/${g.slug}`} className="card" style={{ color: "inherit", textDecoration: "none" }}>
              <div className="card-title">
                <h3 style={{ margin: 0 }}>{g.name}</h3>
                <span className="small muted">
                  {g.member_count} {g.member_count === 1 ? "member" : "members"}
                  {g.is_private ? " · private" : ""}
                  {g.my_role ? ` · you are ${g.my_role === "member" ? "a member" : g.my_role}` : ""}
                </span>
              </div>
              {g.description && <p className="muted small" style={{ margin: "0.3rem 0 0" }}>{g.description}</p>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function GroupDetail() {
  const { slug } = useParams();
  const { me } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<(PublicUser & { role: string })[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [showMembers, setShowMembers] = useState(false);

  const load = () =>
    api
      .get<{ group: Group }>(`/api/groups/${slug}`)
      .then((r) => setGroup(r.group))
      .catch(setError);
  useEffect(() => {
    void load();
  }, [slug]);
  useEffect(() => {
    if (!showMembers || !group) return;
    api.get<{ members: (PublicUser & { role: string })[] }>(`/api/groups/${slug}/members`).then((r) => setMembers(r.members));
  }, [showMembers, group?.member_count, slug]);

  const join = async () => {
    const r = await api.post<{ group: Group }>(`/api/groups/${slug}/join`);
    setGroup(r.group);
  };
  const leave = async () => {
    const r = await api.post<{ group?: Group; deleted?: boolean }>(`/api/groups/${slug}/leave`);
    if (r.deleted) navigate("/groups");
    else if (r.group) setGroup(r.group);
  };
  const removeMember = async (userId: string) => {
    await api.post(`/api/groups/${slug}/members`, { user_id: userId, action: "remove" });
    setMembers((m) => m?.filter((x) => x.id !== userId) ?? null);
    void load();
  };

  if (error) return <ErrorBox error={error} />;
  if (!group) return <Spinner />;
  const canModerate = me?.is_admin || group.my_role === "owner" || group.my_role === "moderator";

  return (
    <div className="sidebar-layout">
      <aside className="card">
        <h2>{group.name}</h2>
        <p className="small muted">{group.description || "No description yet."}</p>
        <div className="small muted">
          {group.member_count} {group.member_count === 1 ? "member" : "members"} · {group.is_private ? "Private" : "Public"}
        </div>
        <div className="row" style={{ marginTop: "0.8rem" }}>
          {!group.my_role && !group.is_private && (
            <button className="gold sm" type="button" onClick={() => void join()}>
              Join group
            </button>
          )}
          {group.my_role && (
            <button className="danger sm" type="button" onClick={() => void leave()}>
              {group.my_role === "owner" ? "Leave / delete" : "Leave"}
            </button>
          )}
          <button className="ghost sm" type="button" onClick={() => setShowMembers((s) => !s)}>
            {showMembers ? "Hide members" : "Members"}
          </button>
          <ReportButton type="group" id={group.id} />
        </div>
        {showMembers && (
          <ul className="list" style={{ marginTop: "1rem" }}>
            {members?.map((m) => (
              <PersonRow
                key={m.id}
                person={m}
                action={
                  <div className="row" style={{ gap: "0.3rem" }}>
                    <span className="tiny muted">{m.role}</span>
                    {canModerate && m.role !== "owner" && m.id !== me?.id && (
                      <button className="link tiny" type="button" onClick={() => void removeMember(m.id)}>
                        remove
                      </button>
                    )}
                  </div>
                }
              />
            ))}
          </ul>
        )}
      </aside>
      <section className="card">
        <Chat
          endpoint={`/api/groups/${slug}/messages`}
          canPost={!!group.my_role}
          onDelete={(id) => api.del(`/api/groups/${slug}/messages/${id}`).then(() => undefined)}
          placeholder={`Message ${group.name}`}
        />
      </section>
    </div>
  );
}
