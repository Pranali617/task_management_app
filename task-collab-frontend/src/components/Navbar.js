import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  CheckCircle, 
  FileText, 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Menu,
  X,
  ChevronDown
} from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const navItems = [
    { path: "/dashboard", icon: <BarChart3 size={20} />, label: "Dashboard" },
    { path: "/tasks", icon: <CheckCircle size={20} />, label: "Tasks" },
    { path: "/projects", icon: <FileText size={20} />, label: "Projects" },
    { path: "/calendar", icon: <Calendar size={20} />, label: "Calendar" },
    { path: "/team", icon: <Users size={20} />, label: "Team" },
    { path: "/messages", icon: <MessageSquare size={20} />, label: "Messages", badge: 3 },
    { path: "/analytics", icon: <TrendingUp size={20} />, label: "Analytics" },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo and Brand */}
          <div className="nav-brand">
            <button className="menu-toggle" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/dashboard" className="logo">
              <div className="logo-icon">📊</div>
              <div className="logo-text">
                <span className="logo-title">TaskFlow</span>
                <span className="logo-subtitle">Task Management</span>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search tasks, projects, or team..." 
              className="search-input"
            />
          </div>

          {/* Right Side Actions */}
          <div className="nav-actions">
            {/* Notification Bell */}
            <button className="nav-action-btn notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="user-profile-dropdown">
              <button className="user-profile-btn" onClick={toggleProfile}>
                <div className="user-avatar">
                  {user?.firstname?.[0] || 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">
                    {user?.firstname ? `${user.firstname} ${user.lastname || ''}` : user?.email?.split('@')[0]}
                  </span>
                  <span className="user-email">{user?.email}</span>
                </div>
                <ChevronDown size={16} className={`dropdown-arrow ${isProfileOpen ? 'open' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {user?.firstname?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="dropdown-name">
                        {user?.firstname ? `${user.firstname} ${user.lastname || ''}` : user?.email?.split('@')[0]}
                      </div>
                      <div className="dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                    <Settings size={16} />
                    <span>Profile Settings</span>
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation Menu */}
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Navigation</h3>
          <button className="close-sidebar" onClick={toggleMenu}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className="sidebar-nav-item"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              {item.badge && (
                <span className="sidebar-nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/settings" className="sidebar-nav-item">
            <span className="sidebar-nav-icon">
              <Settings size={20} />
            </span>
            <span className="sidebar-nav-label">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div className="sidebar-overlay" onClick={toggleMenu}></div>
      )}
    </>
  );
}