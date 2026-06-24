import authMiddleware from "../middleware/auth.js";
import express from "express";
import pool from "../../server/db.js";
const router = express.Router();
router.post("/", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;

    const {
      date,
      visit_time,
      patient_name,
      age,
      gender,
      visit_type,
      diagnosis_1,
      diagnosis_2,
      procedures,
      anesthesia_local,
      anesthesia_general,
      sanation,
      uop,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO form_037 (
        doctor_id, date, visit_time,
        patient_name, age, gender,
        visit_type, diagnosis_1, diagnosis_2,
        procedures, anesthesia_local, anesthesia_general,
        sanation, uop
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        doctorId,
        date,
        visit_time,
        patient_name,
        age,
        gender,
        visit_type,
        diagnosis_1,
        diagnosis_2,
        procedures,
        anesthesia_local,
        anesthesia_general,
        sanation,
        uop,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});
router.post("/bulk", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const { rows } = req.body;

    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ message: "No rows provided" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const row of rows) {
        await client.query(
          `INSERT INTO form_037 (
            doctor_id,
            date,
            visit_time,
            patient_name,
            age,
            gender,
            visit_type,
            diagnosis_1,
            diagnosis_2,
            procedures,
            anesthesia_local,
            anesthesia_general,
            sanation,
            uop
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [
            doctorId,
            row.colDate,
            row.col2,
            row.col3,
            row.col4 ? Number(row.col4) : null,
            row.col5,
            row.col6,
            row.col9_1,
            row.col9_2,
            [row.col10_1, row.col10_2, row.col10_3],
            row.col11,
            null,
            false,
            row.col14,
          ],
        );
      }

      await client.query("COMMIT");
      res.json({ message: "Bulk saved successfully" });
    } catch (err) {
      await client.query("ROLLBACK");

      console.error("POSTGRES ERROR:");
      console.error(err);
      console.error(err.message);

      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("BULK ERROR:");
    console.error(err);
    console.error(err.message);

    res.status(500).json({ message: err.message });
  }
});
router.get("/", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const { month, year } = req.query;

    const result = await pool.query(
      `SELECT * FROM form_037
       WHERE doctor_id = $1
       AND EXTRACT(MONTH FROM date::date) = $2
AND EXTRACT(YEAR FROM date::date) = $3
       ORDER BY date DESC`,
      [doctorId, month, year],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});
export default router;
