import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { errorMessage, logout } from "../api";
import { useSockets } from "../hooks/useSockets";
import { useSession } from "../session";
import { Brand } from "./Field";

export function AdminShell() {
  const { user, signOut } = useSession();
  useSockets();
  const [error, setError] = useState<string | null>(null);

  async function onSignOut() {
    try {
      await logout();
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not sign out."));
      return;
    }
    signOut();
  }

  return (
    <div className="admin">
      <aside className="sidebar">
        <Brand />
        <nav className="side-nav" aria-label="Main">
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className={navClass}>
            Task queue
          </NavLink>
        </nav>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="side-user">
          <strong>{user?.name ?? user?.email}</strong>
          <button type="button" className="text-btn" onClick={() => void onSignOut()}>
            Sign out
          </button>
        </div>
      </aside>
      <Outlet />
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "side-link active" : "side-link";
}
