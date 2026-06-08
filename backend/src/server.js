import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import questionRoutes from "./routes/questions.js";
import submissionRoutes from "./routes/submissions.js";
import progressRoutes from "./routes/progress.js";
import dashboardRoutes from "./routes/dashboard.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3100);
const host = process.env.HOST || "127.0.0.1";

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN?.split(",") || true,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: error.message || "服务器错误" });
});

app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});
