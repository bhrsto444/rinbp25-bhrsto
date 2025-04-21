const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.PG_URI,
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ PostgreSQL connection error:', err));

module.exports = pool;