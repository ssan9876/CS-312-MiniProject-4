const { Pool } = require('pg');

const config = {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'BlogDB',
};

const pool = new Pool(config);

module.exports = {
  config,
  query: (text, params) => pool.query(text, params),
};
