import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardStats, errorMessage } from "../../api";
import { useSockets } from "../../hooks/useSockets";
import { complexityLabel, labelFor } from "../../components/tasks/taskLabels";
import type { DashboardStats } from "../../types/dashboard.types";

function statusName(status: string) {
  const label = labelFor(status);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

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

  const taskTotal = stats ? stats.tasksByStatus.reduce((sum, item) => sum + item.count, 0) : 0;
  const statusChart = stats
    ? stats.tasksByStatus.map((item) => ({ name: labelFor(item.status), count: item.count }))
    : [];

  return (
    <section className="workspace">
      <header className="queue-head">
        <div>
          <h1>Dashboard</h1>
          <p className="lede">Tasks, bids, and who is getting the work done.</p>
        </div>
      </header>
      {error && <p className="error" role="alert">{error}</p>}
      {!stats && !error ? <p className="muted">Loading dashboard…</p> : null}
      {stats ? (
        <div className="dash-grid">
                   <article className="dash-card">
            <h2>Average bid by complexity</h2>
            <ul className="plain-list">
              {stats.averageBidByComplexity.map((item) => (
                <li key={item.complexity}>
                  <span>{complexityLabel(item.complexity)} ({item.complexity})</span>
                  <strong>{item.averageBid == null ? "No bids" : `${item.averageBid} h`}</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="dash-card">
            <h2>Top 3 by tasks completed</h2>
            {stats.topUsers.length === 0 ? <p className="muted">No completed tasks yet.</p> : null}
            <ol className="plain-list">
              {stats.topUsers.map((user) => (
                <li key={user.id}>
                  <span>{user.name}</span>
                  <strong>{user.completedTasks}</strong>
                </li>
              ))}
            </ol>
          </article>

          <article className="dash-card">
            <h2>No bids, deadline passed</h2>
            {stats.tasksWithZeroBids.every((item) => item.count === 0) ? (
              <p className="muted">None right now.</p>
            ) : (
              <ul className="plain-list">
                {stats.tasksWithZeroBids.map((item) => (
                  <li key={item.complexity}>
                    <span>{complexityLabel(item.complexity)} ({item.complexity})</span>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            )}
          </article>
          <article className="dash-card">
            <h2>Tasks by status</h2>
            <p className="muted">{taskTotal} total</p>
            <ul className="plain-list">
              {stats.tasksByStatus.map((item) => (
                <li key={item.status}>
                  <span>{statusName(item.status)}</span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="dash-card dash-wide">
            <h2>Tasks by status</h2>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChart} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid stroke="#e6e6e6" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "#5c5c5c", fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={108} tick={{ fill: "#5c5c5c", fontSize: 12 }} />
                  <Tooltip cursor={{ fill: "#f3fbf8" }} />
                  <Bar dataKey="count" name="Tasks" fill="#1f4b3a" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
