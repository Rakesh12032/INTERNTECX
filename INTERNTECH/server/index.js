import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./routes/admin.js";
import ambassadorRoutes from "./routes/ambassador.js";
import analyticsRoutes from "./routes/analytics.js";
import authRoutes from "./routes/auth.js";
import certificateRoutes from "./routes/certificates.js";
import chatbotRoutes from "./routes/chatbot.js";
import collegeRoutes from "./routes/college.js";
import companyRoutes from "./routes/company.js";
import courseRoutes from "./routes/courses.js";
import internshipRoutes from "./routes/internships.js";
import jobRoutes from "./routes/jobs.js";
import quizRoutes from "./routes/quiz.js";
import referralRoutes from "./routes/referral.js";
import walletRoutes from "./routes/wallet.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localUploadsDirectory = path.join(__dirname, "uploads");
const uploadsDirectory = process.env.VERCEL ? "/tmp/uploads" : localUploadsDirectory;

fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDirectory);
  },
  filename: (_req, file, callback) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-").toLowerCase()}`;
    callback(null, safeName);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = new Set([
  CLIENT_URL,
  "https://interntecx.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no Origin header).
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(uploadsDirectory));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    platform: "InternTech",
    message: "Learn. Intern. Succeed."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/ambassador", ambassadorRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/company", companyRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((error, _req, res, _next) => {
  console.error("InternTech server error:", error);
  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error"
  });
});

export default app;
