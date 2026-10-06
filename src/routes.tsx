import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminShell } from "./components/AdminShell";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { SignInPage } from "./pages/signin/SignInPage";
import { SignUpPage } from "./pages/signup/SignUpPage";
import { TasksPage } from "./pages/tasks/TasksPage";
import { useSession } from "./session";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/signin" element={<GuestOnly><SignInPage /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><SignUpPage /></GuestOnly>} />
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route element={<RequireAuth><AdminShell /></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  );
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user, ready } = useSession();
  if (!ready) return <p className="muted">Loading…</p>;
  if (user) return <Navigate to="/tasks" replace />;
  return children;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useSession();
  if (!ready) return <p className="muted">Loading…</p>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}
