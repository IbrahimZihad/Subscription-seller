/**
 * Aiven MySQL Connection Test
 * Run: npm run test:connection
 */

require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs            = require("fs");
const path          = require("path");

const caPath = process.env.DB_SSL_CA
  ? path.resolve(process.env.DB_SSL_CA)
  : path.resolve(__dirname, "../certs/ca.pem");

const ssl = fs.existsSync(caPath)
  ? { ca: fs.readFileSync(caPath) }
  : { rejectUnauthorized: false };

if (fs.existsSync(caPath)) console.log("✅ CA cert found:", caPath);
else console.warn("⚠️  CA cert not found — using rejectUnauthorized: false");

const sequelize = new Sequelize(
  process.env.DB_NAME || "defaultdb",
  process.env.DB_USER || "avnadmin",
  process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT) || 21121, dialect: "mysql", logging: false, dialectOptions: { ssl, connectTimeout: 30000 } }
);

(async () => {
  console.log("\n🔌 Testing Aiven MySQL connection...");
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT}`);
  console.log(`   DB:   ${process.env.DB_NAME}`);
  console.log(`   User: ${process.env.DB_USER}\n`);

  try {
    await sequelize.authenticate();
    console.log("✅ Connection successful!\n");

    const [results] = await sequelize.query("SELECT VERSION() as version, NOW() as serverTime;");
    console.log("   MySQL Version:", results[0].version);
    console.log("   Server Time: ", results[0].serverTime);

    const [tables] = await sequelize.query("SHOW TABLES;");
    if (tables.length === 0) {
      console.log("\n📋 No tables yet. Run: npm run db:migrate && npm run db:seed");
    } else {
      console.log(`\n📋 Tables (${tables.length}):`);
      tables.forEach((t) => console.log("  -", Object.values(t)[0]));
    }

    await sequelize.close();
    console.log("\n✅ All good! Your Aiven DB is ready.\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.error("\nCheck: DB_HOST, DB_PORT, DB_PASSWORD in .env and that ca.pem is in ./certs/");
    process.exit(1);
  }
})();
