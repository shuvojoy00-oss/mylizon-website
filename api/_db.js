const { Pool } = require("pg");

let pool;

function getConnString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    ""
  );
}

function getPool() {
  if (!pool) {
    const connectionString = getConnString();
    if (!connectionString) {
      throw new Error("DATABASE_URL is missing (or no supported Postgres env var found).");
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5
    });
  }
  return pool;
}

module.exports = { getPool };
