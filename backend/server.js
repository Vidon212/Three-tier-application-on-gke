const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const port = parseInt(process.env.PORT || '8080', 10);

const dbConfig = {
  host: process.env.PGHOST || 'postgres',
  user: process.env.PGUSER || 'appuser',
  password: process.env.PGPASSWORD || 'changeme',
  database: process.env.PGDATABASE || 'appdb',
  port: parseInt(process.env.PGPORT || '5432', 10),
  max: 10,
  idleTimeoutMillis: 30000
};

const pool = new Pool(dbConfig);

async function ensureTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  await pool.query(sql);
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, created_at FROM items ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'name is required' });
    }
    const result = await pool.query(
      'INSERT INTO items (name) VALUES ($1) RETURNING id, name, created_at',
      [name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, async () => {
  try {
    await ensureTable();
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${port}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to ensure DB table on startup:', err);
    process.exit(1);
  }
});


