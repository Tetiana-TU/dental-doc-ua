import authMiddleware from "../middleware/auth.js";
import express from "express";
import pool from "../../server/db.js";
const router = express.Router();

function toSqlDate(value) {
  if (!value) return null;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${year}-${month}-${day}`;
}

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
      anesthesia,
      sanation,
      sanation_plan,
      uop,
    } = req.body;
    console.log("DATE FROM FRONT:", date);
    const sqlDate = toSqlDate(date);
    const sqlTime = visit_time ? String(visit_time) : null;

    const result = await pool.query(
      `INSERT INTO form_037 (
        doctor_id, date, visit_time,
        patient_name, age, gender,
        visit_type, diagnosis_1, diagnosis_2,
        procedures, anesthesia,
        sanation,sanation_plan, uop
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        doctorId,
        sqlDate,
        sqlTime,
        patient_name,
        age ? Number(age) : null,
        gender,
        visit_type,
        diagnosis_1,
        diagnosis_2,
        JSON.stringify(procedures || []),
        anesthesia,
        sanation,
        sanation_plan,
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
  try {
    const doctorId = req.doctor.id;

    // 1. Деструктуруємо правильні назви ключів, які приходять з вашого fetch-запиту
    const {
      patient_id,
      date, // це row.colDate з фронтенду
      visit_time, // це row.col2 з фронтенду
      patient_name, // це row.col3 з фронтенду
      age, // це row.col4 з фронтенду
      gender, // це row.col5 з фронтенду
      visit_type, // це row.col6 з фронтенду
      diagnosis_1, // це row.col9_1 з фронтенду
      diagnosis_2, // це row.col9_2 з фронтенду
      procedures, // це масив [row.col10_1, row.col10_2, row.col10_3] з фронтенду
      anesthesia, // це row.col11 з фронтенду
      sanation, // це row.col12 з фронтенду
      sanation_plan, // це row.col13 з фронтенду
      uop, // це row.col14 з фронтенду
    } = req.body;

    // 2. Валідація та конвертація дати (тепер перевіряємо правильну змінну "date")
    if (!date) {
      console.log("❌ EMPTY DATE BODY:", req.body);
      return res.status(400).json({ message: "Date is required" });
    }
    const sqlDate = toSqlDate(date);
    const sqlTime = visit_time ? String(visit_time) : null;

    // 3. Запит до бази даних
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
        anesthesia,
        sanation,
        sanation_plan,
        uop
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )
      ON CONFLICT (patient_id, date, visit_time)
      DO UPDATE SET
        patient_name = EXCLUDED.patient_name,
        age = EXCLUDED.age,
        gender = EXCLUDED.gender,
        visit_type = EXCLUDED.visit_type,
        diagnosis_1 = EXCLUDED.diagnosis_1,
        diagnosis_2 = EXCLUDED.diagnosis_2,
        procedures = EXCLUDED.procedures,
        anesthesia = EXCLUDED.anesthesia,
        sanation = EXCLUDED.sanation,
        sanation_plan = EXCLUDED.sanation_plan,
        uop = EXCLUDED.uop
      `,
      [
        doctorId,
        patient_id,
        sqlDate,
        sqlTime,
        patient_name,
        age ? Number(age) : null,
        gender,
        visit_type,
        diagnosis_1,
        diagnosis_2,
        JSON.stringify(procedures || []), // перетворюємо масив процедур у JSON-рядок для бази
        anesthesia,
        sanation,
        sanation_plan,
        uop,
      ],
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("DB ERROR:", err.message);
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
       ORDER BY date ASC, visit_time ASC`,
      [doctorId, month, year],
    );

    res.json(
      result.rows.map((r) => ({
        ...r,
        date:
          r.date instanceof Date
            ? r.date.toISOString().split("T")[0]
            : String(r.date),
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});
export default router;
