import {type Task, type NewTask, type LoginBody, type RegisterBody,type TaskStatus,type TaskPriority, type AuthResponse, UserResponse, TaskResponse, MessageResponse } from "./types";
type TasksResponse = { tasks: Task[] };
const BASE = import.meta.env.VITE_API_URL || "";


const TOKEN_KEY = "taskflow_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t:string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

type RequestOptions = {
  method?: "GET" | "PUT" | "POST" | "DELETE";
  body?: unknown;
};

type TaskFilters = {
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
  q?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path:string, { method = "GET", body }:RequestOptions= {}) :Promise<T>{
  const headers:Record<string,string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
   throw new ApiError(data.error || "Request failed", res.status);
  }
  return data as T;
}

export const api = {
  register: (body:RegisterBody) => request<AuthResponse>("/auth/register", { method: "POST", body }),
  login: (body:LoginBody) => request<AuthResponse>("/auth/login", { method: "POST", body }),
  me: () => request<UserResponse>("/auth/me"),
 getTasks: (params: TaskFilters = {}) => {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.priority) qs.set("priority", params.priority);
  if (params.q) qs.set("q", params.q);
  const query = qs.toString();
  return request<TasksResponse>(`/tasks${query ? `?${query}` : ""}`);
},
  createTask: (body:NewTask) => request<TaskResponse>("/tasks", { method: "POST", body }),
  updateTask: (id:string, body:Partial<NewTask>) => request<TaskResponse>(`/tasks/${id}`, { method: "PUT", body }),
  deleteTask: (id:string) => request<MessageResponse>(`/tasks/${id}`, { method: "DELETE" }),
};
