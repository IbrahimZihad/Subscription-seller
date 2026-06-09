"use strict";

require("dotenv").config();

const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const rateLimit = require("express-rate-limit");
const hpp       = require("hpp");

const { sequelize }   = require("./models");
const { initFirebase } = require("./firebase/admin");
const routes          = require("./routes");

const app = express();

// ─────────────────────────────────────────────
// PORT (cPanel will override this automatically)
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// Security Headers
// ─────────────────────────────────────────────
app.use(helmet());
app.disable("x-powered-by");

// ─────────────────────────────────────────────
// CORS CONFIG (PRODUCTION SAFE)
// ─────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests like Postman / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ─────────────────────────────────────────────
// Logging
// ─────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─────────────────────────────────────────────
// Body Parsers
// ─────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─────────────────────────────────────────────
// Prevent Parameter Pollution
// ─────────────────────────────────────────────
app.use(hpp());

// ─────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests — please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many login attempts — try again in 15 minutes."
  },
});

app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use("/api", routes);

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Subscriptions BD API",
    version: "2.0.0",
    firebase: process.env.FIREBASE_PROJECT_ID || "not configured",
    db: process.env.DB_HOST || "not configured",
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Aiven MySQL connected —", process.env.DB_HOST);

    initFirebase();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log(`🗄️ Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log(`🌐 API Base: /api`);
    });

  } catch (error) {
    console.error("❌ Server startup failed:", error.message);

    console.error("\nCommon causes:");
    console.error("  - Aiven DB credentials missing");
    console.error("  - Firebase env variables missing");
    console.error("  - SSL/cert issues for DB");

    process.exit(1);
  }
};

start();