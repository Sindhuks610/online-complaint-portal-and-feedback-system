import express from "express";
import pool from "../Service.js";

const router = express.Router();

// --- Update complaint status ---
// Route: /api/admin/complaints/status/:complaint_id
router.patch("/complaints/status/:complaint_id", async (req, res) => {
  try {
    const complaintId = req.params.complaint_id;
    const { status, comment, updated_by } = req.body;
    let resolvedAtUpdate = '';

    // If the new status is 'Resolved', set the resolved_at timestamp
    if (status === 'Resolved') {
        resolvedAtUpdate = `, resolved_at = CURRENT_TIMESTAMP`;
    } else {
        // If status changes from resolved, clear the timestamp
        resolvedAtUpdate = `, resolved_at = NULL`;
    }

    await pool.query('START TRANSACTION');

    // 1. Update the complaint status (and resolved_at if necessary)
    await pool.query(
      `UPDATE complaints SET status = ? ${resolvedAtUpdate} WHERE id = ?`,
      [status, complaintId]
    );

    // 2. Insert into timeline
    await pool.query(
      `INSERT INTO complaint_updates (complaint_id, status, comment, updated_by) VALUES (?, ?, ?, ?)`,
      [complaintId, status, comment, updated_by]
    );

    await pool.query('COMMIT');
    res.json({ message: `Complaint status updated to ${status}` });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Error updating complaint status:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;