import axios, { isAxiosError } from "axios";
import type { BidType } from "./types/bid.types";
import type { DashboardStats } from "./types/dashboard.types";
import type { CreateTaskInput, TaskType } from "./types/task.types";
import type { SessionUser, Workload } from "./types/user.types";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;


const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export async function listUsers() {
  const response = await client.get<SessionUser[]>("/users");
  return response.data;
}

export async function listTasks() {
  const response = await client.get<TaskType[]>("/tasks");
  return response.data;
}

export async function createTask(task: CreateTaskInput) {
  const response = await client.post<TaskType>("/tasks", task);
  return response.data;
}

export async function updateTaskStatus(taskId: number, status: string, changedBy: number) {
  const response = await client.patch<TaskType>(`/tasks/${taskId}/status`, { status, changedBy });
  return response.data;
}

export async function assignTask(taskId: number, changedBy: number) {
  const response = await client.post(`/tasks/${taskId}/assign`, { changedBy });
  return response.data;
}

export async function userWorkload(userId: number) {
  const response = await client.get<Workload>(`/users/${userId}/workload`);
  return response.data;
}

export async function placeBid(taskId: number, userId: number, hoursOffered: number) {
  const response = await client.post<BidType>(`/tasks/${taskId}/bids`, { userId, hoursOffered });
  return response.data;
}

export async function listBids(taskId: number) {
  const response = await client.get<BidType[]>(`/tasks/${taskId}/bids`);
  return response.data;
}

export async function dashboardStats() {
  const response = await client.get<DashboardStats>("/dashboard/stats");
  return response.data;
}

export function errorMessage(err: unknown, fallback: string) {
  if (isAxiosError(err)) {
    const data: unknown = err.response?.data;
    if (data && typeof data === "object") {
      if ("message" in data && typeof data.message === "string") return data.message;
      if ("error" in data && typeof data.error === "string") return data.error;
    }
  }
  return fallback;
}
