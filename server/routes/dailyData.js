import express from "express";
import db from "../db.js";
const router = express.Router();
// отримати всі записи
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM daily_data ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// додати запис
router.post("/", async (req, res) => {
  const { data } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO daily_data(data) VALUES($1) RETURNING *",
      [data],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
