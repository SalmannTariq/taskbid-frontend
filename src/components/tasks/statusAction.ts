import type { TaskType } from "../../../types/task.types";

export function nextAction(task: TaskType, userId: number) {
  const creator = Number(task.createdBy?.id) === userId;
  const assignee = Number(task.assignee?.id) === userId;
  if (task.status === "draft" && creator) return { label: "Open task", run: "status" as const, status: "open" };
  if (task.status === "open" && creator) return { label: "Close bidding", run: "status" as const, status: "bidding_closed" };
  if (task.status === "bidding_closed" && creator) return { label: "Assign task", run: "assign" as const, status: "" };
  if (task.status === "assigned" && assignee) return { label: "Start work", run: "status" as const, status: "in_progress" };
  if (task.status === "in_progress" && assignee) return { label: "Send to review", run: "status" as const, status: "review" };
  if (task.status === "review" && creator) return { label: "Mark done", run: "status" as const, status: "done" };
  return null;
}
