import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './EscalateComplaint.css';

const API_BASE_URL = 'http://localhost:5000/api';

const EscalateComplaint = () => {
    const { complaintId } = useParams();
    const navigate = useNavigate();
    const adminUser = JSON.parse(localStorage.getItem('user'));

    const [complaint, setComplaint] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [escalatedToId, setEscalatedToId] = useState('');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!adminUser || adminUser.role !== 'admin') {
                navigate('/login');
                return;
            }
            try {
                const [complaintRes, adminsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/complaints/${complaintId}`),
                    axios.get(`${API_BASE_URL}/admin/users/admins`)
                ]);
                setComplaint(complaintRes.data);
                setAdmins(adminsRes.data.filter(admin => admin.id !== adminUser.id));
            } catch (error) {
                setMessage('Error loading data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [complaintId, adminUser.id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!escalatedToId || !reason) {
            setMessage('Please select a higher authority and provide a reason.');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/admin/complaints/${complaintId}/escalate`, {
                escalated_to: escalatedToId,
                reason: reason,
                updated_by: adminUser.id,
            });
            alert('Complaint escalated successfully!');
            navigate('/admin/complaints');
        } catch (error) {
            setMessage('Failed to escalate. Please try again.');
        }
    };

    if (isLoading) return <div className="escalate-container">Loading...</div>;
    if (!complaint) return <div className="escalate-container">Complaint not found.</div>;

    return (
        <div className="escalate-container">
            <form onSubmit={handleSubmit} className="escalate-form">
                <h2>Escalate Complaint</h2>
                
                <div className="complaint-details-box">
                    <h3>Complaint Details</h3>
                    <p><strong>ID:</strong> #{complaint.id}</p>
                    <p><strong>Subject:</strong> {complaint.subject}</p>
                </div>

                <div className="escalation-options">
                    <h3>Escalation Options</h3>
                    <label htmlFor="higher-authority">Select Higher Authority</label>
                    <select id="higher-authority" value={escalatedToId} onChange={(e) => setEscalatedToId(e.target.value)} required>
                        <option value="" disabled>-- Select an Admin --</option>
                        {admins.map((admin) => (
                            <option key={admin.id} value={admin.id}>{admin.name}</option>
                        ))}
                    </select>

                    <label htmlFor="reason">Reason for Escalation</label>
                    <textarea id="reason" rows="4" placeholder="State why this complaint needs escalation..." value={reason} onChange={(e) => setReason(e.target.value)} required></textarea>
                </div>
                
                {message && <p className="status-message">{message}</p>}

                <button type="submit" className="submit-escalation-btn">Escalate Complaint</button>
                <Link to="/admin/complaints" className="cancel-link">Cancel</Link>
            </form>
        </div>
    );
};

export default EscalateComplaint;