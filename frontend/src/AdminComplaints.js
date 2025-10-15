import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./AdminComplaints.css"; // Ensure path is correct

const API_BASE_URL = "http://localhost:5000/api";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [commentMap, setCommentMap] = useState({});
  const [replyMap, setReplyMap] = useState({});
  const [assignMap, setAssignMap] = useState({});
  const navigate = useNavigate();

  // Get user/admin ID for all actions
  const user = JSON.parse(localStorage.getItem("user"));
  // Use the logged-in user's ID and name for the 'updated_by' field
  const adminId = user?.id; 
  const adminName = user?.name || "Admin";

  // Dummy staff list for assignment dropdown (In a real app, this should be fetched)
  const staffList = [
      { id: 2, name: 'Staff John' },
      { id: 3, name: 'Staff Jane' },
      // Add more staff/admin users here, using IDs from your 'users' table
      { id: adminId, name: `${adminName} (Self)` },
  ].filter((s, index, self) => 
      index === self.findIndex((t) => (t.id === s.id)) // Deduplicate
  );


  // --- Auth Check ---
  useEffect(() => {
    // Check for 'admin' or 'staff' role
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
        navigate("/login"); 
    } else {
        fetchComplaints();
    }
  }, [navigate, user?.role]);


  // --- Data Fetching ---
  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/complaints`);
      setComplaints(res.data);
      // Initialize assign map with current assigned staff
      const initialAssignMap = {};
      res.data.forEach(c => {
          if (c.assigned_to) {
              initialAssignMap[c.id] = c.assigned_to;
          }
      });
      setAssignMap(initialAssignMap);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  // --- Status Update Action ---
  const updateStatus = async (id, status) => {
    const comment = commentMap[id] || `Status updated to ${status} by ${adminName}`;
    if (!comment) {
        alert("Please provide a comment for the status update.");
        return;
    }
    try {
      await axios.patch(`${API_BASE_URL}/admin/complaints/status/${id}`, {
        status,
        comment,
        updated_by: adminId,
      });
      alert(`Complaint #${id} status updated to ${status}.`);
      fetchComplaints(); // Reload data
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  // --- Reply Action ---
  const addReply = async (id) => {
    const reply = replyMap[id];
    if (!reply) {
        alert("Please write a reply before sending.");
        return;
    }
    try {
      await axios.post(`${API_BASE_URL}/admin/complaints/${id}/reply`, {
        reply,
        updated_by: adminId,
      });
      alert(`Public reply sent for Complaint #${id}.`);
      setReplyMap({ ...replyMap, [id]: '' }); // Clear reply box
      fetchComplaints(); // Reload data
    } catch (err) {
      console.error(err);
      alert("Failed to send reply.");
    }
  };

  // --- Assign Action ---
  const assignComplaint = async (id) => {
    const staff_id = assignMap[id];
    if (!staff_id) {
        alert("Please select a staff member to assign the complaint.");
        return;
    }
    try {
      await axios.post(`${API_BASE_URL}/admin/complaints/${id}/assign`, {
        staff_id,
        updated_by: adminId,
      });
      alert(`Complaint #${id} assigned successfully.`);
      fetchComplaints(); // Reload data
    } catch (err) {
      console.error(err);
      alert("Failed to assign complaint.");
    }
  };
  
  // Helper to format the status class for CSS
  const getStatusClass = (status) => {
    return `status-${status.toLowerCase().replace(" ", "-")}`;
  };

  if (!complaints.length && user && user.role !== 'user') {
      return <div className="admin-complaints-container">Loading Complaints...</div>;
  }
  
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
      return null; // Should redirect via useEffect
  }

  return (
    <div className="admin-complaints-container">
      <h2>📋 Complaint Management ({complaints.length} Total)</h2>
      
      {complaints.length === 0 ? (
        <p>No complaints found.</p>
      ) : (
        complaints.map((c) => (
          <div key={c.id} className="complaint-card">
            
            <div className="complaint-header">
              <div className="complaint-details">
                <h3>Complaint #{c.id}: {c.subject}</h3>
                <p><strong>Submitted By:</strong> {c.user_name || "Anonymous"}</p>
                <p><strong>Category:</strong> {c.category} | <strong>Urgency:</strong> {c.urgency}</p>
                {c.assigned_to && <p><strong>Assigned To:</strong> {c.staff_name || `ID ${c.assigned_to}`}</p>}
                <p><strong>Submitted On:</strong> {new Date(c.created_at).toLocaleString()}</p>
              </div>
              <span className={`status-badge ${getStatusClass(c.status)}`}>
                {c.status}
              </span>
            </div>
            
            <p className="description-admin">**Description:** {c.description}</p>
            
            {c.file_path && (
                <a 
                    href={`http://localhost:5000/uploads/${c.file_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="file-link-admin"
                >
                    ⬇️ Download Attachment
                </a>
            )}

            {/* Admin Actions */}
            <div className="admin-actions">
              
              {/* 1. Status Update */}
              <div className="action-group">
                <label>Update Status to:</label>
                <select
                  defaultValue={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  className="status-selector"
                >
                  <option value="New">New</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <input
                    type="text"
                    placeholder="Comment (Required for Timeline)"
                    value={commentMap[c.id] || ""}
                    onChange={(e) => setCommentMap({ ...commentMap, [c.id]: e.target.value })}
                    className="admin-comment-input"
                  />
                <button className="btn-update-status" onClick={() => updateStatus(c.id, c.status)}>
                  Apply Status Update
                </button>
              </div>
              
              {/* 2. Staff Assignment */}
              <div className="action-group">
                <label>Assign to Staff:</label>
                <select
                  value={assignMap[c.id] || ''}
                  onChange={(e) => setAssignMap({ ...assignMap, [c.id]: parseInt(e.target.value) })}
                  className="assign-selector"
                >
                  <option value="">Select Staff</option>
                  {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name}</option>
                  ))}
                </select>
                <button className="btn-assign" onClick={() => assignComplaint(c.id)}>
                  Assign Complaint
                </button>
              </div>

              {/* 3. Public Reply */}
              <div className="action-group">
                <label>Public Reply:</label>
                <input
                    type="text"
                    placeholder="Reply to user"
                    value={replyMap[c.id] || ""}
                    onChange={(e) => setReplyMap({ ...replyMap, [c.id]: e.target.value })}
                    className="admin-comment-input"
                  />
                <button className="btn-reply" onClick={() => addReply(c.id)}>
                  Send Public Reply
                </button>
              </div>
            </div>
            
            {/* Timeline */}
            <div className="timeline">
              <h4>Timeline / Updates</h4>
              {c.timeline?.length > 0 ? (
                c.timeline.map((t) => (
                  <div key={t.id} className={`update-card ${getStatusClass(t.status)}`}>
                    <strong>{t.status}</strong>: {t.comment || "No comment"} ({new Date(t.updated_at).toLocaleString()})
                  </div>
                ))
              ) : (
                <p>No updates yet.</p>
              )}
            </div>
          </div>
        ))
      )}

      {/* Footer Navigation */}
      <footer className="admin-footer-nav">
        <Link to="/admin/dashboard">🏠 Dashboard</Link>
        <Link to="/admin/complaints" className="active">📋 Complaints</Link>
        <Link to="/admin/users">👥 Users</Link>
        <Link to="/admin/feedback">⭐ Feedback</Link>
        <Link to="/admin/reports">📊 Reports</Link>
        <Link to="/admin/settings">⚙️ Settings</Link>
      </footer>
    </div>
  );
};

export default AdminComplaints;