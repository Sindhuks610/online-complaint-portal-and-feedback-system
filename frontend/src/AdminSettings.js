import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminSettings.css'; // Link to the new, professional CSS file

const API_BASE_URL = 'http://localhost:5000/api'; 

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    escalation_time_limit: '',
    default_categories: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Fetch the current system configuration
  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/config`);
      // Initialize state with fetched values or common defaults
      setSettings({
        escalation_time_limit: response.data.escalation_time_limit || '72', // Default to 72 hours
        // NOTE: If your backend doesn't store default_categories yet, it will use the hardcoded default.
        default_categories: response.data.default_categories || 'Maintenance,Academics,Security',
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage('Failed to load settings. Check server connection.');
      setIsError(true);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Saving...');
    setIsError(false);
    try {
      // The backend needs to be able to handle saving all keys sent in 'settings' object.
      await axios.put(`${API_BASE_URL}/admin/config`, settings);
      setMessage('Settings saved successfully! ✅');
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage(`Error saving settings: ${error.response?.data?.error || 'Unknown error'}`);
      setIsError(true);
    } finally {
      setTimeout(() => setMessage(''), 4000);
    }
  };

  // UPDATED Message Banner component to use new CSS classes
  const MessageBanner = ({ msg, isErr }) => (
    <div className={`message-banner ${isErr ? 'error' : 'success'}`}>
        {msg}
    </div>
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Admin Settings...</div>;
  }

  return (
    <div className="admin-page-container">
      <header className="page-header">
        <h1>System Configuration</h1>
        <p>Adjust global settings for escalation, categories, and system defaults.</p>
      </header>

      {/* Use the new MessageBanner component */}
      {message && <MessageBanner msg={message} isErr={isError} />}

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Escalation Setting */}
        <div className="setting-card">
          <h2>Escalation Threshold</h2>
          <label htmlFor="escalation_time_limit">
            Time Limit for Escalation (in Hours):
          </label>
          <input
            type="number"
            id="escalation_time_limit"
            name="escalation_time_limit"
            value={settings.escalation_time_limit}
            onChange={handleChange}
            required
            min="1"
          />
          <p className="hint">
            Complaints older than this limit may be flagged for manual escalation.
          </p>
        </div>

        {/* Category Setting */}
        <div className="setting-card">
          <h2>Default Complaint Categories</h2>
          <label htmlFor="default_categories">
            Categories (Comma Separated List):
          </label>
          <textarea
            id="default_categories"
            name="default_categories"
            rows="3"
            value={settings.default_categories}
            onChange={handleChange}
            placeholder="e.g., Infrastructure, Finance, HR"
          />
          <p className="hint">
            This list is used to populate the dropdown on the user's submission form.
          </p>
        </div>

        <button
          type="submit"
          className="save-button"
        >
          Save All Settings
        </button>
      </form>

      {/* Footer Navigation - Complete and Corrected */}
      <footer className="admin-footer-nav">
        <Link to="/admin/dashboard">🏠 Dashboard</Link>
        <Link to="/admin/complaints">📋 Complaints</Link>
        <Link to="/admin/users">👥 Users</Link>
        <Link to="/admin/feedback">⭐ Feedback</Link>
        <Link to="/admin/reports">📊 Reports</Link>
        <Link to="/admin/settings" className="active">⚙️ Settings</Link>
      </footer>
    </div>
  );
};

export default AdminSettings;