import { Router } from "express";
import type { FilterQuery } from "mongoose";
import Task, { type ITask } from "../models/Task.js";
import auth from "../middleware/auth.js";
import { isTaskStatus, isTaskPriority, type NewTask } from "../types/Task.js";

const router = Router();
router.use(auth);

type TaskInput = Partial<
  Pick<ITask, "title" | "description" | "status" | "priority" | "dueDate">
>;

// Only allow these fields to be set from the client
const pick = (body: Partial<NewTask>): TaskInput => {
  const out: TaskInput = {};
  if (body.title !== undefined) out.title = body.title;
  if (body.description !== undefined) out.description = body.description;
  if (body.status !== undefined) out.status = body.status;
  if (body.priority !== undefined) out.priority = body.priority;
  if (body.dueDate !== undefined) {
    out.dueDate = body.dueDate === null ? null : new Date(body.dueDate);
  }
  return out;
};

// GET /api/tasks?status=todo&priority=high&q=search
router.get("/", async (req, res) => {
  const { status, priority, q } = req.query;
  const filter: FilterQuery<ITask> = { user: req.user._id };

  if (isTaskStatus(status)) filter.status = status;
  if (isTaskPriority(priority)) filter.priority = priority;
  if (typeof q === "string" && q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.title = { $regex: escaped, $options: "i" };
  }

  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.json({ tasks });
});

router.post("/", async (req, res) => {
  const task = await Task.create({ ...pick(req.body), user: req.user._id });
  res.status(201).json({ task });
});

router.put("/:id", async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    pick(req.body),
    { new: true, runValidators: true }
  );
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json({ task });
});

router.delete("/:id", async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json({ message: "Task deleted" });
});

export default router;