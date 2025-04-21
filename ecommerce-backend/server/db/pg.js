const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'admin123',
  host: '127.0.0.1',
  port: 5432,
  database: 'ecommerce'
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ PostgreSQL connection error:', err));

module.exports = pool;