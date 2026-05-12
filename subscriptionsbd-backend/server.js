"use strict";

require("dotenv").config();

const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const rateLimit = require("express-rate-limit");

const { sequelize }   = require("./models");
const { initFirebase } = require("./firebase/admin");
const routes          = require("./routes");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Rate limiting ─────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  message:  { success: false, message: "Too many requests — please try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, message: "Too many login attempts — try again in 15 minutes." },
});

app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);

// ── API Routes ────────────────────────────────────────────────
app.use("/api", routes);

// ── Health check ──────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status:   "ok",
    service:  "Subscriptions BD API",
    version:  "2.0.0",
    firebase: process.env.FIREBASE_PROJECT_ID || "not configured",
    db:       process.env.DB_HOST || "not configured",
    env:      process.env.NODE_ENV,
    time:     new Date().toISOString(),
  });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ── Start server ──────────────────────────────────────────────
const start = async () => {
  try {
    // Test Aiven MySQL connection
    await sequelize.authenticate();
    console.log("✅ Aiven MySQL connected —", process.env.DB_HOST);

    // Initialize Firebase Admin SDK
    initFirebase();

    app.listen(PORT, () => {
      console.log(`✅ Server running → http://localhost:${PORT}`);
      console.log(`📦 Environment:  ${process.env.NODE_ENV}`);
      console.log(`🔥 Firebase:     ${process.env.FIREBASE_PROJECT_ID}`);
      console.log(`🗄️  Database:     ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log(`🌐 API Base:     http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    console.error("\nCommon causes:");
    console.error("  - Aiven DB_PASSWORD not set in .env");
    console.error("  - certs/ca.pem not found (download from Aiven console)");
    console.error("  - Firebase credentials not set in .env");
    process.exit(1);
  }
};

start();
