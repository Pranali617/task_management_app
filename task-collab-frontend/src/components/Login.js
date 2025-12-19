import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../api/api';

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await api.post("/auth/login", { email, password });
      
      // Store tokens
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      
      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem("remember_email", email);
      } else {
        localStorage.removeItem("remember_email");
      }
      
      // Fetch user details
      const userRes = await api.get("/auth/me");
      const userData = {
        ...userRes.data,
        uid: res.data.user.uid
      };
      
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      // Show success animation before redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email
  useState(() => {
    const rememberedEmail = localStorage.getItem("remember_email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-wrapper slide-up">
        {/* Left Side - Illustration */}
        <div className="auth-illustration">
          <div className="illustration-content">
            <div className="illustration-icon">📊</div>
            <h2>Welcome to TaskFlow</h2>
            <p>Manage your tasks efficiently with our collaborative platform</p>
            
            <div className="auth-features">
              <div className="feature">
                <div className="feature-icon">✓</div>
                <span>Real-time collaboration</span>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <span>Priority management</span>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <span>Team task delegation</span>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <span>Progress tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-card">
          <div className="auth-header fade-in">
            <div className="auth-logo">
              <div className="logo-icon">📋</div>
              <span>TaskFlow</span>
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="alert alert-error fade-in">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
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
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-options">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <div className="custom-checkbox"></div>
                  <span>Remember me</span>
                </label>
                
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="form-group">
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>→</span>
                    Sign In
                  </>
                )}
              </button>
            </div>

            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn google" disabled={loading}>
                <span>G</span>
                Google
              </button>
              <button type="button" className="social-btn github" disabled={loading}>
                <span>🐙</span>
                GitHub
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account? 
                <Link to="/signup"> Sign up</Link>
              </p>
              <p className="verify-note">
                *After signing up, check your email for verification link
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}