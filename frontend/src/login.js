import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";  
import './login.css';   

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 
  const navigate = useNavigate();  

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); 
    setMessageType("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setMessage("Login successful! Redirecting...");
        setMessageType("success");

        setTimeout(() => {
          if (data.user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/dashboard");
          }
        }, 500); 

      } else {
        setMessage(data.message || "Invalid credentials. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error connecting to server. Is the backend running?");
      setMessageType("error");
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Portal Login</h2>
        {message && <p className={`status-message ${messageType}`}>{message}</p>}

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-button">Sign In</button>
        
        <p className="link-text">
            Don't have an account? <Link to="/signup">Create account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;