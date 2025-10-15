import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./complaintform.css"; 

// Base URL for the API
const API_BASE_URL = "http://localhost:5000/api";

const ComplaintForm = () => {
  // Static list of categories (used to populate the dropdown)
  const categories = ["Maintenance", "Academics", "Security", "Infrastructure", "Administration", "Other"];
  
  const [type, setType] = useState("Public");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { text: "", type: "success" or "error" }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    // 1. Client-side Validation
    if (!category || !subject || !description) {
      setMessage({ text: "⚠️ Please fill all required fields (Category, Subject, Description).", type: "error" });
      return;
    }

    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setMessage({ text: "⚠️ You must be logged in to submit a complaint.", type: "error" });
        setLoading(false);
        return;
      }

      // 2. Prepare data for backend using FormData for files
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("type", type);
      formData.append("category", category);
      formData.append("subject", subject);
      formData.append("description", description);
      formData.append("urgency", urgency);
      if (file) {
        formData.append("file_path", file); // Must match the name in multer setup (see Step 3)
      }

      // 3. API Call
      const res = await axios.post(`${API_BASE_URL}/complaints`, formData, {
        headers: {
          // No need to set 'Content-Type': 'multipart/form-data', as Axios/browser handles it automatically with FormData
        },
      });

      // 4. Handle Success
      setMessage({ text: `✅ Complaint ID #${res.data.complaintId} submitted successfully!`, type: "success" });
      
      // Reset form fields
      setCategory("");
      setSubject("");
      setDescription("");
      setUrgency("Medium");
      setFile(null); // Clears the file input display

    } catch (error) {
      console.error("Submission error:", error);
      const errorMsg = error.response?.data?.error || "Submission failed. Please check your network or server logs.";
      setMessage({ text: `❌ ${errorMsg}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-container">
      <header className="cf-header">
        <h1>➕ Submit New Complaint</h1>
      </header>

      <form onSubmit={handleSubmit} className="cf-form">
        {/* Messages */}
        {message && (
          <p className={`cf-message ${message.type}`}>
            {message.text}
          </p>
        )}
        
        {/* --- START: Two-Column Grid --- */}
        <div className="cf-grid">
            
            <div className="cf-span-full">
                <label>Submission Type</label>
                <div className="cf-radio-group">
                    <label className="cf-radio-label">
                        <input
                            type="radio"
                            value="Public"
                            checked={type === "Public"}
                            onChange={(e) => setType(e.target.value)}
                        /> **Public**
                    </label>
                    <label className="cf-radio-label">
                        <input
                            type="radio"
                            value="Anonymous"
                            checked={type === "Anonymous"}
                            onChange={(e) => setType(e.target.value)}
                        /> **Anonymous**
                    </label>
                </div>
            </div>

            <div>
                <label htmlFor="category">Category *</label>
                <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                </select>
            </div>
            
            <div>
                <label htmlFor="urgency">Urgency Level</label>
                <select
                id="urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                </select>
            </div>
        </div>
        {/* --- END: Two-Column Grid --- */}

        <label htmlFor="subject">Subject *</label>
        <input
          id="subject"
          type="text"
          placeholder="A brief title for your complaint (e.g., Leaking pipe in hostel B)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        <label htmlFor="description">Detailed Description *</label>
        <textarea
          id="description"
          placeholder="Describe your issue in detail. Provide context, location, and potential impact."
          rows="6"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        
        {/* File Upload Section */}
        <div className="cf-span-full">
            <label>Attachments (Optional)</label>
            <div className="cf-upload">
            <p className="cf-subtext">Attach an image or document (PDF, JPG, PNG) to support your claim.</p>
            <input
                type="file"
                id="fileUpload"
                onChange={(e) => setFile(e.target.files[0])}
                hidden
            />
            <button
                type="button"
                onClick={() => document.getElementById("fileUpload").click()}
                className="cf-upload-btn"
            >
                Choose File
            </button>
            {file && <p className="cf-file">{file.name}</p>}
            </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="cf-submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/dashboard" className="nav-link">🏠 Dashboard</Link>
        <Link to="/complaintform" className="nav-link active">➕ Submit Complaint</Link>
        <Link to="/my-complaints" className="nav-link">📄 My Complaints</Link>
      </nav>
    </div>
  );
};

export default ComplaintForm;