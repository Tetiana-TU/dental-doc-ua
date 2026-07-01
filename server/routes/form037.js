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
        cleanProcedures,
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
    console.log("🔥 RAW BODY:", req.body);

    const doctorId = req.doctor.id;

    const {
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
      uop,
    } = req.body;

    // =============================
    // 🧼 CLEANERS (production safe)
    // =============================

    const sqlDate = date ? new Date(date).toISOString().split("T")[0] : null;
    const sqlTime = visit_time || null;

    // TEXT CLEAN
    const toText = (v) => {
      if (v === undefined || v === null || v === "") return null;
      return String(v);
    };

    // NUMBER CLEAN
    const toNumber = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    // BOOL CLEAN (ВАЖЛИВО!)
    const toBool = (v) => {
      if (v === true || v === "true" || v === 1 || v === "1") return true;
      if (v === false || v === "false" || v === 0 || v === "0") return false;
      return null; // 👈 ключове: НЕ ""
    };
    const toInt = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : null;
    };

    const cleanSanationPlan = toBool(sanation_plan);

    const cleanProcedures = Array.isArray(procedures)
      ? JSON.stringify(procedures.filter((v) => v))
      : JSON.stringify([]);

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
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
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
      RETURNING *
      `,
      [
        doctorId,
        patient_id,
        sqlDate,
        sqlTime,
        toText(patient_name),
        toInt(age),
        toText(gender),
        toText(visit_type),
        toText(diagnosis_1),
        toText(diagnosis_2),

        JSON.stringify(cleanProcedures),

        toText(anesthesia),
        toText(sanation),
        cleanSanationPlan,
        toNumber(uop),
      ],
    );

    res.json({
      ok: true,
      row: result.rows[0],
    });
  } catch (err) {
    console.error("❌ ROW ERROR:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
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
