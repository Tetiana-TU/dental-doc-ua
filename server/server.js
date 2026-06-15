console.log("🔥 SERVER FILE LOADED");
import express from "express";
import cors from "cors";
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// routes
import doctorsRoutes from "./routes/doctors.js";
app.use("/api/doctors", doctorsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

import form037Routes from "./routes/form037.js";
import form039Routes from "./routes/form039.js";
app.use("/api/form037", form037Routes);
app.use("/api/form039", form039Routes);
