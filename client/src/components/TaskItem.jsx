const NEXT = { todo: "in-progress", "in-progress": "done", done: "todo" };
const LABEL = { todo: "To do", "in-progress": "In progress", done: "Done" };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function TaskItem({ task, onUpdate, onDelete }) {
  const overdue =
    task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <li className={`task ${task.status}`}>
      <div className="task-main">
        <h3>{task.title}</h3>
        {task.description && <p className="muted">{task.description}</p>}
        <div className="meta">
          <span className={`pill ${task.priority}`}>{task.priority}</span>
          {task.dueDate && (
            <span className={`due ${overdue ? "overdue" : ""}`}>
              Due {formatDate(task.dueDate)}{overdue ? " (overdue)" : ""}
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button
          className={`status ${task.status}`}
          onClick={() => onUpdate(task._id, { status: NEXT[task.status] })}
          title="Click to move to the next status"
        >
          {LABEL[task.status]}
        </button>
        <button className="icon danger" onClick={() => onDelete(task._id)} aria-label="Delete task">
          ✕
        </button>
      </div>
    </li>
  );
}
