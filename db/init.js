const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { config } = require('./index');

async function main() {
  const admin = new Client({ ...config, database: 'postgres' });
  await admin.connect();
  const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [config.database]);
  if (rowCount === 0) {
    await admin.query(`CREATE DATABASE "${config.database.replace(/"/g, '""')}"`);
    console.log(`Created database ${config.database}`);
  }
  await admin.end();

  const client = new Client(config);
  await client.connect();
  for (const file of ['schema.sql', 'seed.sql']) {
    await client.query(fs.readFileSync(path.join(__dirname, file), 'utf8'));
    console.log(`Ran ${file}`);
  }
  await client.end();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
