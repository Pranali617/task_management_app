import { useState } from "react";
import api from '../api/api';

export default function TaskForm({ setRefresh, refresh }) {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "medium",  // lowercase
    status: "pending",   // lowercase
    due_date: "",
    assigned_to: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({
      ...taskData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!taskData.title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (!taskData.due_date) {
      setError("Due date is required");
      return;
    }
    
    // Validate due date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (taskData.due_date < today) {
      setError("Due date cannot be in the past");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Sending task data:", taskData);
      
      const response = await api.post("/task/tasks/", {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,  // Already lowercase
        status: taskData.status,      // Already lowercase
        due_date: taskData.due_date,
        assigned_to: taskData.assigned_to || null
      });
      
      console.log("Task creation response:", response);
      
      if (response.data) {
        setSuccess("Task created successfully!");
        // Reset form
        setTaskData({
          title: "",
          description: "",
          priority: "medium",
          status: "pending",
          due_date: "",
          assigned_to: ""
        });
        
        // Refresh task list
        setTimeout(() => {
          setRefresh(!refresh);
          setSuccess("");
        }, 2000);
      }
      
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      
      let errorMessage = "Error creating task. Please try again.";
      
      if (err.response?.data) {
        if (err.response.data.detail) {
          if (Array.isArray(err.response.data.detail)) {
            errorMessage = err.response.data.detail.map(error => 
              `${error.loc?.join('.')}: ${error.msg}`
            ).join(', ');
          } else {
            errorMessage = err.response.data.detail;
          }
        } else if (err.response.data.msg) {
          errorMessage = err.response.data.msg;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.status === 403) {
          errorMessage = "You don't have permission to create tasks. Only admins can create tasks.";
        } else if (err.response.status === 401) {
          errorMessage = "Session expired. Please login again.";
        } else if (err.response.status === 400) {
          // Handle email not found error
          if (err.response.data.detail && err.response.data.detail.includes("not found")) {
            errorMessage = `Error: ${err.response.data.detail}. Please enter a valid user email.`;
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <div className="alert-content">
            <p><strong>Error:</strong> {error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          <div className="alert-content">
            <p><strong>Success:</strong> {success}</p>
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">Task Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Enter task title"
          value={taskData.title}
          onChange={handleChange}
          required
          disabled={loading}
          className="form-input"
          minLength="3"
          maxLength="100"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter task description"
          value={taskData.description}
          onChange={handleChange}
          disabled={loading}
          className="form-textarea"
          rows="4"
          maxLength="500"
        />
        <small className="form-hint">Max 500 characters</small>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <select
            id="priority"
            name="priority"
            value={taskData.priority}
            onChange={handleChange}
            disabled={loading}
            className="form-select"
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="due_date">Due Date *</label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            value={taskData.due_date}
            onChange={handleChange}
            disabled={loading}
            className="form-input"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={taskData.status}
            onChange={handleChange}
            disabled={loading}
            className="form-select"
          >
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="assigned_to">Assign to (email)</label>
          <input
            id="assigned_to"
            name="assigned_to"
            type="email"
            placeholder="user@example.com"
            value={taskData.assigned_to}
            onChange={handleChange}
            disabled={loading}
            className="form-input"
          />
          <small className="form-hint">Leave empty to keep unassigned</small>
        </div>
      </div>

      <button 
        type="submit" 
        className="submit-btn" 
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Creating Task...
          </>
        ) : (
          "Create Task"
        )}
      </button>
    </form>
  );
}