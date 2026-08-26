import express from "express";
import authMiddleware from "../middleware/auth.js";
import pool from "../../server/db.js";

const router = express.Router();

// Отримати ціни поточного лікаря
router.get("/", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;

    const result = await pool.query(
      `
      SELECT *
      FROM procedure_prices
      WHERE doctor_id = $1
      ORDER BY id ASC
      `,
      [doctorId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET PRICES ERROR:", err);
    res.status(500).json({
      message: "DB error",
      error: err.message,
    });
  }
});

// Додати або змінити ціну процедури
router.post("/", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;

    const { procedure_code, procedure_name, price } = req.body;

    const result = await pool.query(
      `
      INSERT INTO procedure_prices
        (doctor_id, procedure_code, procedure_name, price)
      VALUES
        ($1, $2, $3, $4)
      ON CONFLICT (doctor_id, procedure_code)
      DO UPDATE SET
        procedure_name = EXCLUDED.procedure_name,
        price = EXCLUDED.price
      RETURNING *
      `,
      [doctorId, procedure_code, procedure_name, Number(price) || 0],
    );

    res.json({
      ok: true,
      price: result.rows[0],
    });
  } catch (err) {
    console.error("SAVE PRICE ERROR:", err);
    res.status(500).json({
      message: "DB error",
      error: err.message,
    });
  }
});

// Видалити ціну процедури
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const id = Number(req.params.id);

    const result = await pool.query(
      `
      DELETE FROM procedure_prices
      WHERE id = $1 AND doctor_id = $2
      RETURNING *
      `,
      [id, doctorId],
    );

    res.json({
      ok: true,
      deleted: result.rows[0] || null,
    });
  } catch (err) {
    console.error("DELETE PRICE ERROR:", err);
    res.status(500).json({
      message: "DB error",
      error: err.message,
    });
  }
});
// ===============================
// ДОДАТКОВІ ПОСЛУГИ
// ===============================

// Отримати додаткові послуги поточного лікаря
router.get("/custom", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;

    const result = await pool.query(
      `
      SELECT *
      FROM custom_services
      WHERE doctor_id = $1
      ORDER BY id ASC
      `,
      [doctorId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET CUSTOM SERVICES ERROR:", err);

    res.status(500).json({
      message: "DB error",
      error: err.message,
    });
  }
});

// Додати додаткову послугу
router.post("/custom", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;

    const { name, price } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        message: "Назва послуги обов'язкова",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO custom_services
        (doctor_id, name, price)
      VALUES
        ($1, $2, $3)
      RETURNING *
      `,
      [doctorId, String(name).trim(), Number(price) || 0],
    );

    res.json({
      ok: true,
      service: result.rows[0],
    });
  } catch (err) {
    console.error("SAVE CUSTOM SERVICE ERROR:", err);

    res.status(500).json({
      message: "DB error",
      error: err.message,
    });
  }
});

// Видалити додаткову послугу
router.delete("/custom/:id", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const id = Number(req.params.id);

    const result = await pool.query(
      `
      DELETE FROM custom_services
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
    console.error("DELETE CUSTOM SERVICE ERROR:", err);

    res.status(500).json({
      message: "DB error",
      error: err.message,
    });
  }
});
export default router;
