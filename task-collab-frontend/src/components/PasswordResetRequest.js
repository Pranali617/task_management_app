import { useState } from "react";
import { Link } from "react-router-dom";
import api from '../api/api';

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/password-reset-request", { email });
      setSuccess(`Password reset link has been sent to ${email}. Please check your email.`);
      setEmail("");
    } catch (err) {
      console.error("Reset request error:", err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          "Error sending reset link. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper slide-up">
        {/* Left Illustration */}
        <div className="auth-illustration" style={{background: 'var(--gradient-primary)'}}>
          <div className="illustration-content">
            <div className="illustration-icon">🔑</div>
            <h2>Forgot Password?</h2>
            <p>We'll help you reset it and get back on track</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="auth-card">
          <div className="auth-header fade-in">
            <div className="auth-logo">
              <div className="logo-icon">📋</div>
              <span>TaskFlow</span>
            </div>
            <h2>Reset Password</h2>
            <p>Enter your email to receive a reset link</p>
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
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
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
                  Sending Reset Link...
                </>
              ) : "Send Reset Link"}
            </button>
            
            <div className="auth-footer">
              <p>
                Remember your password? 
                <Link to="/login"> Sign in</Link>
              </p>
              <p className="verify-note">
                Check your spam folder if you don't see the email
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}