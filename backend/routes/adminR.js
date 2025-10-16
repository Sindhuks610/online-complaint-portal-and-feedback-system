import express from "express";
import pool from "../Service.js";

const router = express.Router();

/* 🟢 Get Complaint Statistics for Dashboard */
// Route: /api/admin/dashboard-stats
router.get("/dashboard-stats", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        SUM(status = 'New') AS newCount,
        SUM(status IN ('Under Review', 'Assigned')) AS reviewCount,
        SUM(status = 'Resolved') AS resolvedCount,
        COUNT(*) AS totalCount,
        -- Calculate average resolution time in days for resolved complaints
        AVG(DATEDIFF(resolved_at, created_at)) AS avgResolutionDays
      FROM complaints
    `);
    
    const stats = rows[0];
    const avgTime = stats.avgResolutionDays ? parseFloat(stats.avgResolutionDays).toFixed(1) : '–';

    res.json({
        new: stats.newCount || 0,
        review: stats.reviewCount || 0,
        resolved: stats.resolvedCount || 0,
        total: stats.totalCount || 0,
        avgTime: avgTime,
    });

  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: err.message });
  }
});

/* 🟣 Get All Complaints with Timeline (Admin View) */
// Route: /api/admin/complaints
router.get("/complaints", async (req, res) => {
  try {
    const [complaints] = await pool.query(`
      SELECT c.*, 
            u.name AS user_name, 
            s.name AS staff_name -- Staff name is fetched via assigned_to ID
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users s ON c.assigned_to = s.id
      ORDER BY c.created_at DESC
    `);

    const complaintsWithTimeline = await Promise.all(
      complaints.map(async (complaint) => {
        // Fetch the full timeline/history for each complaint
        const [timeline] = await pool.query(
          `SELECT * FROM complaint_updates WHERE complaint_id = ? ORDER BY updated_at ASC`,
          [complaint.id]
        );
        return { ...complaint, timeline };
      })
    );
    res.json(complaintsWithTimeline);
  } catch (err) {
    console.error("Error fetching admin complaints:", err);
    res.status(500).json({ error: err.message });
  }
});

/* 1. Assign Staff to Complaint */
// Route: /api/admin/complaints/:id/assign
router.post("/complaints/:id/assign", async (req, res) => {
  const { staff_id, updated_by } = req.body;
  const complaintId = req.params.id;

  try {
    await pool.query('START TRANSACTION');

    // 1. Assign the staff and set status to 'Under Review'
    await pool.query(
      `UPDATE complaints SET assigned_to = ?, status = 'Under Review' WHERE id = ?`,
      [staff_id, complaintId]
    );

    // 2. Add to timeline
    await pool.query(
      `INSERT INTO complaint_updates (complaint_id, status, comment, updated_by)
       VALUES (?, 'Assigned', ?, ?)`,
      [complaintId, `Assigned to staff ID ${staff_id}`, updated_by]
    );

    await pool.query('COMMIT');
    res.json({ message: "Complaint assigned successfully" });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Error assigning complaint:", err);
    res.status(500).json({ error: err.message });
  }
});

/* 2. Add Public Reply / Comment */
// Route: /api/admin/complaints/:id/reply
router.post("/complaints/:id/reply", async (req, res) => {
  const { reply, updated_by } = req.body;
  const complaintId = req.params.id;

  try {
    // Inserts the public reply into the timeline with a special 'Reply Sent' status
    await pool.query(
      `INSERT INTO complaint_updates (complaint_id, status, comment, updated_by)
       VALUES (?, 'Reply Sent', ?, ?)`,
      [complaintId, reply, updated_by]
    );
    
    res.json({ message: "Reply sent successfully" });
  } catch (err) {
    console.error("Error sending reply:", err);
    res.status(500).json({ error: err.message });
  }
});

/* 3. Update Complaint Status (CRITICAL NEW ROUTE) */
// Route: /api/admin/complaints/status/:id
router.patch("/complaints/status/:id", async (req, res) => {
    const { status, comment, updated_by } = req.body;
    const complaintId = req.params.id;

    if (!status || !updated_by) {
        return res.status(400).json({ error: "Status and updated_by are required." });
    }

    // Set resolved_at to the current time if the status is 'Resolved', otherwise set it to NULL
    const resolved_at_clause = status === 'Resolved' ? ', resolved_at = NOW()' : ', resolved_at = NULL';
    
    try {
        await pool.query('START TRANSACTION');

        // 1. Update the complaint status
        await pool.query(
            `UPDATE complaints 
             SET status = ? ${resolved_at_clause}
             WHERE id = ?`,
            [status, complaintId]
        );

        // 2. Insert the status change into the timeline
        await pool.query(
            `INSERT INTO complaint_updates (complaint_id, status, comment, updated_by)
             VALUES (?, ?, ?, ?)`,
            [complaintId, status, comment, updated_by]
        );

        await pool.query('COMMIT');
        res.json({ message: "Complaint status and timeline updated successfully" });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Error updating complaint status:", err);
        res.status(500).json({ error: err.message });
    }
});


// ... (keep all existing routes)

/* 🟣 Escalate a Complaint */
// Route: POST /api/admin/complaints/:id/escalate
router.post("/complaints/:id/escalate", async (req, res) => {
  const complaintId = req.params.id;
  const { escalated_to, reason, updated_by } = req.body;

  if (!escalated_to || !reason || !updated_by) {
    return res.status(400).json({ error: "Missing required escalation details." });
  }

  try {
    // Use a transaction to ensure all database updates succeed or fail together
    await pool.query('START TRANSACTION');

    // 1. Insert a new record into your 'escalations' table
    await pool.query(
      `INSERT INTO escalations (complaint_id, escalated_to, reason) VALUES (?, ?, ?)`,
      [complaintId, escalated_to, reason]
    );

    // 2. Update the main complaint's status to 'Escalated'
    await pool.query(
      `UPDATE complaints SET status = 'Escalated' WHERE id = ?`,
      [complaintId]
    );

    // 3. Add an entry to the 'complaint_updates' table to log this action in the timeline
    const timelineComment = `Escalated to user ID ${escalated_to}. Reason: ${reason}`;
    await pool.query(
      `INSERT INTO complaint_updates (complaint_id, status, comment, updated_by) VALUES (?, 'Escalated', ?, ?)`,
      [complaintId, timelineComment, updated_by]
    );

    await pool.query('COMMIT'); // Finalize the transaction
    res.json({ message: "Complaint escalated successfully" });

  } catch (err) {
    await pool.query('ROLLBACK'); // Revert changes if an error occurred
    console.error("Error escalating complaint:", err);
    res.status(500).json({ error: "Failed to escalate complaint." });
  }
});

// ... (keep the rest of the file)
// --- (Keep all existing routes in adminR.js) ---

/* 🟢 GET All Feedback for Admin Panel */
// Route: /api/admin/feedback
router.get("/feedback", async (req, res) => {
  try {
    const [feedbackList] = await pool.query(`
      SELECT f.*, u.name AS user_name, u.email AS user_email
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `);
    res.json(feedbackList);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ error: "Failed to fetch feedback." });
  }
});

/* 🔵 GET and PUT for System Configuration */
// Route: /api/admin/config
router.get("/config", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM system_config");
        // Convert array of objects to a single key-value object
        const config = rows.reduce((acc, row) => {
            acc[row.config_key] = row.config_value;
            return acc;
        }, {});
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/config", async (req, res) => {
    const { escalation_time_limit } = req.body;
    try {
        // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both cases
        await pool.query(
            `INSERT INTO system_config (config_key, config_value) VALUES ('escalation_time_limit', ?)
             ON DUPLICATE KEY UPDATE config_value = ?`,
            [escalation_time_limit, escalation_time_limit]
        );
        res.json({ message: "Settings updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* 🔴 POST for Exporting Reports as CSV */
// Route: /api/admin/reports/export
router.post("/reports/export", async (req, res) => {
    try {
        const { startDate, endDate, category } = req.body;
        let query = `
            SELECT c.id, c.subject, c.category, c.status, u.name as user_name, c.created_at, c.resolved_at 
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (startDate && endDate) {
            query += ` AND c.created_at BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }
        if (category && category !== 'All') {
            query += ` AND c.category = ?`;
            params.push(category);
        }
        
        const [rows] = await pool.query(query, params);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "No data found for the selected criteria." });
        }

        // Convert JSON to CSV
        const fields = ['id', 'subject', 'category', 'status', 'user_name', 'created_at', 'resolved_at'];
        const json2csv = (data) => {
            const header = fields.join(',') + '\n';
            const body = data.map(row => fields.map(field => JSON.stringify(row[field])).join(',')).join('\n');
            return header + body;
        };

        const csv = json2csv(rows);

        res.header('Content-Type', 'text/csv');
        res.attachment('complaints-report.csv');
        res.send(csv);

    } catch (err) {
        console.error("Error exporting report:", err);
        res.status(500).json({ error: "Failed to generate report." });
    }
});

// GET All Admins (for escalation dropdown)
// Route: /api/admin/users/admins
// ----------------------
router.get("/admins", async (req, res) => {
  try {
    const [admins] = await pool.query(
      `SELECT id, name FROM users WHERE role = 'admin' ORDER BY name ASC`
    );
    res.json(admins);
  } catch (err)
  {
    console.error("Error fetching admins:", err);
    res.status(500).json({ error: "Failed to retrieve admin list." });
  }
});


export default router;
