import { NavLink, Outlet } from "react-router-dom";
import { useSockets } from "../hooks/useSockets";
import { useSession } from "../session";
import { Brand } from "./Field";

export function AdminShell() {
  const { users, user, ready, error, switchUser } = useSession();
  useSockets();

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
        <label className="field side-user">
          <span>Acting as</span>
          <select
            value={user ? String(user.id) : ""}
            disabled={!ready || users.length === 0}
            onChange={(event) => switchUser(Number(event.target.value))}
          >
            {users.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="error" role="alert">{error}</p>}
      </aside>
      <Outlet />
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "side-link active" : "side-link";
}
