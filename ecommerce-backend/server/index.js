const express = require('express');
const app = express();

require('dotenv').config();
require('./db/pg');
require('./db/mongo');

app.use(express.json());

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
