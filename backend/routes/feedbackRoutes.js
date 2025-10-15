import express from "express";
import pool from "../Service.js";

const router = express.Router();

// POST /api/feedback - User submits feedback
router.post("/", async (req, res) => {
    const { user_id, rating, comment } = req.body;

    if (!user_id || !rating) {
        return res.status(400).json({ error: "User ID and rating are required." });
    }

    try {
        await pool.query(
            "INSERT INTO feedback (user_id, rating, comment) VALUES (?, ?, ?)",
            [user_id, rating, comment]
        );
        res.status(201).json({ message: "Thank you for your feedback!" });
    } catch (err) {
        console.error("Feedback submission error:", err);
        res.status(500).json({ error: "Failed to submit feedback." });
    }
});

export default router;