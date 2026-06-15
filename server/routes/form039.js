import authMiddleware from "../middleware/auth.js";
import express from "express";
import pool from "../db.js";
import { buildSummary } from "../utils/buildSummary.js";

const router = express.Router();
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const { startDate, endDate } = req.body;

    const result = await pool.query(
      `SELECT * FROM form_037
       WHERE doctor_id = $1
       AND date BETWEEN $2 AND $3`,
      [doctorId, startDate, endDate],
    );

    const summary = buildSummary(result.rows);

    const saved = await pool.query(
      `INSERT INTO form_039 (doctor_id, start_date, end_date, data)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [doctorId, startDate, endDate, summary],
    );

    res.json(saved.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error generating report" });
  }
});
export default router;
