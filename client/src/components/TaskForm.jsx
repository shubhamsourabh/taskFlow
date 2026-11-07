import { useState } from "react";

const empty = { title: "", description: "", priority: "medium", dueDate: "" };

export default function TaskForm({ onCreate }) {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onCreate({ ...form, dueDate: form.dueDate || null });
      setForm(empty);
    } catch (err) {
      setError(err.message);
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
