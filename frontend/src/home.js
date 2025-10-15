import React from 'react';
import { Link } from "react-router-dom";
import './home.css';   

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-card">
        
        {/* === LEFT COLUMN: BRANDING & INFO (Desktop) === */}
        <div className="brand-info">
          <div className="brand-header">
            <div className="portal-icon">
              {/* Using a modern icon for a professional look */}
              <span role="img" aria-label="complaint-icon">⚙️</span> 
            </div>
            <h2 className="welcome-message">Welcome to the</h2>
            <h1 className="header-text">Online Complaint Portal & Feedback System</h1>
          </div>
          
          <p className="card-description">
            Your dedicated platform for submitting, tracking, and resolving feedback seamlessly. We are committed to providing transparency and efficiency for every user.
          </p>
        </div>
        
        {/* === RIGHT COLUMN: CTA (Desktop) === */}
        <div className="cta-column">
          
          {/* Signup Section */}
          <p className="cta-prompt">If you are a **new user**, register here:</p>
          <Link to="/signup" className="link-style">
            <button className="home-btn signup-btn">
              Create New Account 
              <span className="button-icon">→</span>
            </button>
          </Link>

          <div className="separator">OR</div>
          
          {/* Login Section */}
          <p className="cta-prompt">If you already have an account, **sign in**:</p>
          <Link to="/login" className="link-style">
            <button className="home-btn login-btn">
              Go to Login Page 
              <span className="button-icon">→</span>
            </button>
          </Link>
          
        </div>

        {/* === FOOTER/SUPPORT NOTE === */}
        <div className="footer-note">
          <p>This is a secure enterprise portal. For technical support, please contact your administrator.</p>
        </div>
      </div>
    </div>
  )
}

export default Home;