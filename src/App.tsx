import { useEffect, useState } from "react";
import { currentUser, logout } from "./api";
import { AppShell } from "./components/layout/AppShell";
import { AccountPage } from "./pages/AccountPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { TaskBoardPage } from "./pages/TaskBoardPage";
import { TaskDetailPage } from "./pages/TaskDetailPage";
import { navigate, replace, usePath } from "./router";
import type { SessionUser } from "../types/user.types";

export default function App() {
  const path = usePath();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const taskId = path.startsWith("/tasks/") ? path.slice("/tasks/".length) : null;
  const isAuthPath = path === "/signin" || path === "/signup";

  useEffect(() => {
    let cancelled = false;
    currentUser()
      .then((session) => {
        if (!cancelled) setUser(session);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (user && isAuthPath) replace("/");
  }, [ready, user, isAuthPath]);

  function onSuccess(session: SessionUser) {
    setUser(session);
    navigate("/");
  }

  async function onSignOut() {
    try {
      await logout();
    } catch {
      // The sample screens stay available either way.
    }
    setUser(null);
  }

  if (isAuthPath) {
    return (
      <main className="page">
        {!ready || user ? (
          <p className="muted">Loading…</p>
        ) : path === "/signin" ? (
          <SignInPage onSuccess={onSuccess} />
        ) : (
          <SignUpPage onSuccess={onSuccess} />
        )}
      </main>
    );
  }

  let page = <TaskBoardPage />;
  if (path === "/dashboard") page = <DashboardPage />;
  else if (taskId) page = <TaskDetailPage id={taskId} />;
  else if (path === "/account" && user) {
    page = <AccountPage user={user} onSignOut={() => void onSignOut()} />;
  }

  return (
    <AppShell path={path} user={user} onSignOut={() => void onSignOut()}>
      {page}
    </AppShell>
  );
}
