import axios, { isAxiosError } from "axios";
import type { BidType } from "./types/bid.types";
import type { DashboardStats } from "./types/dashboard.types";
import type { CreateTaskInput, TaskType } from "./types/task.types";
import type { UserType, SessionUser, Workload } from "./types/user.types";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;


const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export async function register(user: UserType) {
  const response = await client.post<{ message: string; user: SessionUser }>("/auth/register", {
    name: user.name,
    email: user.email,
    password: user.password,
    hourly_rate: user.hourlyRate,
    max_capacity_hours: user.maxHours,
  });
  return response.data;
}

export async function login(email: string, password: string) {
  const response = await client.post<SessionUser>("/auth/login", { email, password });
  return response.data;
}

export async function logout() {
  const response = await client.post<{ message: string }>("/auth/logout");
  return response.data;
}

export async function currentUser() {
  try {
    const response = await client.get<SessionUser>("/auth/me");
    return response.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401) return null;
    throw err;
  }
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
