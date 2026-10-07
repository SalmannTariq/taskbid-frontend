import { useEffect, useState } from "react";
import { dashboardStats, errorMessage } from "../../api";
import { useSockets } from "../../hooks/useSockets";
import { complexityLabel, formatDateTime, labelFor } from "../../components/tasks/taskLabels";
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

  const largest = stats ? Math.max(1, ...stats.tasksByStatus.map((item) => item.count)) : 1;
  const taskTotal = stats ? stats.tasksByStatus.reduce((sum, item) => sum + item.count, 0) : 0;

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
            <h2>Tasks by status</h2>
            <p className="muted">{taskTotal} total</p>
            <ul className="status-list">
              {stats.tasksByStatus.map((item) => (
                <li key={item.status}>
                  <span>{labelFor(item.status)}</span>
                  <span className="status-track" aria-hidden="true">
                    <span style={{ width: `${(item.count / largest) * 100}%` }} />
                  </span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          </article>

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
            {stats.tasksWithZeroBids.length === 0 ? <p className="muted">None right now.</p> : null}
            <ul className="plain-list">
              {stats.tasksWithZeroBids.map((task) => (
                <li key={task.id}>
                  <span>
                    {task.title}
                    <small>{labelFor(task.status)} · {formatDateTime(task.deadline)}</small>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      ) : null}
    </section>
  );
}
