import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Authentication Pages
import Home from './home';      
import Login from './login';    
import Signup from './signup';  

// User Pages (You just created these)
import Dashboard from './dashboard'; 
import ComplaintForm from "./complaintform";
import MyComplaints from "./MyComplaints";

// Admin Pages (You will fully implement these next)
import AdminDashboard from "./AdminDashboard";
import AdminComplaints from "./AdminComplaints";
import AdminUsers from "./AdminUsers";
import AdminSettings from "./AdminSettings";
import AdminFeedback from "./AdminFeedback";
import AdminReports from "./AdminReports";
import EscalateComplaint from "./EscalateComplaint";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default redirect to Home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Authentication Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* User Routes (Protected) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complaintform" element={<ComplaintForm />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        
        {/* Admin Routes (Protected - Role: 'admin') */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/complaints" element={<AdminComplaints />} />
        <Route path="/admin/escalate/:complaintId" element={<EscalateComplaint />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/feedback" element={<AdminFeedback />}/> {/* 👈 ADD THIS */}
        <Route path="/admin/reports" element={<AdminReports />}/>   
        <Route path="/admin/settings" element={<AdminSettings />}/>
      </Routes>
    </Router>
  );
}

export default App;