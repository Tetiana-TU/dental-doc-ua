import authMiddleware from "../middleware/auth.js";
import express from "express";
import pool from "../../server/db.js";
import { buildSummary } from "../utils/buildSummary.js";

const router = express.Router();
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate і endDate обов'язкові" });
    }

    await pool.query("BEGIN");

    const result = await pool.query(
      `SELECT * FROM form_037
       WHERE doctor_id = $1
       AND date >= $2 AND date <= $3`,
      [doctorId, startDate, endDate],
    );

    const summary = buildSummary(result.rows);

    const saved = await pool.query(
      `INSERT INTO form_039 (doctor_id, start_date, end_date, data)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [doctorId, startDate, endDate, summary],
    );
    await pool.query("COMMIT");
    res.json(saved.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Помилка генерації звіту" });
  }
});
export default router;
