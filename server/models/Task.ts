import mongoose, { Schema, Types } from "mongoose";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  type TaskStatus,
  type TaskPriority,
} from "../types/Task.js";

export interface ITask {
  user: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    status: { type: String, enum: [...TASK_STATUSES], default: "todo" },
    priority: { type: String, enum: [...TASK_PRIORITIES], default: "medium" },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>("Task", taskSchema);