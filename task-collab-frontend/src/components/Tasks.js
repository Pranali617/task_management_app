import { useState, useEffect } from "react";
import api from '../api/api';
import TaskForm from "./TaskForm";
import EditTaskForm from "./EditTaskForm";

export default function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState(null);
  
  // Edit task states
  const [editingTask, setEditingTask] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/task/tasks/");
      
      let tasksData = [];
      
      if (res.data && Array.isArray(res.data)) {
        tasksData = res.data;
      } else if (res.data && res.data.detail) {
        console.error("API Error:", res.data.detail);
        setError(res.data.detail || "Failed to fetch tasks");
        tasksData = [];
      } else {
        console.error("Unexpected response format:", res.data);
        setError("Unexpected response format from server");
        tasksData = [];
      }
      
      setTasks(tasksData);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      
      let errorMessage = "Failed to fetch tasks. Please try again.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      }
      
      setError(errorMessage);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refresh]);

  // Delete Task
  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await api.delete(`/task/tasks/${taskId}`);
      setRefresh(!refresh);
      alert("Task deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage = err.response?.data?.detail || 
                          "Error deleting task. You may not have permission.";
      alert(errorMessage);
    }
  };

  // Update Task Status
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/task/tasks/${taskId}`, { status: newStatus });
      setRefresh(!refresh);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update task status");
    }
  };

  // Edit Task - NEW FUNCTION
  const handleEditTask = async (taskData) => {
    setEditLoading(true);
    setEditError(null);
    
    try {
      const taskId = editingTask.uid;
      await api.patch(`/task/tasks/${taskId}`, taskData);
      
      // Refresh tasks list
      setRefresh(!refresh);
      
      // Close edit modal
      setEditingTask(null);
      
      // Show success message
      alert("Task updated successfully!");
    } catch (err) {
      console.error("Edit error:", err);
      let errorMessage = "Failed to update task";
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      setEditError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  // Start Editing Task - NEW FUNCTION
  const startEditTask = (task) => {
    // Format date for input field
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    const taskData = {
      title: task.title,
      description: task.description || "",
      priority: task.priority.toLowerCase(),
      status: task.status.toLowerCase().replace(' ', '-'),
      due_date: task.due_date ? formatDateForInput(task.due_date) : "",
      assigned_to: task.assigned_to || ""
    };
    
    setEditingTask({
      ...task,
      formData: taskData
    });
  };

  // Filter tasks
  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "completed") return task.status === "completed";
    if (filter === "in-progress") return task.status === "in_rogress";
    if (filter === "pending") return task.status === "pending";
    return true;
  }) : [];

  // Helper functions
  const getTaskProperty = (task, property, defaultValue = "N/A") => {
    return task && task[property] !== undefined ? task[property] : defaultValue;
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div className="header-content">
          <h1>Task Management</h1>
          <p>Create and manage your tasks</p>
        </div>
        <div className="user-info-badge">
          <div className={`user-role-badge ${isAdmin ? 'admin' : 'user'}`}>
            {isAdmin ? "Administrator" : "User"}
          </div>
        </div>
      </div>

      <div className="tasks-container">
        {/* Admin-only Task Creation Form */}
        {isAdmin && (
          <div className="task-form-section">
            <div className="section-header">
              <h2>Create New Task</h2>
              <span className="admin-badge">Admin Only</span>
            </div>
            <TaskForm setRefresh={setRefresh} refresh={refresh} />
          </div>
        )}

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <h3>{tasks.length}</h3>
            <p>Total Tasks</p>
          </div>
          <div className="stat-card">
            <h3>{tasks.filter(t => t.status === "completed").length}</h3>
            <p>Completed</p>
          </div>
          <div className="stat-card">
            <h3>{tasks.filter(t => t.status === "in_progress").length}</h3>
            <p>In Progress</p>
          </div>
          <div className="stat-card">
            <h3>{tasks.filter(t => t.status === "pending").length}</h3>
            <p>Pending</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <h3>Filter Tasks</h3>
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Tasks
              <span className="task-count">{tasks.length}</span>
            </button>
            <button 
              className={`filter-tab ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending
              <span className="task-count">{tasks.filter(t => t.status === "pending").length}</span>
            </button>
            <button 
              className={`filter-tab ${filter === "in-progress" ? "active" : ""}`}
              onClick={() => setFilter("in-progress")}
            >
              In Progress
              <span className="task-count">{tasks.filter(t => t.status === "in_progress").length}</span>
            </button>
            <button 
              className={`filter-tab ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed
              <span className="task-count">{tasks.filter(t => t.status === "completed").length}</span>
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="tasks-list-section">
          <div className="section-header">
            <h2>Task List</h2>
            <div className="tasks-info">
              <span className="showing-text">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </span>
              {!isAdmin && (
                <span className="info-text">
                  *Only administrators can create and delete tasks
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <div className="error-content">
                <p><strong>Error:</strong> {error}</p>
                <button onClick={fetchTasks} className="retry-btn">
                  Retry
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No tasks found</h3>
              <p>
                {filter !== "all" 
                  ? `No ${filter.replace('-', ' ')} tasks found. Try changing the filter.`
                  : isAdmin 
                    ? "Create your first task using the form above!"
                    : "No tasks have been created yet."
                }
              </p>
            </div>
          ) : (
            <div className="tasks-grid">
              {filteredTasks.map((task, index) => {
                const taskId = getTaskProperty(task, 'uid') || getTaskProperty(task, 'id') || `task-${index}`;
                const title = getTaskProperty(task, 'title', 'Untitled Task');
                const description = getTaskProperty(task, 'description', 'No description provided');
                const status = getTaskProperty(task, 'status', 'Pending');
                const priority = getTaskProperty(task, 'priority', 'Medium');
                const assignedTo = getTaskProperty(task, 'assigned_to', 'Unassigned');
                const createdAt = getTaskProperty(task, 'created_at');
                const updatedAt = getTaskProperty(task, 'updated_at');
                
                return (
                  <div key={taskId} className="task-card">
                    <div className="task-card-header">
                      <div className="task-title-section">
                        <h3 className="task-title">{title}</h3>
                        <div className="task-status-control">
                          <select 
                            value={status}
                            onChange={(e) => updateTaskStatus(taskId, e.target.value)}
                            className="status-select"
                            disabled={!isAdmin && assignedTo !== user?.email}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="task-description">
                        {description}
                      </div>
                    </div>

                    <div className="task-meta-info">
                      <div className="meta-row">
                        <div className="meta-item">
                          <span className="meta-label">Priority:</span>
                          <span className={`priority-badge priority-${priority.toLowerCase()}`}>
                            {priority}
                          </span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Assigned to:</span>
                          <span className="assignee">
                            👤 {assignedTo}
                          </span>
                        </div>
                      </div>
                      
                      <div className="meta-row">
                        <div className="meta-item">
                          <span className="meta-label">Created:</span>
                          <span className="task-date">
                            {formatDate(createdAt)}
                          </span>
                        </div>
                        {updatedAt && updatedAt !== "N/A" && (
                          <div className="meta-item">
                            <span className="meta-label">Updated:</span>
                            <span className="task-date">
                              {formatDate(updatedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="task-actions">
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => startEditTask(task)}
                            className="action-btn edit-btn"
                            title="Edit task"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => deleteTask(taskId)}
                            className="action-btn delete-btn"
                            title="Delete task"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                      <button 
                        className="action-btn view-btn"
                        onClick={() => alert(`Task Details:\n\nTitle: ${title}\nStatus: ${status}\nPriority: ${priority}\nAssigned to: ${assignedTo}\nCreated: ${formatDate(createdAt)}`)}
                      >
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal - ADD THIS AT THE END */}
      {editingTask && (
        <EditTaskForm
          task={editingTask.formData}
          onSave={handleEditTask}
          onCancel={() => {
            setEditingTask(null);
            setEditError(null);
          }}
          loading={editLoading}
          error={editError}
        />
      )}
    </div>
  );
}