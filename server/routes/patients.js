import express from "express";
import authMiddleware from "../middleware/auth.js";
import pool from "../db.js";

const router = express.Router();

// ========================================
// Отримати додаткові послуги пацієнта
// ========================================

router.get("/:patientId/services", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const { patientId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM patient_services
      WHERE doctor_id = $1
        AND patient_id = $2
      ORDER BY id ASC
      `,
      [doctorId, patientId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET PATIENT SERVICES ERROR:", err);

    res.status(500).json({
      message: "DB error",
      error: err.message,
    });
  }
});

// ========================================
// Додати додаткову послугу пацієнту
// ========================================

router.post("/:patientId/services", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const { patientId } = req.params;

    const { service_id, service_name, price, date } = req.body;

    if (!patientId) {
      return res.status(400).json({
        message: "Не вказано patient_id",
      });
    }

    if (!service_name || !String(service_name).trim()) {
      return res.status(400).json({
        message: "Не вказано назву послуги",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO patient_services
        (
          doctor_id,
          patient_id,
          service_id,
          service_name,
          date,
          price
        )
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        doctorId,
        patientId,
        service_id || null,
        String(service_name).trim(),
        date || null,
        Number(price) || 0,
      ],
    );

    res.json({
      ok: true,
      service: result.rows[0],
    });
  } catch (err) {
    console.error("SAVE PATIENT SERVICE ERROR:", err);

    res.status(500).json({
      message: "DB error",
      error: err.message,
    });
  }
});

// ========================================
// Видалити додаткову послугу пацієнта
// ========================================

router.delete("/services/:id", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const id = Number(req.params.id);

    const result = await pool.query(
      `
      DELETE FROM patient_services
      WHERE id = $1
        AND doctor_id = $2
      RETURNING *
      `,
      [id, doctorId],
    );

    res.json({
      ok: true,
      deleted: result.rows[0] || null,
    });
  } catch (err) {
    console.error("DELETE PATIENT SERVICE ERROR:", err);

    res.status(500).json({
      message: "DB error",
      error: err.message,
    });
  }
});
// ========================================
// ЗВІТ ПО ПАЦІЄНТАХ
// ========================================

router.get("/report", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Не вказано місяць або рік",
      });
    }

    // ----------------------------------------
    // 1. Отримуємо записи Form037
    // ----------------------------------------

    const formResult = await pool.query(
      `
      SELECT
        id,
        patient_id,
        date::text AS date_text,
        patient_name,
        procedures
      FROM form_037
      WHERE doctor_id = $1
        AND EXTRACT(MONTH FROM date) = $2
        AND EXTRACT(YEAR FROM date) = $3
      ORDER BY date ASC, visit_time ASC
      `,
      [doctorId, month, year],
    );

    // ----------------------------------------
    // 2. Отримуємо ціни процедур лікаря
    // ----------------------------------------

    const pricesResult = await pool.query(
      `
      SELECT
        procedure_code,
        procedure_name,
        price
      FROM procedure_prices
      WHERE doctor_id = $1
      `,
      [doctorId],
    );

    const pricesMap = {};

    pricesResult.rows.forEach((item) => {
      pricesMap[item.procedure_code] = {
        name: item.procedure_name,
        price: Number(item.price) || 0,
      };
    });

    // ----------------------------------------
    // 3. Отримуємо додаткові послуги
    // ----------------------------------------

    const servicesResult = await pool.query(
      `
      SELECT
        id,
        patient_id,
        service_id,
        service_name,
        date::text AS date_text,
        price
      FROM patient_services
      WHERE doctor_id = $1
      `,
      [doctorId],
    );

    // ----------------------------------------
    // 4. Групуємо дані по даті + пацієнту
    // ----------------------------------------

    const patients = {};

    formResult.rows.forEach((row) => {
      const date = row.date_text;

      const key = `${date}_${row.patient_id}`;

      if (!patients[key]) {
        patients[key] = {
          date,
          patient_id: row.patient_id,
          patient_name: row.patient_name || "",
          procedures: [],
          custom_services: [],
          total: 0,
        };
      }

      let procedureList = row.procedures;

      if (typeof procedureList === "string") {
        try {
          procedureList = JSON.parse(procedureList);
        } catch {
          procedureList = [];
        }
      }

      if (!Array.isArray(procedureList)) {
        procedureList = [];
      }

      // ----------------------------------------
      // 5. Додаємо процедури та їх ціни
      // ----------------------------------------

      procedureList.forEach((code) => {
        const procedure = pricesMap[code];

        if (!procedure) {
          patients[key].procedures.push({
            code,
            name: code,
            price: 0,
          });

          return;
        }

        patients[key].procedures.push({
          code,
          name: procedure.name,
          price: procedure.price,
        });

        patients[key].total += procedure.price;
      });
    });

    // ----------------------------------------
    // 6. Додаємо додаткові послуги
    // ----------------------------------------

    servicesResult.rows.forEach((service) => {
      const date = service.date_text;

      const key = `${date}_${service.patient_id}`;

      console.log("🔎 SERVICE:", {
        id: service.id,
        date: date,
        patient_id: service.patient_id,
        service_name: service.service_name,
        price: service.price,
      });

      console.log("🔑 KEY:", key);
      console.log("👤 PATIENT EXISTS:", !!patients[key]);

      if (!patients[key]) {
        console.log("❌ PATIENT NOT FOUND:", key);
        return;
      }

      patients[key].custom_services.push({
        id: service.id,
        name: service.service_name,
        price: Number(service.price) || 0,
      });

      patients[key].total += Number(service.price) || 0;
    });
    // ----------------------------------------
    // 7. Формуємо результат
    // ----------------------------------------

    res.json(Object.values(patients));
  } catch (err) {
    console.error("REPORT ERROR:", err);

    res.status(500).json({
      message: "DB error",
      error: err.message,
    });
  }
});
// ========================================
// ВИДАЛИТИ ДОДАТКОВУ ПОСЛУГУ ПАЦІЄНТА
// ========================================

router.delete("/services/:id", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const serviceId = Number(req.params.id);

    const result = await pool.query(
      `
      DELETE FROM patient_services
      WHERE id = $1
        AND doctor_id = $2
      RETURNING *
      `,
      [serviceId, doctorId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Додаткову послугу не знайдено",
      });
    }

    res.json({
      ok: true,
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("DELETE PATIENT SERVICE ERROR:", err);

    res.status(500).json({
      message: "DB error",
      error: err.message,
    });
  }
});
export default router;
