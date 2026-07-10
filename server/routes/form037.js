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
      residence,
      medical_card,
      population_group,
      visit_type,
      diagnosis_1,
      diagnosis_1_tooth,
      diagnosis_2,
      diagnosis_2_tooth,
      procedures,
      anesthesia,
      sanation,
      sanation_plan,
      uop,
    } = req.body;
    const toInt = (v) => {
      if (v === "" || v === null || v === undefined) return null;
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : null;
    };
    const toBool = (v) => {
      if (v === true || v === "true" || v === 1 || v === "1") return true;
      if (v === false || v === "false" || v === 0 || v === "0") return false;
      return null;
    };
    const toSmallInt = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const cleanProcedures = JSON.stringify(
      Array.isArray(procedures) ? procedures.filter(Boolean) : [],
    );

    console.log("DATE FROM FRONT:", date);
    const sqlDate = toSqlDate(date);
    const sqlTime = visit_time ? String(visit_time) : null;

    const result = await pool.query(
      `INSERT INTO form_037 (
        doctor_id, date, visit_time,
        patient_name, age, residence,medical_card,
      population_group,
        visit_type, diagnosis_1, diagnosis_1_tooth,diagnosis_2,diagnosis_2_tooth,
        procedures, anesthesia,
        sanation,sanation_plan, uop
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
      [
        doctorId,
        sqlDate,
        sqlTime,
        patient_name,
        age ? Number(age) : null,
        residence,
        medical_card,
        population_group,
        visit_type,
        diagnosis_1,
        diagnosis_1_tooth,
        diagnosis_2,
        diagnosis_2_tooth,
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
    console.log("TOOTHS FROM BODY:", {
      diagnosis_1_tooth: req.body.diagnosis_1_tooth,
      diagnosis_2_tooth: req.body.diagnosis_2_tooth,
    });

    const doctorId = req.doctor.id;

    const {
      patient_id,
      date,
      visit_time,
      patient_name,
      age,
      residence,
      medical_card,
      population_group,
      visit_type,
      diagnosis_1,
      diagnosis_1_tooth,
      diagnosis_2,
      diagnosis_2_tooth,
      procedures,
      anesthesia,
      sanation,
      sanation_plan,
      uop,
    } = req.body;

    const sqlDate = date ? new Date(date).toISOString().split("T")[0] : null;
    const sqlTime = visit_time || null;

    const toText = (v) => {
      if (v === undefined || v === null || v === "") return null;
      return String(v);
    };

    const toNumber = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const toBool = (v) => {
      if (v === true || v === "true" || v === 1 || v === "1") return true;
      if (v === false || v === "false" || v === 0 || v === "0") return false;
      return null; // 👈 ключове: НЕ ""
    };
    const toInt = (v) => {
      if (v === "" || v === null || v === undefined) return null;
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : null;
    };
    const toSmallInt = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const n = Number(sanation_plan);
    const cleanSanationPlan = Number.isFinite(n) ? n : null;

    const cleanProcedures = JSON.stringify(
      Array.isArray(procedures) ? procedures.filter(Boolean) : [],
    );
    console.log("VALUES:", [
      doctorId,
      patient_id,
      sqlDate,
      sqlTime,
      toText(patient_name),
      toInt(age),
      toText(medical_card),
      toText(residence),
      toText(population_group),
      toSmallInt(sanation),
      cleanSanationPlan,
      toText(visit_type),
      toText(diagnosis_1),
      toInt(diagnosis_1_tooth),
      toText(diagnosis_2),
      toInt(diagnosis_2_tooth),
    ]);
    const result = await pool.query(
      `
      INSERT INTO form_037 (
        doctor_id,
        patient_id,
        date,
        visit_time,
        patient_name,
        age,
        residence,
         medical_card,
        population_group,
        visit_type,
        diagnosis_1,
        diagnosis_1_tooth,
        diagnosis_2,
        diagnosis_2_tooth,
        procedures,
        anesthesia,
        sanation,
        sanation_plan,
        uop
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
      )
      ON CONFLICT (patient_id, date, visit_time)
      DO UPDATE SET
        patient_name = EXCLUDED.patient_name,
        age = EXCLUDED.age,
        residence = EXCLUDED.residence,
        medical_card = EXCLUDED.medical_card,
        population_group = EXCLUDED.population_group,
        visit_type = EXCLUDED.visit_type,
        diagnosis_1 = EXCLUDED.diagnosis_1,
        diagnosis_2 = EXCLUDED.diagnosis_2,
        diagnosis_1_tooth = EXCLUDED.diagnosis_1_tooth,
diagnosis_2_tooth = EXCLUDED.diagnosis_2_tooth,
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
        toText(residence),
        toText(medical_card),
        toText(population_group),
        toText(visit_type),
        toText(diagnosis_1),
        toInt(diagnosis_1_tooth),
        toText(diagnosis_2),
        toInt(diagnosis_2_tooth),

        cleanProcedures,

        toText(anesthesia),
        toSmallInt(sanation),
        toSmallInt(sanation_plan),
        toNumber(uop),
      ],
    );
    console.log("RETURNING:", result.rows[0]);
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
      result.rows.map((r) => {
        const proc = JSON.parse(r.procedures || "[]");

        return {
          ...r,
          date:
            r.date instanceof Date
              ? r.date.toISOString().split("T")[0]
              : String(r.date),
          col9_1_tooth: r.diagnosis_1_tooth,
          col9_2_tooth: r.diagnosis_2_tooth,
          col10_1: proc[0] || "",
          col10_2: proc[1] || "",
          col10_3: proc[2] || "",
        };
      }),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const doctorId = req.doctor.id;

    console.log("DELETE CHECK:", { id, doctorId });

    const result = await pool.query(
      `DELETE FROM form_037
       WHERE id = $1 AND doctor_id = $2
       RETURNING *`,
      [id, doctorId],
    );

    console.log("DELETED:", result.rows[0]);

    return res.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});
export default router;
