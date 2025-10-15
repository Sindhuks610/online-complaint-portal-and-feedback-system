import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyComplaints.css"; 

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    // State to track which complaint's timeline is currently expanded
    const [expandedComplaintId, setExpandedComplaintId] = useState(null); 
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    const statusSteps = ["New", "Under Review", "Resolved"];

    /* eslint-disable react-hooks/exhaustive-deps */ 
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (userId) {
            setLoading(true); 

            // This endpoint now fetches complaints *with their full timelines*
            axios.get(`http://localhost:5000/api/complaints/user/${userId}`)
                .then((res) => {
                    const sortedComplaints = res.data.sort((a, b) => b.id - a.id);
                    setComplaints(sortedComplaints);
                })
                .catch((err) => {
                    console.error("Error fetching user complaints:", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [userId, navigate]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const getStatusClass = (status) => {
        switch (status) {
            case 'Resolved': return 'resolved';
            case 'New': return 'new';
            case 'Under Review':
            case 'Assigned': return 'review';
            case 'Reply Sent': return 'reply';
            default: return '';
        }
    };
    
    const getTimelineIcon = (status) => {
        switch (status) {
            case 'Resolved': return '✅';
            case 'Reply Sent': return '✉️';
            case 'New': return '📥';
            case 'Assigned': return '👤';
            case 'Under Review': return '🔍';
            default: return '⚙️';
        }
    }
    
    const toggleHistory = (complaintId) => {
        setExpandedComplaintId(expandedComplaintId === complaintId ? null : complaintId);
    };

    if (loading) {
        return <div className="loading-message">Loading your complaints...</div>;
    }

    return (
        <div className="complaints-container">
            <h2>📄 My Complaints</h2>

            {complaints.length === 0 ? (
                <p className="no-complaints">No complaints submitted yet. Use the '+' tab to submit one!</p>
            ) : (
                complaints.map((c) => {
                    const currentStatus = c.status || 'New';
                    const currentIndex = statusSteps.indexOf(currentStatus);
                    const isExpanded = expandedComplaintId === c.id;

                    return (
                        <div key={c.id} className="complaint-card">
                            <h3 className="complaint-subject">{c.subject}</h3>

                            {/* Status Flow Bar */}
                            <div className="status-flow">
                                {statusSteps.map((s, i) => (
                                    <div
                                        key={s}
                                        className={`step ${
                                            i < currentIndex 
                                                ? "completed" 
                                                : i === currentIndex
                                                ? "current"
                                                : ""
                                            }`}
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>

                            {/* Complaint Summary Info */}
                            <div className="complaint-info">
                                <p><strong>ID:</strong> #{c.id} {c.is_anonymous ? '(Anonymous)' : ''}</p>
                                <p><strong>Category:</strong> {c.category}</p>
                                <p><strong>Status:</strong> <span className={getStatusClass(currentStatus)}>{currentStatus}</span></p>
                                <p><strong>Submitted:</strong> {new Date(c.created_at).toLocaleDateString()}</p>
                            </div>
                            
                            {/* Toggle History Button */}
                            <button 
                                onClick={() => toggleHistory(c.id)} 
                                className="details-button"
                            >
                                {isExpanded ? 'Hide History ⬆️' : 'View History & Details ⬇️'}
                            </button>
                            
                            {/* Inline History Timeline */}
                            {isExpanded && (
                                <div className="inline-timeline-wrapper">
                                    <h4 className="timeline-heading">Update History</h4>
                                    <p className="description-label"><strong>Description:</strong></p>
                                    <div className="description-box">{c.description}</div>
                                    
                                    <div className="timeline-container">
                                        {c.timeline && c.timeline.length > 0 ? (
                                            c.timeline.map((update) => (
                                                <div key={update.id} className={`timeline-item ${getStatusClass(update.status)}`}>
                                                    <div className="timeline-icon">{getTimelineIcon(update.status)}</div>
                                                    <div className="timeline-content">
                                                        <p className="timeline-meta">
                                                            <span className="timeline-date">{new Date(update.updated_at).toLocaleString()}</span>
                                                            by <strong>{update.updated_by}</strong>
                                                        </p>
                                                        <h4>{update.status}</h4>
                                                        <p className="timeline-comment">{update.comment}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-timeline-msg">No administrative updates recorded yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <Link to="/dashboard" className="nav-link">🏠 Dashboard</Link>
                <Link to="/complaintform" className="nav-link">➕ Submit</Link>
                <Link to="/my-complaints" className="nav-link active">📄 My Complaints</Link>
            </nav>
        </div>
    );
};

export default MyComplaints;
