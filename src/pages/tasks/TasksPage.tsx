import { useEffect, useMemo, useRef, useState } from "react";
import { errorMessage, listTasks } from "../../api";
import { useSockets } from "../../hooks/useSockets";
import { TaskDetailModal } from "../../components/tasks/TaskDetailModal";
import { TaskFormModal } from "../../components/tasks/TaskFormModal";
import { complexityLabel, complexityTone, formatDateTime, labelFor } from "../../components/tasks/taskLabels";
import { useSession } from "../../session";
import type { TaskType } from "../../types/task.types";

const columns = [
  { status: "draft", label: "Draft", tone: "pink" },
  { status: "open", label: "Open", tone: "peach" },
  { status: "bidding_closed", label: "Bidding closed", tone: "sky" },
  { status: "assigned", label: "Assigned", tone: "mint" },
  { status: "in_progress", label: "In progress", tone: "peach" },
  { status: "review", label: "In review", tone: "sky" },
  { status: "done", label: "Done", tone: "lilac" },
];

const hiddenStatuses = new Set(["completed", "cancelled"]);

export function TasksPage() {
  const { user } = useSession();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<TaskType | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

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

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return tasks.filter((task) => {
      if (hiddenStatuses.has(task.status)) return false;
      if (!text) return true;
      return task.title.toLowerCase().includes(text);
    });
  }, [tasks, query]);

  const board = useMemo(() => {
    const known = new Set(columns.map((column) => column.status));
    const extra = [...new Set(visible.map((task) => task.status).filter((status) => !known.has(status) && !hiddenStatuses.has(status)))];
    return [
      ...columns,
      ...extra.map((status) => ({ status, label: labelFor(status), tone: "gray" })),
    ];
  }, [visible]);

  async function refresh(keepId?: number) {
    const rows = await listTasks();
    setTasks(rows);
    if (keepId != null) {
      setSelected(rows.find((task) => task.id === keepId) ?? null);
    }
  }

  useSockets(() => {
    void refresh(selectedRef.current?.id).catch((err: unknown) => {
      setError(errorMessage(err, "Could not load tasks."));
    });
  });

  return (
    <section className="workspace">
      <header className="queue-head">
        <div>
          <h1>Task queue</h1>
          <p className="lede">Each status has its own column.</p>
        </div>
        <div className="queue-tools">
          <input
            className="search"
            value={query}
            placeholder="Search task"
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="button" className="btn add-btn" onClick={() => setAdding(true)}>
            + Add task
          </button>
        </div>
      </header>

      {error && <p className="error" role="alert">{error}</p>}
      {loading ? <p className="muted">Loading tasks…</p> : null}

      <div className="board">
        {board.map((column) => {
          const items = visible.filter((task) => task.status === column.status);
          return (
            <section className={`lane lane-${column.tone}`} key={column.status}>
              <header>
                <h2>{column.label}</h2>
                <span>{items.length}</span>
              </header>
              {items.length === 0 ? <p className="lane-empty">No tasks</p> : null}
              {items.map((task) => (
                <article className="queue-card" key={task.id}>
                  <button type="button" className="card-open" onClick={() => setSelected(task)}>
                    <span className={`chip chip-${complexityTone(task.estimatedComplexity)}`}>
                      {complexityLabel(task.estimatedComplexity)}
                    </span>
                    <h3>{task.title}</h3>
                    <p className="meta"> Total bids: {task.bidCount}</p>
                    <p className="meta">
                      {task.lowestBid == null ? "Lowest bid: none" : `Lowest bid : ${task.lowestBid} h`}
                    </p>
                    <p className="meta">Bid deadline {formatDateTime(task.deadline)}</p>
                    <p className="creator">Created by : {task.createdBy?.name}</p>
                  </button>
                </article>
              ))}
            </section>
          );
        })}
      </div>

      {adding ? <TaskFormModal onClose={() => setAdding(false)} onCreated={refresh} /> : null}
      {selected && user ? (
        <TaskDetailModal
          task={selected}
          userId={user.id}
          onClose={() => setSelected(null)}
          onBidPlaced={() => refresh(selected.id)}
        />
      ) : null}
    </section>
  );
}
