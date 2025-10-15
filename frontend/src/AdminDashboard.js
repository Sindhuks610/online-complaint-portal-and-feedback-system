import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css"; // Ensure path is correct

const calculateResolutionTime = (created, resolved) => {
    if (!resolved || !created) return null;
    const createdDate = new Date(created);
    const resolvedDate = new Date(resolved);
    const diffTime = Math.abs(resolvedDate - createdDate);
    // Convert milliseconds to days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const formatTime = (days) => {
    if (days === 1) return "1 day";
    if (days > 1) return `${days} days`;
    return "Same day";
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        new: 0,
        review: 0,
        resolved: 0,
        total: 0,
        avgTime: "–",
    });
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Logout Handler ---
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Protect route & fetch data
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        // Check for 'admin' role, fallback to simple email check if role is missing
        if (!user || (user.role !== "admin" && user.email !== "admin@example.com")) {
            navigate("/login");
            return;
        } else {
            fetchDashboardData();
        }
    }, [navigate]);

    // Fetch stats and all complaints for listing recent resolved ones
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, complaintsRes] = await Promise.all([
                axios.get("http://localhost:5000/api/admin/dashboard-stats"),
                axios.get("http://localhost:5000/api/admin/complaints")
            ]);

            // Assuming the backend returns avgTime in a format we can use directly
            // Or we calculate it client-side if the server only provides total resolved time/count
            setStats(statsRes.data);

            // Filter and prepare resolved complaints for the list
            const resolvedList = complaintsRes.data
                .filter(c => c.status === 'Resolved' && c.resolved_at) // Ensure resolved_at exists
                .map(c => ({
                    ...c,
                    // Calculate and format resolution time
                    resolutionTime: formatTime(calculateResolutionTime(c.created_at, c.resolved_at)),
                    // Format resolved date
                    resolved_at: new Date(c.resolved_at).toLocaleDateString(),
                }))
                // Sorting by resolved_at DESC is important to show most recent first
                .sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at)) 
                .slice(0, 5); // Show only the 5 most recent
            
            setComplaints(resolvedList);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            // Optionally set an error state
        } finally {
            setLoading(false);
        }
    };

    // --- Header component for loading state and main display ---
    const Header = () => (
        <header className="admin-header">
            <h1 className="header-title">Online Complaint Portal & Feedback System</h1>
            <button onClick={handleLogout} className="logout-button">Logout</button>
        </header>
    );

    if (loading) {
        // Show header even during loading
        return (
            <>
                <Header />
                <div className="admin-dashboard-container">Loading Admin Dashboard...</div>
            </>
        );
    }

    return (
        <>
            {/* --- Main Dashboard Header --- */}
            <Header />

            <div className="admin-dashboard-container">
                <h1>Online Complaint Portal & Feedback System Admin Dashboard Overview 📊</h1>

                {/* Stats Summary */}
                <div className="admin-stats-summary">
                    <div className="stat-box-admin total">
                        <h3>Total Complaints</h3>
                        <p>{stats.total}</p>
                    </div>
                    <div className="stat-box-admin new">
                        <h3>New Complaints</h3>
                        <p>{stats.new}</p>
                    </div>
                    <div className="stat-box-admin review">
                        <h3>In Progress</h3>
                        <p>{stats.review}</p>
                    </div>
                    <div className="stat-box-admin resolved">
                        <h3>Avg. Resolution Time</h3>
                        <p>{stats.avgTime} days</p>
                    </div>
                </div>
                
                {/* Recent Solved Complaints */}
                <section className="dashboard-section">
                    <h3>Recently Resolved Complaints ({complaints.length})</h3>
                    {complaints.length === 0 ? (
                        <p>No complaints have been resolved recently.</p>
                    ) : (
                        <div className="solved-list">
                            {complaints.map((c) => (
                                <div key={c.id} className="solved-item">
                                    <div className="solved-item-main">
                                        <p className="subject"><strong>Subject:</strong> {c.subject}</p>
                                        <p className="resolution-time">
                                            Resolved in: <span>{c.resolutionTime}</span>
                                        </p>
                                    </div>
                                    <div className="solved-item-meta">
                                        <p><strong>ID:</strong> #{c.id}</p>
                                        <p><strong>Submitted By:</strong> {c.user_name || "N/A"}</p>
                                        <p><strong>Resolved On:</strong> {c.resolved_at}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                
                {/* Footer Navigation - UPDATED WITH FEEDBACK AND REPORTS */}
                <footer className="admin-footer-nav">
                    <Link to="/admin/dashboard" className="active">🏠 Dashboard</Link>
                    <Link to="/admin/complaints">📋 Complaints</Link>
                    <Link to="/admin/users">👥 Users</Link>
                    <Link to="/admin/feedback">⭐ Feedback</Link>
                    <Link to="/admin/reports">📊 Reports</Link>
                    <Link to="/admin/settings">⚙️ Settings</Link>
                </footer>
            </div>
        </>
    );
};

export default AdminDashboard;