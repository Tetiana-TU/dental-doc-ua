import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "dental.db");

const localDb = new Database(dbPath);

localDb.pragma("journal_mode = WAL");

console.log("✅ SQLite database:", dbPath);

export default localDb;
