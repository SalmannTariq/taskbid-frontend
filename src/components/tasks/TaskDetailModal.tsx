import { useEffect, useState, type FormEvent } from "react";
import { assignTask, errorMessage, listBids, placeBid, updateTaskStatus, userWorkload } from "../../api";
import { useSockets } from "../../hooks/useSockets";
import type { BidType } from "../../types/bid.types";
import type { TaskType } from "../../types/task.types";
import type { Workload } from "../../types/user.types";
import { Modal } from "../Modal";
import { nextAction } from "./statusAction";
import { complexityLabel, formatDate, formatDateTime, labelFor } from "./taskLabels.ts";

export function TaskDetailModal({
  task,
  userId,
  onClose,
  onBidPlaced,
}: {
  task: TaskType;
  userId: number;
  onClose: () => void;
  onBidPlaced: () => Promise<void>;
}) {
  const [bids, setBids] = useState<BidType[] | null>(null);
  const [workload, setWorkload] = useState<Workload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState("");
  const [bidError, setBidError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const action = nextAction(task, userId);
  const alreadyBid = bids?.some((bid) => bid.userId === userId) ?? false;
  const canBid = task.status === "open" && Number(task.createdBy?.id) !== userId && !alreadyBid;
  const remaining = workload?.remainingCapacity ?? 0;

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

  useSockets(() => {
    listBids(task.id)
      .then(setBids)
      .catch((err: unknown) => setError(errorMessage(err, "Could not load bids.")));
    if (task.status === "open" && Number(task.createdBy?.id) !== userId) {
      userWorkload(userId)
        .then(setWorkload)
        .catch((err: unknown) => setBidError(errorMessage(err, "Could not load your capacity.")));
    }
  });

  useEffect(() => {
    if (!canBid) return;
    let cancelled = false;
    userWorkload(userId)
      .then((row) => {
        if (!cancelled) setWorkload(row);
      })
      .catch((err: unknown) => {
        if (!cancelled) setBidError(errorMessage(err, "Could not load your capacity."));
      });
    return () => {
      cancelled = true;
    };
  }, [canBid, userId]);

  function onHoursChange(value: string) {
    if (value === "") {
      setHours("");
      setBidError(null);
      return;
    }
    const next = Number(value);
    if (Number.isFinite(next) && next > remaining) {
      setBidError(`You can offer at most ${remaining} hours.`);
      return;
    }
    setHours(value);
    setBidError(null);
  }

  async function onBid(event: FormEvent) {
    event.preventDefault();
    const hoursOffered = Number(hours);
    if (!Number.isFinite(hoursOffered) || hoursOffered <= 0) {
      setBidError("Hours must be greater than 0.");
      return;
    }

    setSaving(true);
    setBidError(null);
    try {
      const latest = await userWorkload(userId);
      setWorkload(latest);
      if (hoursOffered > latest.remainingCapacity) {
        setBidError(`Your remaining capacity is now ${latest.remainingCapacity} hours. Offer that amount or less.`);
        return;
      }
      await placeBid(task.id, userId, hoursOffered);
      setHours("");
      setBids(await listBids(task.id));
      setWorkload(await userWorkload(userId));
      await onBidPlaced();
    } catch (err: unknown) {
      const latest = await userWorkload(userId).catch(() => null);
      if (latest) setWorkload(latest);
      setBidError(errorMessage(err, "Could not place the bid."));
    } finally {
      setSaving(false);
    }
  }

  async function onAdvance() {
    if (!action) return;
    setStatusSaving(true);
    setStatusError(null);
    try {
      if (action.run === "assign") {
        await assignTask(task.id, userId);
      } else {
        await updateTaskStatus(task.id, action.status, userId);
      }
      await onBidPlaced();
    } catch (err: unknown) {
      setStatusError(errorMessage(err, "Could not update the status."));
    } finally {
      setStatusSaving(false);
    }
  }

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
        <dt>Bid deadline</dt>
        <dd>{formatDateTime(task.deadline)}</dd>
        <dt>Created by</dt>
        <dd>{task.createdBy?.name}</dd>
        <dt>Assigned to</dt>
        <dd>{task.assignee?.name ?? "No one yet"}</dd>
        <dt>Created</dt>
        <dd>{formatDate(task.createdAt)}</dd>
        <dt>Bids</dt>
        <dd>{task.bidCount}</dd>
        <dt>Lowest bid</dt>
        <dd>{task.lowestBid == null ? "None" : `${task.lowestBid} h`}</dd>
      </dl>
      {action ? (
        <button type="button" className="btn" disabled={statusSaving} onClick={() => void onAdvance()}>
          {statusSaving ? "Saving…" : action.label}
        </button>
      ) : null}
      {statusError && <p className="error" role="alert">{statusError}</p>}
      <h3>Bids</h3>
      {canBid ? (
        <form className="bid-form" onSubmit={(event) => void onBid(event)}>
          {workload ? (
            <dl className="capacity">
              <dt>Max capacity</dt>
              <dd>{workload.maxCapacityHours} h</dd>
              <dt>Current workload</dt>
              <dd>{workload.currentWorkload} h</dd>
              <dt>Remaining</dt>
              <dd>{workload.remainingCapacity} h</dd>
            </dl>
          ) : (
            <p className="muted">Loading your capacity…</p>
          )}
          <label className="field">
            <span>Hours offered</span>
            <input
              type="number"
              min="0.01"
              max={remaining > 0 ? remaining : 0}
              step="0.01"
              value={hours}
              disabled={!workload || remaining <= 0}
              onChange={(event) => onHoursChange(event.target.value)}
            />
          </label>
          {workload && remaining <= 0 ? <p className="error">You have no hours left to offer.</p> : null}
          {bidError && <p className="error" role="alert">{bidError}</p>}
          <button type="submit" className="btn" disabled={saving || !workload || remaining <= 0}>
            {saving ? "Saving…" : "Place bid"}
          </button>
        </form>
      ) : null}
      {error && <p className="error" role="alert">{error}</p>}
      {bids === null && !error ? <p className="muted">Loading bids…</p> : null}
      {bids && bids.length === 0 ? <p className="muted">No bids yet.</p> : null}
      {bids && bids.length > 0 ? (
        <ul className="bids">
          {bids.map((bid) => (
            <li className="bid-row" key={bid.id}>
              <span>{bid.userName || `User ${bid.userId}`}</span>
              <span>{bid.hoursOffered} h</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Modal>
  );
}
