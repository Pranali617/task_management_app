import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../api/api';

export default function Signup({ setUser }) {
  const [formData, setFormData] = useState({
      username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/signup", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        lastname: formData.lastname
      });

      setSuccess("🎉 Account created successfully! Please check your email to verify your account.");
      
      // Clear form
      setFormData({
        username:"",
        firstname: "",
        lastname: "",
        email: "",
        password: ""
      });
      
      // Redirect after delay
      setTimeout(() => {
        navigate("/login");
      }, 4000);

    } catch (err) {
  let errorMessage = "Error creating account. Please try again.";

  if (err.response?.data?.detail) {
    const detail = err.response.data.detail;

    // FastAPI validation errors (array)
    if (Array.isArray(detail)) {
      errorMessage = detail.map(e => e.msg).join(", ");
    }
    // FastAPI normal error (string)
    else if (typeof detail === "string") {
      errorMessage = detail;
    }
  }

  setError(errorMessage);
}

  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper slide-up">
        {/* Left Side - Illustration */}
        <div className="auth-illustration" style={{background: 'var(--gradient-primary)'}}>
          <div className="illustration-content">
            <div className="illustration-icon">🚀</div>
            <h2>Start Your Journey</h2>
            <p>Join thousands of teams managing their tasks efficiently</p>
            
            <div className="auth-features">
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <span>Fast & Easy Setup</span>
              </div>
              <div className="feature">
                <div className="feature-icon">🛡️</div>
                <span>Secure & Reliable</span>
              </div>
              <div className="feature">
                <div className="feature-icon">📈</div>
                <span>Boost Productivity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="auth-card">
          <div className="auth-header fade-in">
            <div className="auth-logo">
              <div className="logo-icon">📋</div>
              <span>TaskFlow</span>
            </div>
            <h2>Create Account</h2>
            <p>Join our task management platform today</p>
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

          <form onSubmit={handleSignup} className="auth-form">
            <div className="name-fields" style={{display: 'flex', gap: '15px'}}>
              <div className="form-group" style={{flex: 1}}>
                <div className="input-group">
                  <label>First Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input 
                      type="text" 
                      name="firstname"
                      placeholder="Enter first name" 
                      value={formData.firstname} 
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group" style={{flex: 1}}>
                <div className="input-group">
                  <label>Last Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👥</span>
                    <input 
                      type="text" 
                      name="lastname"
                      placeholder="Enter last name" 
                      value={formData.lastname} 
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group" style={{flex: 1}}>
                <div className="input-group">
                  <label>User Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👥</span>
                    <input 
                      type="text" 
                      name="username"
                      placeholder="Enter user name" 
                      value={formData.username} 
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            

            <div className="form-group">
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Enter your email" 
                    value={formData.email} 
                    onChange={handleChange}
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
                    name="password"
                    placeholder="Create a password (min. 6 characters)" 
                    value={formData.password} 
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength="6"
                  />
                </div>
                <small style={{
                  display: 'block',
                  marginTop: '5px',
                  color: 'var(--gray-color)',
                  fontSize: '12px'
                }}>
                  Minimum 6 characters
                </small>
              </div>
            </div>

            <div className="form-group">
              <button type="submit" className="auth-btn" disabled={loading} 
                style={{background: 'var(--gradient-primary)'}}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Create Account
                  </>
                )}
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Already have an account? 
                <Link to="/login"> Sign in</Link>
              </p>
              <p className="verify-note">
                By signing up, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}   