import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // 👈 IMPORT Link HERE
import axios from "axios";
import "./AdminComplaints.css";

const API_BASE_URL = "http://localhost:5000/api";

const AdminComplaints = () => {
  // ... (All your existing state and functions like fetchComplaints, updateStatus, etc. remain unchanged)
  const [complaints, setComplaints] = useState([]);
  const [commentMap, setCommentMap] = useState({});
  const [replyMap, setReplyMap] = useState({});
  const [assignMap, setAssignMap] = useState({});
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const adminId = user?.id;
  const adminName = user?.name || "Admin";

  const staffList = [
      { id: 2, name: 'Staff John' },
      { id: 3, name: 'Staff Jane' },
      { id: adminId, name: `${adminName} (Self)` },
  ].filter((s, index, self) => 
      index === self.findIndex((t) => (t.id === s.id))
  );

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
        navigate("/login"); 
    } else {
        fetchComplaints();
    }
  }, [navigate, user?.role]);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/complaints`);
      setComplaints(res.data);
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

  const updateStatus = async (id, status) => {
    const comment = commentMap[id] || `Status updated to ${status} by ${adminName}`;
    if (!comment) {
        alert("Please provide a comment for the status update.");
        return;
    }
    try {
      await axios.patch(`${API_BASE_URL}/admin/complaints/status/${id}`, {
        status, comment, updated_by: adminId,
      });
      alert(`Complaint #${id} status updated to ${status}.`);
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const addReply = async (id) => {
    const reply = replyMap[id];
    if (!reply) {
        alert("Please write a reply before sending.");
        return;
    }
    try {
      await axios.post(`${API_BASE_URL}/admin/complaints/${id}/reply`, {
        reply, updated_by: adminId,
      });
      alert(`Public reply sent for Complaint #${id}.`);
      setReplyMap({ ...replyMap, [id]: '' });
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert("Failed to send reply.");
    }
  };

  const assignComplaint = async (id) => {
    const staff_id = assignMap[id];
    if (!staff_id) {
        alert("Please select a staff member to assign the complaint.");
        return;
    }
    try {
      await axios.post(`${API_BASE_URL}/admin/complaints/${id}/assign`, {
        staff_id, updated_by: adminId,
      });
      alert(`Complaint #${id} assigned successfully.`);
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert("Failed to assign complaint.");
    }
  };
  
  const getStatusClass = (status) => `status-${status.toLowerCase().replace(" ", "-")}`;

  if (!complaints.length && user && user.role !== 'user') {
      return <div className="admin-complaints-container">Loading Complaints...</div>;
  }
  
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
      return null;
  }

  return (
    <div className="admin-complaints-container">
      <h2>📋 Complaint Management ({complaints.length} Total)</h2>
      {complaints.map((c) => (
          <div key={c.id} className="complaint-card">
            <div className="complaint-header">
              <div className="complaint-details">
                <h3>Complaint #{c.id}: {c.subject}</h3>
                <p><strong>Submitted By:</strong> {c.user_name || "Anonymous"}</p>
                <p><strong>Category:</strong> {c.category} | <strong>Urgency:</strong> {c.urgency}</p>
                {c.assigned_to && <p><strong>Assigned To:</strong> {c.staff_name || `ID ${c.assigned_to}`}</p>}
              </div>
              <span className={`status-badge ${getStatusClass(c.status)}`}>{c.status}</span>
            </div>
            
            <p className="description-admin">**Description:** {c.description}</p>
            {c.file_path && (<a href={`http://localhost:5000/uploads/${c.file_path}`} target="_blank" rel="noopener noreferrer" className="file-link-admin">⬇️ Download Attachment</a>)}

            <div className="admin-actions">
              {/* 1. Status Update */}
              <div className="action-group">
                <label>Update Status to:</label>
                <select defaultValue={c.status} onChange={(e) => updateStatus(c.id, e.target.value)} className="status-selector">
                  <option value="New">New</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <input type="text" placeholder="Comment (Required for Timeline)" value={commentMap[c.id] || ""} onChange={(e) => setCommentMap({ ...commentMap, [c.id]: e.target.value })} className="admin-comment-input"/>
                <button className="btn-update-status" onClick={() => updateStatus(c.id, c.status)}>Apply Status Update</button>
              </div>
              
              {/* 2. Staff Assignment */}
              <div className="action-group">
                <label>Assign to Staff:</label>
                <select value={assignMap[c.id] || ''} onChange={(e) => setAssignMap({ ...assignMap, [c.id]: parseInt(e.target.value) })} className="assign-selector">
                  <option value="">Select Staff</option>
                  {staffList.map(staff => (<option key={staff.id} value={staff.id}>{staff.name}</option>))}
                </select>
                <button className="btn-assign" onClick={() => assignComplaint(c.id)}>Assign Complaint</button>
              </div>

              {/* 3. Public Reply */}
              <div className="action-group">
                <label>Public Reply:</label>
                <input type="text" placeholder="Reply to user" value={replyMap[c.id] || ""} onChange={(e) => setReplyMap({ ...replyMap, [c.id]: e.target.value })} className="admin-comment-input"/>
                <button className="btn-reply" onClick={() => addReply(c.id)}>Send Public Reply</button>
              </div>

              {/* 👇 4. ESCALATION BUTTON ADDED HERE 👇 */}
              <div className="action-group">
                  <label>Escalate (Admin Only)</label>
                  <Link to={`/admin/escalate/${c.id}`} className="btn-escalate">
                      Escalate Complaint
                  </Link>
              </div>
            </div>
            
            <div className="timeline">
              <h4>Timeline / Updates</h4>
              {c.timeline?.length > 0 ? (
                c.timeline.map((t) => (
                  <div key={t.id} className={`update-card ${getStatusClass(t.status)}`}>
                    <strong>{t.status}</strong>: {t.comment || "No comment"} ({new Date(t.updated_at).toLocaleString()})
                  </div>
                ))
              ) : (<p>No updates yet.</p>)}
            </div>
          </div>
        ))
      }
      <footer className="admin-footer-nav">
        {/* ... Footer links ... */}
        < Link to="/admin/dashboard" >🏠 Dashboard</Link>
        <Link to="/admin/complaints"className="active">📋 Complaints</Link>
        <Link to="/admin/users">👥 Users</Link>
        <Link to="/admin/feedback">⭐ Feedback</Link>
        <Link to="/admin/reports">📊 Reports</Link>
        <Link to="/admin/settings">⚙️ Settings</Link>
      </footer>
    </div>
  );
};

export default AdminComplaints;