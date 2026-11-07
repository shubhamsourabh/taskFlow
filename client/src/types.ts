export const TASK_STATUSES = ["todo", "in-progress", "done"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Task {
  _id: string;
  user: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}


export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody extends LoginBody {
  name: string;
}
// What the client sends when creating: only title is required
export type NewTask = Pick<Task, "title"> &
  Partial<Pick<Task, "description" | "status" | "priority" | "dueDate">>;

export type TaskSummary = Pick<
  Task,
  "_id" | "title" | "status" | "priority" | "dueDate"
>;

export const isTaskStatus = (v: unknown): v is TaskStatus =>
  (TASK_STATUSES as readonly string[]).includes(v as string);

export const isTaskPriority = (v: unknown): v is TaskPriority =>
  (TASK_PRIORITIES as readonly string[]).includes(v as string);