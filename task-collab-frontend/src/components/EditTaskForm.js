import { useState } from "react";

function EditTaskForm({ task, onSave, onCancel, loading, error }) {
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "medium",
    status: task.status || "pending",
    due_date: task.due_date || "",
    assigned_to: task.assigned_to || ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      assigned_to: formData.assigned_to.trim() || null
    };
    
    await onSave(submitData);
  };

  return (
    <div className="edit-task-modal">
      <div className="modal-overlay" onClick={onCancel}></div>
      
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Task</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter task title"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Enter task description"
              rows="4"
              maxLength="500"
              disabled={loading}
            />
            <small className="form-hint">Max 500 characters</small>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Priority *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
                required
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
                required
                disabled={loading}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Due Date *</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Assign to (email)</label>
              <input
                type="email"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="form-input"
                placeholder="user@example.com"
                disabled={loading}
              />
              <small className="form-hint">Leave empty to keep unassigned</small>
            </div>
          </div>
          
          <div className="modal-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskForm;