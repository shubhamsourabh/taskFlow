import type { NewTask, LoginBody, RegisterBody } from "./types";
const BASE = import.meta.env.VITE_API_URL || "";


const TOKEN_KEY = "taskflow_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t:string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

type RequestOptions = {
  method?: "GET" | "PUT" | "POST" | "DELETE";
  body?: unknown;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request(path:string, { method = "GET", body }:RequestOptions= {}) {
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
  return data;
}

export const api = {
  register: (body:RegisterBody) => request("/auth/register", { method: "POST", body }),
  login: (body:LoginBody) => request("/auth/login", { method: "POST", body }),
  me: () => request("/auth/me"),
  getTasks: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v)
    ).toString();
    return request(`/tasks${qs ? `?${qs}` : ""}`);
  },
  createTask: (body:NewTask) => request("/tasks", { method: "POST", body }),
  updateTask: (id:string, body:Partial<NewTask>) => request(`/tasks/${id}`, { method: "PUT", body }),
  deleteTask: (id:string) => request(`/tasks/${id}`, { method: "DELETE" }),
};
