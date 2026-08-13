import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
console.log("🔎 DB CONFIG:", {
  user: new URL(process.env.DATABASE_URL).username,
  host: new URL(process.env.DATABASE_URL).hostname,
  database: new URL(process.env.DATABASE_URL).pathname,
  port: new URL(process.env.DATABASE_URL).port || "5432",
  passwordLength: new URL(process.env.DATABASE_URL).password.length,
});
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err);
});

export default pool;
