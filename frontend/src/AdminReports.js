import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminReports.css';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminReports = () => {
    const [params, setParams] = useState({
        startDate: '',
        endDate: '',
        category: 'All',
    });
    const [message, setMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleChange = (e) => {
        setParams({ ...params, [e.target.name]: e.target.value });
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setMessage('');
        try {
            const response = await axios.post(`${API_BASE_URL}/admin/reports/export`, params, {
                responseType: 'blob', // Important to handle file download
            });
            
            // Create a link to download the file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            setMessage('Failed to generate report. No data might be available for the selected criteria.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="admin-reports-container">
            <header className="page-header">
                <h1>Reports & Exports</h1>
                <p>Generate CSV reports based on specific criteria.</p>
            </header>

            <div className="report-form">
                <div className="form-group">
                    <label>Date Range (Start)</label>
                    <input type="date" name="startDate" value={params.startDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Date Range (End)</label>
                    <input type="date" name="endDate" value={params.endDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={params.category} onChange={handleChange}>
                        <option value="All">All Categories</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Academics">Academics</option>
                        <option value="Security">Security</option>
                        {/* Add other categories here */}
                    </select>
                </div>
                
                <button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Generate & Download CSV'}
                </button>
                {message && <p className="error-message">{message}</p>}
            </div>

            <footer className="admin-footer-nav">
                <Link to="/admin/dashboard">🏠 Dashboard</Link>
                <Link to="/admin/complaints">📋 Complaints</Link>
                <Link to="/admin/users">👥 Users</Link>
                <Link to="/admin/feedback">⭐ Feedback</Link>
                <Link to="/admin/reports" className="active">📊 Reports</Link>
                <Link to="/admin/settings">⚙️ Settings</Link>
            </footer>
        </div>
    );
};

export default AdminReports;