import { useState } from "react";
import { formatDate } from "../utils/formatters";
import "./Todos.css";

interface Todo {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  completedDate?: string;
  doneBy?: "Me" | "AI";
}

export const dummyTodos: Todo[] = [
  {
    id: 1,
    title: "Follow up with Client A",
    description: "Send final invoice and payment reminder",
    dueDate: "2025-01-20",
    priority: "high",
    status: "todo",
  },
  {
    id: 2,
    title: "Review Q1 expenses",
    description: "Categorize and verify all transactions for tax purposes",
    dueDate: "2025-01-25",
    priority: "medium",
    status: "in-progress",
  },
  {
    id: 3,
    title: "Prepare quarterly tax report",
    description: "Compile all financial documents for tax filing",
    dueDate: "2025-01-31",
    priority: "high",
    status: "todo",
  },
  {
    id: 4,
    title: "Update portfolio website",
    description: "Add recent projects and testimonials",
    dueDate: "2025-02-05",
    priority: "low",
    status: "todo",
  },
  {
    id: 5,
    title: "Send invoice to Client B",
    description: "Invoice for consulting services delivered in December",
    dueDate: "2025-01-18",
    priority: "high",
    status: "completed",
  },
  {
    id: 6,
    title: "Renew software subscriptions",
    description: "Check which subscriptions expire this month",
    dueDate: "2025-01-22",
    priority: "medium",
    status: "in-progress",
  },
  {
    id: 7,
    title: "Schedule client meetings",
    description: "Set up Q1 check-in meetings with active clients",
    dueDate: "2025-01-28",
    priority: "medium",
    status: "todo",
  },
  {
    id: 8,
    title: "Backup financial records",
    description: "Create encrypted backup of all financial documents",
    dueDate: "2025-02-01",
    priority: "low",
    status: "completed",
  },
];

// Get count of "Expected invoices" todos (non-completed items)
export const getForMeTodosCount = () => {
  return dummyTodos.filter((todo) => todo.status !== "completed").length;
};

const historyTodos: Todo[] = [
  {
    id: 101,
    title: "Submit annual tax return",
    description: "Filed 2024 tax return with all supporting documents",
    dueDate: "2024-12-31",
    priority: "high",
    status: "completed",
    completedDate: "2024-12-28",
    doneBy: "Me",
  },
  {
    id: 102,
    title: "Review and approve November invoices",
    description: "Verified all client invoices for November billing",
    dueDate: "2024-12-05",
    priority: "medium",
    status: "completed",
    completedDate: "2024-12-04",
    doneBy: "AI",
  },
  {
    id: 103,
    title: "Update insurance policy",
    description: "Renewed professional liability insurance",
    dueDate: "2024-12-15",
    priority: "high",
    status: "completed",
    completedDate: "2024-12-10",
    doneBy: "Me",
  },
  {
    id: 104,
    title: "Archive Q3 documents",
    description: "Organized and archived all Q3 financial records",
    dueDate: "2024-11-30",
    priority: "low",
    status: "completed",
    completedDate: "2024-11-28",
    doneBy: "AI",
  },
  {
    id: 105,
    title: "Client onboarding - Client E",
    description: "Completed all onboarding paperwork and contracts",
    dueDate: "2024-11-20",
    priority: "medium",
    status: "completed",
    completedDate: "2024-11-18",
    doneBy: "Me",
  },
];

const Todos = () => {
  const [isForMeExpanded, setIsForMeExpanded] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  return (
    <div className="todos-page">
      <div className="page-header">
        <h1>To-do's</h1>
        <button className="btn-primary" onClick={() => {}}>
          Add To-do
        </button>
      </div>

      <div className="collapsible-tile">
        <div
          className="section-header"
          onClick={() => setIsForMeExpanded(!isForMeExpanded)}
        >
          <h2>Expected invoices</h2>
          <span
            className={`collapse-icon ${isForMeExpanded ? "expanded" : ""}`}
          >
            ▼
          </span>
        </div>

        {isForMeExpanded && (
          <div className="table-content">
            <table className="todos-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dummyTodos.map((todo) => (
                  <tr key={todo.id}>
                    <td className="todo-title">{todo.title}</td>
                    <td className="todo-description">{todo.description}</td>
                    <td>{formatDate(todo.dueDate)}</td>
                    <td>
                      <span
                        className={`priority-badge priority-${todo.priority}`}
                      >
                        {todo.priority.charAt(0).toUpperCase() +
                          todo.priority.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${todo.status}`}>
                        {todo.status
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </span>
                    </td>
                    <td>
                      <button className="btn-ignore" onClick={() => {}}>
                        Ignore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="collapsible-tile">
        <div
          className="section-header"
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
        >
          <h2>History</h2>
          <span
            className={`collapse-icon ${isHistoryExpanded ? "expanded" : ""}`}
          >
            ▼
          </span>
        </div>

        {isHistoryExpanded && (
          <div className="table-content">
            <table className="todos-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Completed Date</th>
                  <th>Priority</th>
                  <th>Done by</th>
                </tr>
              </thead>
              <tbody>
                {historyTodos.map((todo) => (
                  <tr key={todo.id}>
                    <td className="todo-title">{todo.title}</td>
                    <td className="todo-description">{todo.description}</td>
                    <td>{formatDate(todo.dueDate)}</td>
                    <td>
                      {todo.completedDate
                        ? formatDate(todo.completedDate)
                        : "-"}
                    </td>
                    <td>
                      <span
                        className={`priority-badge priority-${todo.priority}`}
                      >
                        {todo.priority.charAt(0).toUpperCase() +
                          todo.priority.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`done-by-badge done-by-${todo.doneBy?.toLowerCase()}`}
                      >
                        {todo.doneBy || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Todos;
