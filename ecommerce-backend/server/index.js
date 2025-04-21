const express = require('express');
const app = express();
const userRoutes = require('./routes/users');  // Import ruta za korisnike


require('dotenv').config();
require('./db/pg');
require('./db/mongo');

app.use(express.json());

// Koristi rute za korisnike
app.use('/users', userRoutes);

app.listen(3001, () => {
  console.log('🚀 Server running on http://localhost:3001');
});
