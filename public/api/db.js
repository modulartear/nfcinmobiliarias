import pkg from 'pg';
const { Pool } = pkg;

let pool;
let initialized = false;

function getConnectionString() {
  return process.env.DATABASE_URL || process.env.VERCEL_POSTGRES_URL || process.env.POSTGRES_URL;
}

function getPool() {
  if (pool) return pool;

  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error('No database URL configured. Set DATABASE_URL or VERCEL_POSTGRES_URL.');
  }

  pool = new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 5000,
  });

  return pool;
}

export async function query(text, params) {
  const pool = getPool();
  return pool.query(text, params);
}

export async function ensureSchema() {
  if (initialized) return;

  const pool = getPool();

  // Crear tablas básicas si no existen
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dashboard_user (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent (
      id SERIAL PRIMARY KEY,
      nombre TEXT,
      email TEXT,
      telefono TEXT,
      empresa TEXT,
      presentacion TEXT,
      foto TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      titulo TEXT,
      descripcion TEXT,
      precio TEXT,
      zona TEXT,
      tipo TEXT,
      caracteristicas TEXT,
      imagen TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      nombre TEXT,
      telefono TEXT,
      interes TEXT,
      origen TEXT,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  initialized = true;
}
