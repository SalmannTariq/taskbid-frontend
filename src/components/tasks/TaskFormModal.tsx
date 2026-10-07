import { useState, type FormEvent } from "react";
import { createTask, errorMessage } from "../../api";
import { useSession } from "../../session";
import { Modal } from "../Modal";

export function TaskFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const { user } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [complexity, setComplexity] = useState("3");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    const closesAt = new Date(deadline);
    if (!title.trim() || !description.trim() || !deadline || Number.isNaN(closesAt.getTime())) {
      setError("Title, description, and bid deadline are required.");
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
        deadline: closesAt.toISOString(),
        createdBy: user.id,
      });
      await onCreated();
      onClose();
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not create the task."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New task" onClose={onClose}>
      <form className="side-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label className="field">
          <span>Complexity</span>
          <select value={complexity} onChange={(event) => setComplexity(event.target.value)}>
            <option value="1">1 — Trivial</option>
            <option value="2">2 — Easy</option>
            <option value="3">3 — Moderate</option>
            <option value="4">4 — Complex</option>
            <option value="5">5 — Very COmplex</option>
          </select>
        </label>
        <label className="field">
          <span>Bid deadline</span>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            required
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving…" : "Add task"}
        </button>
      </form>
    </Modal>
  );
}
