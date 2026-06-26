import authMiddleware from "../middleware/auth.js";
import express from "express";
import pool from "../../server/db.js";
function toSqlDate(value) {
  if (!value) return null;

  const parts = value.split(".");

  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }

  return value;
}
function formatDate(sqlDate) {
  if (!sqlDate) return null;
  const d = new Date(sqlDate);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
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
    const sqlDate = toSqlDate(date);
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
        sqlDate,
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
router.post("/row", authMiddleware, async (req, res) => {
  console.log("🔥 POST /api/form037/row");

  try {
    const doctorId = req.doctor.id;
    const row = req.body;

    const sqlDate = toSqlDate(row.colDate);

    await pool.query(
      `
      INSERT INTO form_037 (
        doctor_id,
        patient_id,
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
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      )

      ON CONFLICT (patient_id)

      DO UPDATE SET
        doctor_id = EXCLUDED.doctor_id,
        date = EXCLUDED.date,
        visit_time = EXCLUDED.visit_time,
        patient_name = EXCLUDED.patient_name,
        age = EXCLUDED.age,
        gender = EXCLUDED.gender,
        visit_type = EXCLUDED.visit_type,
        diagnosis_1 = EXCLUDED.diagnosis_1,
        diagnosis_2 = EXCLUDED.diagnosis_2,
        procedures = EXCLUDED.procedures,
        anesthesia_local = EXCLUDED.anesthesia_local,
        anesthesia_general = EXCLUDED.anesthesia_general,
        sanation = EXCLUDED.sanation,
        uop = EXCLUDED.uop
      `,
      [
        doctorId,
        row.patient_id,
        sqlDate,
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

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
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
