import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from '../api/api';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks from your backend
      const tasksRes = await api.get("/task/tasks/");
      const tasks = tasksRes.data || [];
      
      console.log("Fetched tasks:", tasks);
      
      // Calculate stats from real data - FIXED: case-insensitive comparison
      const total = tasks.length;
      const completed = tasks.filter(t => t.status?.toLowerCase() === "completed").length;
      const inProgress = tasks.filter(t => t.status?.toLowerCase() === "in_progress").length;
      const pending = tasks.filter(t => t.status?.toLowerCase() === "pending").length;
      
      setStats({ total, completed, inProgress, pending });
      
      // Get 5 most recent tasks
      const sortedTasks = [...tasks]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      setRecentTasks(sortedTasks);
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setStats({ total: 0, completed: 0, inProgress: 0, pending: 0 });
      setRecentTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter recent tasks based on active filter - MOVED OUTSIDE fetchDashboardData
  const getFilteredRecentTasks = () => {
    if (activeFilter === 'all') return recentTasks;
    
    return recentTasks.filter(task => {
      if (!task.status) return false;
      
      const statusLower = task.status.toLowerCase();
      
      if (activeFilter === 'completed') {
        return statusLower === "completed";
      }
      
      if (activeFilter === 'in-progress') {
        return statusLower === "in_progress";
      }
      
      if (activeFilter === 'pending') {
        return statusLower === "pending";
      }
      
      return true;
    });
  };

  // This will be recalculated whenever recentTasks or activeFilter changes
  const filteredRecentTasks = getFilteredRecentTasks();

  const handleCreateTask = () => {
    window.location.href = "/tasks";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }
  

  return (
    <div className="dashboard-container">
      {/* Remove the top header from here since Navbar handles it */}

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>{getGreeting()}, {user?.firstname || user?.email?.split('@')[0]}! 👋</h1>
          <p className="welcome-subtitle">Here's what's happening with your tasks today</p>
        </div>
        <button className="create-task-btn-large" onClick={handleCreateTask}>
          <span className="plus-icon">+</span>
          Create New Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <h2 className="section-title">Overview</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Tasks</p>
            </div>
            <div className="stat-icon">📊</div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <h3>{stats.completed}</h3>
              <p>Completed</p>
            </div>
            <div className="stat-icon">✅</div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <h3>{stats.inProgress}</h3>
              <p>In Progress</p>
            </div>
            <div className="stat-icon">🔄</div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
            <div className="stat-icon">⏳</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-section">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} 
            onClick={() => setActiveFilter('all')}
          >
            All Tasks ({stats.total})
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`} 
            onClick={() => setActiveFilter('completed')}
          >
            Completed ({stats.completed})
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'in-progress' ? 'active' : ''}`} 
            onClick={() => setActiveFilter('in-progress')}
          >
            In Progress ({stats.inProgress})
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`} 
            onClick={() => setActiveFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="recent-tasks-section">
        <div className="section-header">
          <h2 className="section-title">Recent Tasks</h2>
          <Link to="/tasks" className="view-all-link">
            View All →
          </Link>
        </div>
        
        {filteredRecentTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>
              {activeFilter !== 'all' 
                ? `No ${activeFilter.replace('-', ' ')} tasks found. Try changing the filter.`
                : 'Create your first task to get started!'
              }
            </p>
            <button className="create-task-btn" onClick={handleCreateTask}>
              Create Your First Task
            </button>
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredRecentTasks.map(task => (
              <div key={task.uid || task.id} className="task-card">
                <div className="task-card-header">
                  <h3 className="task-title">{task.title || "Untitled Task"}</h3>
                  <span className={`priority-badge priority-${task.priority?.toLowerCase() || 'medium'}`}>
                    {task.priority || "Medium"}
                  </span>
                </div>
                
                <p className="task-description">
                  {task.description || "No description provided"}
                </p>
                
                <div className="task-meta">
                  <div className="meta-item">
                    <span className="meta-label">Status:</span>
                    {/* FIXED: Replace underscore with hyphen for CSS class */}
                    <span className={`status-badge status-${task.status?.toLowerCase().replace('_', '-') || 'pending'}`}>
                      {task.status || "Pending"}
                    </span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-label">Assigned to:</span>
                    <span className="assignee">
                      {task.assigned_to || "Unassigned"}
                    </span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-label">Created:</span>
                    <span className="task-date">
                      {formatDate(task.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="task-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => window.location.href = "/tasks"}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-section">
        <h2 className="section-title">Quick Stats</h2>
        <div className="quick-stats-grid">
          <div className="quick-stat">
            <div className="quick-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
              <span style={{ color: '#6366f1' }}>🎯</span>
            </div>
            <div className="quick-stat-content">
              <h4>Productivity</h4>
              <p>
                {stats.total > 0 
                  ? `${Math.round((stats.completed / stats.total) * 100)}% completion rate`
                  : 'No tasks yet'
                }
              </p>
            </div>
          </div>
          
          <div className="quick-stat">
            <div className="quick-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <span style={{ color: '#10b981' }}>⚡</span>
            </div>
            <div className="quick-stat-content">
              <h4>Progress</h4>
              <p>
                {stats.inProgress > 0 
                  ? `${stats.inProgress} tasks in progress`
                  : 'No active tasks'
                }
              </p>
            </div>
          </div>
          
          <div className="quick-stat">
            <div className="quick-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <span style={{ color: '#f59e0b' }}>📅</span>
            </div>
            <div className="quick-stat-content">
              <h4>Recent Activity</h4>
              <p>
                {filteredRecentTasks.length > 0 
                  ? `${filteredRecentTasks.length} recent tasks`
                  : 'No recent activity'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}