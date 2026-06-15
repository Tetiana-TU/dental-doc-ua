import authMiddleware from "../middleware/auth.js";
import express from "express";
import pool from "../src/utils/server/db.js";
const router = express.Router();
router.get("/", (req, res) => {
  res.json({ message: "Doctors API works" });
});

router.post("/register", async (req, res) => {
  console.log("BODY:", req.body);
  try {
    const { fullName, phone, password } = req.body;
    console.log("VALUES:", fullName, phone, password);

    const result = await pool.query(
      `INSERT INTO doctors (full_name, phone, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [fullName, phone, password],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "DB error" });
  }
});
router.post("/login", async (req, res) => {
  console.log("LOGIN BODY:", req.body);
  try {
    const { phone, password } = req.body;

    const result = await pool.query("SELECT * FROM doctors WHERE phone = $1", [
      phone,
    ]);
    console.log("FOUND:", result.rows);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Користувача не знайдено",
      });
    }

    const doctor = result.rows[0];

    if (doctor.password !== password) {
      return res.status(401).json({
        message: "Невірний пароль",
      });
    }
    const token = jwt.sign(
      {
        id: doctor.id,
        fullName: doctor.full_name,
        phone: doctor.phone,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Успішний вхід",
      token,
      doctor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Помилка сервера",
    });
  }
});
router.get("/me", authMiddleware, async (req, res) => {
  res.json({
    message: "OK",
    doctor: req.doctor,
  });
});
export default router;
