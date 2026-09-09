import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { Message } from "../../shared/types";
import { api, timeAgo } from "../api";
import { useAuth } from "../auth";
import { ErrorBox, ReportButton, VeteranBadge } from "./ui";

interface Props {
  /** Endpoint that returns { messages } and accepts POST { body }. */
  endpoint: string;
  canPost: boolean;
  onDelete?: (id: number) => Promise<void>;
  placeholder?: string;
}

const POLL_MS = 3000;

export function Chat({ endpoint, canPost, onDelete, placeholder = "Write a message…" }: Props) {
  const { me } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [loaded, setLoaded] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const lastId = useRef(0);

  const scrollToEnd = () => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const poll = useCallback(async () => {
    try {
      const r = await api.get<{ messages: Message[] }>(`${endpoint}?after=${lastId.current}`);
      if (r.messages.length) {
        lastId.current = r.messages[r.messages.length - 1]!.id;
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          return [...prev, ...r.messages.filter((m) => !seen.has(m.id))];
        });
        setTimeout(scrollToEnd, 0);
      }
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoaded(true);
    }
  }, [endpoint]);

  useEffect(() => {
    lastId.current = 0;
    setMessages([]);
    setLoaded(false);
    void poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [poll]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    try {
      const r = await api.post<{ message: Message }>(endpoint, { body });
      setMessages((prev) => (prev.some((m) => m.id === r.message.id) ? prev : [...prev, r.message]));
      lastId.current = Math.max(lastId.current, r.message.id);
      setTimeout(scrollToEnd, 0);
    } catch (err) {
      setError(err);
      setDraft(body);
    }
  };

  const remove = async (id: number) => {
    if (!onDelete) return;
    await onDelete(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="chat">
      <div className="chat-log" ref={logRef}>
        {!loaded && <div className="spinner">Loading messages…</div>}
        {loaded && messages.length === 0 && <div className="empty">No messages yet. Say hello.</div>}
        {messages.map((m) => {
          const mine = m.sender_id === me?.id;
          return (
            <div key={m.id} className={`msg ${mine ? "mine" : ""}`}>
              <div className="who">
                <b>{mine ? "You" : m.sender_name}</b>
                <VeteranBadge status={m.sender_veteran} />
                <span>{timeAgo(m.created_at)}</span>
                {onDelete && (mine || me?.is_admin) && (
                  <button type="button" className="link tiny" onClick={() => void remove(m.id)}>
                    delete
                  </button>
                )}
                {!mine && <ReportButton type="message" id={m.id} />}
              </div>
              <div className="bubble">{m.body}</div>
            </div>
          );
        })}
      </div>
      <ErrorBox error={error} />
      {canPost ? (
        <form className="chat-compose" onSubmit={send}>
          <textarea
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(e);
              }
            }}
          />
          <button type="submit" disabled={!draft.trim()}>
            Send
          </button>
        </form>
      ) : (
        <div className="small muted" style={{ paddingTop: "0.75rem" }}>
          Join this group to post.
        </div>
      )}
    </div>
  );
}
