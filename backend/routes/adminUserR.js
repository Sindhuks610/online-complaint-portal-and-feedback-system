import express from "express";
import pool from "../Service.js";

const router = express.Router();

// ----------------------
// GET All Users
// Route: /api/admin/users/
// ----------------------
router.get("/", async (req, res) => {
  try {
    // Selects user data, including the role
    const [users] = await pool.query(
      `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ error: "Failed to retrieve user list." });
  }
});

// ----------------------
// PATCH Update User Role
// Route: /api/admin/users/role/:id
// ----------------------
router.patch("/role/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required." });
    }
    
    // Ensure the role is a valid type before updating
    const validRoles = ['user', 'staff', 'admin'];
    if (!validRoles.includes(role.toLowerCase())) {
        return res.status(400).json({ error: `Invalid role specified. Must be one of: ${validRoles.join(', ')}` });
    }

    const [result] = await pool.query(
      `UPDATE users SET role = ? WHERE id = ?`,
      [role, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: `Role updated to ${role} for user ${userId}` });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;