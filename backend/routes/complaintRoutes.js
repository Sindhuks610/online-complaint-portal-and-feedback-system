import express from "express";
import pool from "../Service.js"; // Your MySQL connection
import multer from "multer"; // For handling file uploads
import path from "path";
import fs from "fs"; // For filesystem operations

const router = express.Router();

// ----------------------
// Multer setup for file uploads
// ----------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create 'uploads' folder if it doesn't exist
        const uploadPath = path.join("uploads");
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Create a unique filename: timestamp_originalname
        const originalname = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'); // Clean filename
        cb(null, `${Date.now()}_${originalname}`);
    },
});
const upload = multer({ storage });

// ----------------------
// POST Submit a Complaint - Route: /api/complaints
// ----------------------
router.post("/", upload.single("file_path"), async (req, res) => {
    const { user_id, type, category, subject, description, urgency } = req.body;
    const file_path = req.file ? req.file.filename : null; 

    if (!user_id || !category || !subject || !description) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); 
        return res.status(400).json({ error: "Missing required complaint fields (user_id, category, subject, or description)." });
    }

    try {
        await pool.query('START TRANSACTION'); 

        const is_anonymous = type === 'Anonymous';

        // 1. Insert Complaint 
        const [result] = await pool.query(
            `INSERT INTO complaints (user_id, is_anonymous, category, subject, description, file_path, urgency, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'New')`,
            [user_id, is_anonymous, category, subject, description, file_path, urgency]
        );
        const complaintId = result.insertId;

        // 2. Add to Timeline (Initial Status)
        const updated_by = user_id; 
        await pool.query(
            `INSERT INTO complaint_updates (complaint_id, status, comment, updated_by) VALUES (?, 'New', 'Complaint submitted by user.', ?)`,
            [complaintId, updated_by]
        );

        await pool.query('COMMIT'); 

        res.status(201).json({ 
            message: "Complaint submitted successfully!", 
            complaintId: complaintId 
        });

    } catch (err) {
        await pool.query('ROLLBACK'); 
        console.error("Complaint submission error:", err);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: "Failed to save complaint to database. (Check server logs)" });
    }
});


// ----------------------
// GET Complaint Stats for a User Dashboard
// Route: /api/complaints/stats?user_id=X
// CRITICAL FIX: MOVED THIS ROUTE HIGHER TO PREVENT CONFLICT WITH /:id
// ----------------------
router.get("/stats", async (req, res) => {
    // CRITICAL FIX 1: Parse user_id to ensure it's treated as a number in the query
    const raw_user_id = req.query.user_id;
    const user_id = parseInt(raw_user_id, 10); // Convert string '2' to number 2
    
    if (isNaN(user_id) || user_id === 0) {
        console.error("Stats request failed: Invalid user_id parameter:", raw_user_id);
        return res.status(400).json({ error: "Valid user_id parameter is required for stats." });
    }

    try {
        const [rows] = await pool.query(
            `
             SELECT 
                 COUNT(CASE WHEN TRIM(status) = 'Resolved' THEN 1 END) AS resolved,
                 -- CRITICAL FIX 2: Use TRIM() in case there are hidden spaces in the status string
                 COUNT(CASE WHEN TRIM(status) IN ('New', 'Under Review', 'Assigned', 'Reply Sent') THEN 1 END) AS pending,
                 COUNT(*) AS total
             FROM complaints
             WHERE user_id = ?
            `,
            [user_id] // Pass the parsed number
        );

        const stats = rows[0];
        
        // Ensure values are parsed as integers, handling null/undefined safely
        const total = parseInt(stats.total) || 0;
        const resolved = parseInt(stats.resolved) || 0;
        const pending = parseInt(stats.pending) || 0;

        const response = {
            total: total,
            resolved: resolved,
            pending: pending
        };
        
        // Log the successful data being sent
        console.log(`Stats fetched for user ${user_id}:`, response);

        res.json(response);
    } catch (err) {
        console.error("CRITICAL ERROR fetching stats from database:", err);
        // Send a generic 500 error to the client
        res.status(500).json({ error: "Internal server error while fetching statistics." });
    }
});


// ----------------------
// GET My Complaints: Retrieves all complaints for the logged-in user with their timeline
// Route: /api/complaints/user/:user_id
// ----------------------
router.get("/user/:user_id", async (req, res) => {
    try {
        const userId = req.params.user_id;

        // 1. Fetch ALL complaints for the user
        const [complaints] = await pool.query(
            `SELECT c.*, 
             u.name AS user_name 
             FROM complaints c 
             LEFT JOIN users u ON c.user_id = u.id 
             WHERE c.user_id = ? 
             ORDER BY c.created_at DESC`,
            [userId]
        );

        if (complaints.length === 0) {
            return res.json([]); 
        }
        
        // Extract all complaint IDs
        const complaintIds = complaints.map(c => c.id);
        
        // 2. Fetch ALL timeline updates for ALL of these complaints in ONE query (N+1 Fix)
        const [timelineUpdates] = await pool.query(
            `SELECT * FROM complaint_updates WHERE complaint_id IN (?) ORDER BY updated_at ASC`,
            [complaintIds]
        );

        // 3. Map the timeline updates to their respective complaints in JavaScript (Fast!)
        const timelineMap = timelineUpdates.reduce((acc, update) => {
            if (!acc[update.complaint_id]) {
                acc[update.complaint_id] = [];
            }
            acc[update.complaint_id].push(update);
            return acc;
        }, {});

        // 4. Merge complaints with their timelines
        const complaintsWithTimeline = complaints.map((complaint) => ({
            ...complaint,
            timeline: timelineMap[complaint.id] || [], // Attach the timeline array
        }));

        res.json(complaintsWithTimeline);

    } catch (err) {
        console.error("Error fetching user complaints:", err);
        res.status(500).json({ error: "Failed to fetch user complaints." });
    }
});

// ----------------------
// GET Single Complaint Details (with full Timeline/Updates)
// Route: /api/complaints/:id
// ----------------------
router.get("/:id", async (req, res) => {
    const complaintId = req.params.id;
    try {
        // Fetch the main complaint details
        const [complaints] = await pool.query(
            `SELECT c.*, u.name AS user_name 
             FROM complaints c 
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.id = ?`,
            [complaintId]
        );

        if (complaints.length === 0) {
            return res.status(404).json({ error: "Complaint not found." });
        }

        const complaint = complaints[0];

        // Fetch the public timeline/updates
        const [timeline] = await pool.query(
            `SELECT * FROM complaint_updates WHERE complaint_id = ? ORDER BY updated_at ASC`,
            [complaintId]
        );

        // Combine and send back
        res.json({ ...complaint, timeline });

    } catch (err) {
        console.error("Error fetching single complaint:", err);
        res.status(500).json({ error: err.message });
    }
});


// ----------------------
// Download attached file
// Route: /api/complaints/download/:filename
// ----------------------
router.get("/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ error: "Could not download the file." });
            }
        });
    } else {
        res.status(404).json({ error: "File not found." });
    }
});


export default router;
