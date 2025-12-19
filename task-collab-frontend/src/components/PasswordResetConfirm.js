import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation,Link } from "react-router-dom";
import api from '../api/api';

export default function PasswordResetConfirm() {
  const [passwords, setPasswords] = useState({
    new_password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if token exists on component mount
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
      navigate("/password-reset");
    } else {
      setTokenValid(true);
      // You could also verify the token with backend here
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tokenValid || !token) {
      setError("Invalid reset token");
      return;
    }
    
    if (passwords.new_password !== passwords.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    
    if (passwords.new_password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(`/auth/password-reset-confirm/${token}`, {
        new_password: passwords.new_password,
        confirm_password: passwords.confirm_password
      });
      
      setSuccess("Password has been reset successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err) {
      console.error("Reset error:", err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          "Error resetting password. The link may have expired.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Invalid Reset Link</h2>
            <p>The password reset link is invalid or has expired.</p>
          </div>
          <button 
            className="auth-btn" 
            onClick={() => navigate("/password-reset")}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper slide-up">
        {/* Left Illustration */}
        <div className="auth-illustration" style={{background: 'var(--gradient-primary)'}}>
          <div className="illustration-content">
            <div className="illustration-icon">🔒</div>
            <h2>Set New Password</h2>
            <p>Create a strong password to secure your account</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="auth-card">
          <div className="auth-header fade-in">
            <div className="auth-logo">
              <div className="logo-icon">📋</div>
              <span>TaskFlow</span>
            </div>
            <h2>Create New Password</h2>
            <p>Enter your new password below</p>
          </div>
          
          {error && (
            <div className="alert alert-error fade-in">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success fade-in">
              <strong>Success!</strong> {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  type="password" 
                  name="new_password"
                  placeholder="Enter new password (min. 6 characters)" 
                  value={passwords.new_password} 
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength="6"
                  autoComplete="new-password"
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  type="password" 
                  name="confirm_password"
                  placeholder="Confirm new password" 
                  value={passwords.confirm_password} 
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength="6"
                  autoComplete="new-password"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="auth-btn" 
              disabled={loading}
              style={{background: 'var(--gradient-primary)'}}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Resetting Password...
                </>
              ) : "Reset Password"}
            </button>
            
            <div className="auth-footer">
              <p>
                Remember your password? 
                <Link to="/login"> Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}