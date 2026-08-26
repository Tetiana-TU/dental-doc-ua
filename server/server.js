console.log("🔥 SERVER FILE LOADED");
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
// routes
import doctorsRoutes from "./routes/doctors.js";
import form037Routes from "./routes/form037.js";
import form039Routes from "./routes/form039.js";
import patientsRoutes from "./routes/patients.js";
import pricesRoutes from "./routes/prices.js";
app.use("/api/doctors", doctorsRoutes);
app.use("/api/form037", form037Routes);
app.use("/api/form039", form039Routes);
app.use("/api/patients", patientsRoutes);
app.use("/api/prices", pricesRoutes);
app.use(express.static(path.join(__dirname, "../dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
