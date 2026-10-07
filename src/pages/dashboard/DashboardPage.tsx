import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardStats, errorMessage } from "../../api";
import { useSockets } from "../../hooks/useSockets";
import { labelFor } from "../../components/tasks/taskLabels";
import type { DashboardStats } from "../../types/dashboard.types";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    dashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load the dashboard."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useSockets(() => {
    dashboardStats()
      .then(setStats)
      .catch((err: unknown) => setError(errorMessage(err, "Could not load the dashboard.")));
  });

  const taskBars = stats
    ? Object.entries(stats.tasks)
        .filter(([key]) => key !== "total" && key !== "completed" && key !== "cancelled")
        .map(([status, count]) => ({ name: labelFor(status), count }))
    : [];

  return (
    <section className="workspace">
      <header className="queue-head">
        <div>
          <h1>Dashboard</h1>
          <p className="lede">Tasks, bids, and capacity across the team.</p>
        </div>
      </header>
      {error && <p className="error" role="alert">{error}</p>}
      {!stats && !error ? <p className="muted">Loading dashboard…</p> : null}
      {stats ? (
        <>
          <div className="stats">
            <article>
              <span>Tasks</span>
              <strong>{stats.tasks.total ?? 0}</strong>
            </article>
            <article>
              <span>Bids</span>
              <strong>{stats.bids.total ?? 0}</strong>
            </article>
            <article>
              <span>People</span>
              <strong>{stats.users.total}</strong>
            </article>
            <article>
              <span>Hours left</span>
              <strong>{stats.users.totalRemainingCapacityHours}</strong>
            </article>
          </div>
          <div className="chart-card">
            <h2>Tasks by status</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={taskBars}>
                <CartesianGrid stroke="#e6e6e6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} width={32} />
                <Tooltip />
                <Bar dataKey="count" fill="#1f4b3a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : null}
    </section>
  );
}
