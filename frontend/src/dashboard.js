import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./dashboard.css"; // Link to the CSS file

// --- NEW STAR RATING COMPONENT ---
const StarRating = ({ rating, setRating }) => {
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={starValue}
            className={starValue <= rating ? "star filled" : "star"}
            onClick={() => setRating(starValue)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};
// --- END STAR RATING COMPONENT ---

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });

  // --- ADD STATE FOR FEEDBACK ---
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackMessageType, setFeedbackMessageType] = useState(""); // <-- NEW STATE FOR STYLING

  // 1. Protect route: Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "admin") {
      // Redirect admins away from the user dashboard
      navigate("/admin/dashboard");
    } else {
      fetchStats();
    }
    // eslint-disable-next-line
  }, [user]);

  // 2. Fetch per-user complaint stats
  const fetchStats = async () => {
    try {
      // Make sure your backend has this route implemented: /api/complaints/stats?user_id=X
      const res = await axios.get(
        `http://localhost:5000/api/complaints/stats?user_id=${user.id}`
      );
      
      const { total, resolved } = res.data;
      const pending = total - resolved;
      setStats({ total, resolved, pending });
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Optionally show a message to the user
    }
  };

  // 3. Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --- ADD THIS FEEDBACK SUBMISSION HANDLER ---
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackMessage("");
    setFeedbackMessageType("");

    if (rating === 0) {
      setFeedbackMessage("Please select a star rating.");
      setFeedbackMessageType("error"); // Set error style
      return;
    }
    try {
      // NOTE: This assumes your user object stored in localStorage has an 'id' property.
      await axios.post("http://localhost:5000/api/feedback", {
        user_id: user.id,
        rating,
        comment: feedbackComment,
      });
      setFeedbackMessage("Thank you for your feedback! ⭐");
      setFeedbackMessageType("success"); // Set success style
      setRating(0);
      setFeedbackComment("");
    } catch (error) {
      setFeedbackMessage("Failed to send feedback. Please try again.");
      setFeedbackMessageType("error"); // Set error style
    } finally {
        setTimeout(() => setFeedbackMessage(""), 4000);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">Online Complaint Portal & Feedback System</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <h2>Welcome, {user?.name || "User"}</h2>
        <p>
          Quick overview of your complaints. Use the navigation links to manage your issues.
        </p>

        {/* Stats Boxes */}
        <div className="stats-container">
          <div className="stat-box total">
            <h3>Total Complaints</h3>
            <p>{stats.total}</p>
          </div>
          <div className="stat-box pending">
            <h3>Pending</h3>
            <p>{stats.pending}</p>
          </div>
          <div className="stat-box resolved">
            <h3>Resolved</h3>
            <p>{stats.resolved}</p>
          </div>
        </div>

        {stats.total === 0 && (
          <p className="no-complaints">
            You haven't submitted any complaints yet. Use the 'Submit Complaint' link below.
          </p>
        )}
        
        {/* --- NEW FEEDBACK SECTION --- */}
        <section className="feedback-section">
            <h3>Provide Feedback About Our Service</h3>
            <form onSubmit={handleFeedbackSubmit}>
                <label>Overall Rating:</label>
                <StarRating rating={rating} setRating={setRating} />
                <textarea
                    placeholder="Tell us more about your experience (optional)..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    rows="3"
                ></textarea>
                <button type="submit" className="feedback-submit-btn">Submit Feedback</button>
                {/* Status message now uses the message type class */}
                {feedbackMessage && <p className={`feedback-status ${feedbackMessageType}`}>{feedbackMessage}</p>} 
            </form>
        </section>
        {/* --- END FEEDBACK SECTION --- */}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link to="/dashboard" className="nav-link active">🏠 Dashboard</Link>
        <Link to="/complaintform" className="nav-link">➕ Submit Complaint</Link>
        <Link to="/my-complaints" className="nav-link">📄 My Complaints</Link>
      </nav>
    </div>
  );
};

export default Dashboard;