import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./AdminUsers.css"; // Ensure path is correct

const API_BASE_URL = "http://localhost:5000/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get current admin user details for authorization
  const user = JSON.parse(localStorage.getItem("user"));

  // --- Auth Check ---
  useEffect(() => {
    // Simple admin check: only allow if user exists and has the admin role
    if (!user || user.role !== "admin") {
      // Redirect to login or home if not authorized
      navigate("/login"); 
    } else {
      fetchUsers();
    }
  }, [navigate, user?.role]);

  // --- Data Fetching ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch all users
      const res = await axios.get(`${API_BASE_URL}/admin/users`);
      setUsers(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load user list.");
    } finally {
      setLoading(false);
    }
  };

  // --- Role Update Logic ---
  const handleRoleChange = async (userId, newRole) => {
    // Prevent admin from changing their own role (self-lockout prevention)
    if (userId === user.id) {
        alert("You cannot change your own role!");
        return;
    }
    
    // Optimistic UI update
    const originalUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

    try {
      // API call to update the role
      await axios.patch(`${API_BASE_URL}/admin/users/role/${userId}`, { role: newRole });
      alert(`User ID ${userId}'s role updated to ${newRole.toUpperCase()}`);
    } catch (err) {
      console.error("Error updating role:", err);
      alert(`Failed to update role for user ID ${userId}.`);
      // Revert change on failure
      setUsers(originalUsers);
    }
  };


  if (loading) return <div className="admin-users-container">Loading Users...</div>;
  if (error) return <div className="admin-users-container" style={{color: 'red'}}>{error}</div>;

  return (
    <div className="admin-users-container">
      <h2>👥 User Management Panel</h2>
      <p>Total Registered Users: **{users.length}**</p>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              // Use user role for conditional styling
              <tr key={u.id} className={`role-${u.role}`}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>{u.role.toUpperCase()}</td>
                <td>
                  <select
                    value={u.role}
                    // Disable role change for the currently logged-in admin
                    disabled={u.id === user.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="role-selector"
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admin Footer Navigation */}
      <footer className="admin-footer-nav">
        <Link to="/admin/dashboard">🏠 Dashboard</Link>
        <Link to="/admin/complaints">📋 Complaints</Link>
        <Link to="/admin/users" className="active">👥 Users</Link>
        <Link to="/admin/feedback">⭐ Feedback</Link>
        <Link to="/admin/reports">📊 Reports</Link>
        <Link to="/admin/settings">⚙️ Settings</Link>
      </footer>
    </div>
  );
};

export default AdminUsers;