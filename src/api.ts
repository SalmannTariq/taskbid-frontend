import axios, { isAxiosError } from "axios";
import type { CreateTaskInput, TaskType } from "../types/task.types";
import type { UserType, SessionUser } from "../types/user.types";

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
