import authMiddleware from "../middleware/auth.js";
import express from "express";
import pool from "../../server/db.js";
import { buildSummary } from "../utils/buildSummary.js";

console.log("🔥 FORM039 ROUTE LOADED");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const doctorId = req.doctor.id;
  const { start, end } = req.query;

  const result = await pool.query(
    `
        SELECT *
        FROM form_037
        WHERE doctor_id=$1
          AND date BETWEEN $2 AND $3
        ORDER BY date, visit_time
        `,
    [doctorId, start, end],
  );

  res.json(result.rows);
});
export default router;
