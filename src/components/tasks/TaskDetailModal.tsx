import { useEffect, useState } from "react";
import { errorMessage, listBids } from "../../api";
import type { BidType } from "../../types/bid.types";
import type { TaskType } from "../../../types/task.types";
import { Modal } from "../Modal";
import { complexityLabel, formatDate, labelFor } from "./taskLabels.ts";

export function TaskDetailModal({ task, onClose }: { task: TaskType; onClose: () => void }) {
  const [bids, setBids] = useState<BidType[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listBids(task.id)
      .then((rows) => {
        if (!cancelled) setBids(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load bids."));
      });
    return () => {
      cancelled = true;
    };
  }, [task.id, task.status]);

  return (
    <Modal title={task.title} onClose={onClose} wide>
      <p className="lede">{task.description}</p>
      <dl className="detail-list">
        <dt>Status</dt>
        <dd>{labelFor(task.status)}</dd>
        <dt>Complexity</dt>
        <dd>
          {complexityLabel(task.estimatedComplexity)} ({task.estimatedComplexity})
        </dd>
        <dt>Deadline</dt>
        <dd>{formatDate(task.deadline)}</dd>
        <dt>Created by</dt>
        <dd>{task.createdBy?.name}</dd>
        <dt>Assigned to</dt>
        <dd>{task.assignee?.name ?? "No one yet"}</dd>
        <dt>Created</dt>
        <dd>{formatDate(task.createdAt)}</dd>
      </dl>
      <h3>Bids</h3>
      {error && <p className="error" role="alert">{error}</p>}
      {bids === null && !error ? <p className="muted">Loading bids…</p> : null}
      {bids && bids.length === 0 ? <p className="muted">No bids yet.</p> : null}
      {bids && bids.length > 0 ? (
        <ul className="bids">
          {bids.map((bid) => (
            <li className="bid-row" key={bid.id}>
              <span>User {bid.userId}</span>
              <span>{bid.hoursOffered} h</span>
              <span>{labelFor(bid.status)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Modal>
  );
}
