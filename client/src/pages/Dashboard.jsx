import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ status: "", priority: "", q: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const d = await api.getTasks(filters);
      setTasks(d.tasks);
    } catch (err) {
      if (err.status === 401) logout();
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, logout]);

  // Debounce so typing in search doesn't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function createTask(body) {
    const d = await api.createTask(body);
    setTasks((prev) => [d.task, ...prev]);
  }

  async function updateTask(id, body) {
    try {
      const d = await api.updateTask(id, body);
      setTasks((prev) => prev.map((t) => (t._id === id ? d.task : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(id) {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const setFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const count = (s) => tasks.filter((t) => t.status === s).length;

  return (
    <div className="app">
      <header className="topbar">
        <h1>TaskFlow</h1>
        <div className="user">
          <span className="muted">{user.name}</span>
          <button className="btn ghost" onClick={logout}>Log out</button>
        </div>
      </header>

      <main>
        <section className="stats">
          <div><strong>{count("todo")}</strong><span>To do</span></div>
          <div><strong>{count("in-progress")}</strong><span>In progress</span></div>
          <div><strong>{count("done")}</strong><span>Done</span></div>
        </section>

        <TaskForm onCreate={createTask} />

        <section className="filters">
          <input name="q" placeholder="Search tasks…" value={filters.q} onChange={setFilter} />
          <select name="status" value={filters.status} onChange={setFilter} aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
          <select name="priority" value={filters.priority} onChange={setFilter} aria-label="Filter by priority">
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </section>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="center muted">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="center muted">No tasks found. Add your first one above.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((t) => (
              <TaskItem key={t._id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
