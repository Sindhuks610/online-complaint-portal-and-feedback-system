import express from "express";
import cors from "cors";
import path from "path";

// VITAL: Confirm these paths are correct relative to server.js

import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";

// 1. Importing Admin Dashboard/Complaint Routes (using a unique name)
// Assuming adminR.js contains the dashboard and complaints logic you just wrote
import generalAdminRoutes from "./routes/adminR.js"; 

// 2. Importing Admin Users Routes (this name was already unique)
import adminUsersRoutes from "./routes/adminUserR.js"; 
import feedbackRoutes from "./routes/feedbackRoutes.js";

// 3. Removed: The original conflicting 'import adminRoutes from "./routes/adminRoutes.js";' 
//    was removed to fix the SyntaxError.

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (Crucial for uploads)
// Ensure your backend folder contains an 'uploads' directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); 

// Routes
app.use("/api/auth", authRoutes); // Handles /api/auth/login, /api/auth/signup
app.use("/api/complaints", complaintRoutes); // Handles user-side complaint submission/view

// Admin Routes (Consolidated and using unique identifiers)
// Handles /api/admin/dashboard-stats, /api/admin/complaints, etc.
app.use("/api/admin", generalAdminRoutes); 
// Handles user-specific admin routes, like /api/admin/users/
app.use("/api/admin/users", adminUsersRoutes); 
app.use("/api/feedback", feedbackRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend API is running on http://localhost:${PORT}`);
});
