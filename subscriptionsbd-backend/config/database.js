"use strict";

require("dotenv").config();
const fs   = require("fs");
const path = require("path");

// Load Aiven CA certificate — required for SSL
let sslCA = null;
const caPath = process.env.DB_SSL_CA
  ? path.resolve(process.env.DB_SSL_CA)
  : path.resolve(__dirname, "../certs/ca.pem");

if (fs.existsSync(caPath)) {
  sslCA = fs.readFileSync(caPath);
  console.log("✅ Aiven SSL CA cert loaded");
} else {
  console.warn("⚠️  CA cert not found at:", caPath, "— using rejectUnauthorized: false");
}

const ssl = sslCA
  ? { ca: sslCA }
  : { rejectUnauthorized: false };

const base = {
  username: process.env.DB_USER     || "avnadmin",
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME     || "defaultdb",
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT) || 21121,
  dialect:  "mysql",
  dialectOptions: {
    ssl,
    connectTimeout: 30000,
  },
  define: {
    timestamps: true,
    underscored: false,
    charset:     "utf8mb4",
    collate:     "utf8mb4_unicode_ci",
  },
};

module.exports = {
  development: { ...base, logging: console.log, pool: { max: 10, min: 0, acquire: 60000, idle: 10000 } },
  test:        { ...base, logging: false,        database: (process.env.DB_NAME || "defaultdb") + "_test" },
  production:  { ...base, logging: false,        pool: { max: 20, min: 2, acquire: 60000, idle: 10000 } },
};
