import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import appoinmentRoutes from "./routes/appointmentRoutes.js";
import selfAssessmentRoutes from "./routes/selfAssessmentRoutes.js";
import profileRoutes from "./routes/profileRoutes.js"
import { supabase } from "./config/supabaseClient.js";

["PORT", "SUPABASE_URL", "SUPABASE_KEY"].forEach((k) => {
  if (!process.env[k]) throw new Error(`Missing env: ${k}`);
});

const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3001",
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/articles", articleRoutes);
app.use("/appointment", appoinmentRoutes);
app.use("/self-assessments", selfAssessmentRoutes);
app.use("/profile", profileRoutes);
app.get("/", (req, res) => res.send("API is running"));

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // ✅ health check supabase
  const { data, error } = await supabase.from("konselor").select("id").limit(1);
  console.log("[SUPABASE CHECK]", {
    ok: !error,
    error: error?.message ?? null,
    sample: data?.[0] ?? null,
  });
});
