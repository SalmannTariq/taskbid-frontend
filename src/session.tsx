import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { listUsers } from "./api";
import type { SessionUser } from "./types/user.types";

const storageKey = "taskbid-user-id";

type Session = {
  users: SessionUser[];
  user: SessionUser | null;
  ready: boolean;
  error: string | null;
  switchUser: (id: number) => void;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listUsers()
      .then((rows) => {
        if (cancelled) return;
        setUsers(rows);
        const saved = Number(localStorage.getItem(storageKey));
        setUser(rows.find((row) => row.id === saved) ?? rows[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setUsers([]);
          setError("Could not load users.");
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function switchUser(id: number) {
    const next = users.find((row) => row.id === id) ?? null;
    setUser(next);
    if (next) localStorage.setItem(storageKey, String(next.id));
  }

  return (
    <SessionContext.Provider value={{ users, user, ready, error, switchUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return session;
}
