import { useEffect, useState, type FormEvent } from "react";
import { createTask, errorMessage, listTasks, logout } from "../../api";
import { Brand } from "../../components/Field";
import { useSession } from "../../session";
import type { TaskType } from "../../../types/task.types";

export function TasksPage() {
  const { user, signOut } = useSession();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [complexity, setComplexity] = useState("3");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listTasks()
      .then((rows) => {
        if (!cancelled) setTasks(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load tasks."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    if (!title.trim() || !description.trim() || !deadline) {
      setError("Title, description, and deadline are required.");
      return;
    }
    const estimatedComplexity = Number(complexity);
    if (!Number.isInteger(estimatedComplexity) || estimatedComplexity < 1 || estimatedComplexity > 5) {
      setError("Complexity must be from 1 to 5.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        estimatedComplexity,
        deadline: new Date(`${deadline}T00:00:00`).toISOString(),
        createdBy: user.id,
      });
      setTasks(await listTasks());
      setTitle("");
      setDescription("");
      setDeadline("");
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not create the task."));
    } finally {
      setSaving(false);
    }
  }

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
    <section className="tasks">
      <header className="tasks-head">
        <Brand />
        <button type="button" className="text-btn" onClick={() => void onSignOut()}>
          Sign out
        </button>
      </header>
      <h1>Tasks</h1>
      <p className="lede">Add a task, then see every task already saved.</p>

      <form className="panel" onSubmit={onSubmit}>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <div className="row">
          <label className="field">
            <span>Complexity</span>
            <select value={complexity} onChange={(event) => setComplexity(event.target.value)}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>
          <label className="field">
            <span>Deadline</span>
            <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
          </label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving…" : "Add task"}
        </button>
      </form>

      {loading ? <p className="muted">Loading tasks…</p> : null}
      {!loading && tasks.length === 0 ? <p className="muted">No tasks yet.</p> : null}
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id}>
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            <p className="meta">
              {task.status} · Complexity {task.estimatedComplexity} · Due {formatDate(task.deadline)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
