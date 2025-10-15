import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminFeedback.css';

const API_BASE_URL = 'http://localhost:5000/api';

const StarDisplay = ({ rating }) => (
  <div className="star-display">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'filled' : ''}>★</span>
    ))}
  </div>
);

const AdminFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/feedback`);
      setFeedbackList(response.data);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading Feedback...</div>;
  }

  return (
    <div className="admin-feedback-container">
      <header className="page-header">
        <h1>User Feedback ({feedbackList.length})</h1>
        <p>Review user ratings and comments to improve service quality.</p>
      </header>
      
      <div className="feedback-list">
        {feedbackList.length > 0 ? (
          feedbackList.map(item => (
            <div key={item.id} className="feedback-card">
              <div className="feedback-card-header">
                <div className="user-info">
                  <strong>{item.user_name}</strong> ({item.user_email})
                </div>
                <div className="feedback-meta">
                  <StarDisplay rating={item.rating} />
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>
              {item.comment && <p className="feedback-comment">"{item.comment}"</p>}
            </div>
          ))
        ) : (
          <p>No feedback has been submitted yet.</p>
        )}
      </div>

      <footer className="admin-footer-nav">
        <Link to="/admin/dashboard">🏠 Dashboard</Link>
        <Link to="/admin/complaints">📋 Complaints</Link>
        <Link to="/admin/users">👥 Users</Link>
        <Link to="/admin/feedback" className="active">⭐ Feedback</Link>
        <Link to="/admin/reports">📊 Reports</Link>
        <Link to="/admin/settings">⚙️ Settings</Link>
      </footer>
    </div>
  );
};

export default AdminFeedback;