import { useState } from "react";
import type { NewTask ,TaskPriority } from "../types";
import type { ChangeEvent, SubmitEvent } from "react";

interface FormState {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

const empty:FormState = { title: "", description: "", priority: "medium", dueDate: "" };

interface TaskFormProps {
  onCreate: (task: NewTask) => Promise<void> ;
}

export default function TaskForm({ onCreate }:TaskFormProps) {
  const [form, setForm] = useState<FormState>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onCreate({ ...form, dueDate: form.dueDate || null });
      setForm(empty);
    } catch (err) {
      if(err instanceof Error)
      setError(err.message);
    else{
       setError("Something went wrong");
    } 
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="task-form" onSubmit={onSubmit}>
      <input name="title" placeholder="What needs to be done?" value={form.title} onChange={onChange} maxLength={120} required />
      <input name="description" placeholder="Details (optional)" value={form.description} onChange={onChange} maxLength={1000} />
      <div className="row">
        <select name="priority" value={form.priority} onChange={onChange} aria-label="Priority">
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <input name="dueDate" type="date" value={form.dueDate} onChange={onChange} aria-label="Due date" />
        <button className="btn" disabled={busy}>{busy ? "Adding…" : "Add task"}</button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
