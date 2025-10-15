import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";  
import './signup.css';  

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate(); 

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage(""); 
    setMessageType("");
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
            setMessage("Signup successful! Redirecting to login...");
            setMessageType("success");
            setTimeout(() => navigate("/login"), 1500);
      } else {
            setMessage(data.message || "Signup failed! Please check inputs.");
            setMessageType("error");
      }
      
    } catch (error) {
      setMessage("Error connecting to server. Please check your backend.");
      setMessageType("error");
      console.error(error);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSignup} className="signup-form">
        <h2>Create Account</h2>
        {message && <p className={`message ${messageType}`}>{message}</p>}

        <label htmlFor="name">Full Name</label>
        <input type="text" placeholder="John Doe"
          id="name"
          className="signup-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="email">Email Address</label>
        <input type="email" placeholder="you@example.com"
          id="email"
          className="signup-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input type="password" placeholder="Min 6 characters"
          id="password"
          className="signup-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" className="signup-button">Get Started</button>

        <p className="link-text">
            Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;