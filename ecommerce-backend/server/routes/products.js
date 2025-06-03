const express = require('express');
const router = express.Router();
const pool = require('../db/pg'); // Veza na PostgreSQL

// GET /products - Dohvati sve proizvode
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// dohvati proizvod po id-u
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
//pretraga po nazivu ili brendu
router.get('/search/:term', async (req, res) => {
    const { term } = req.params;
    try {
      const result = await pool.query(
        "SELECT * FROM products WHERE LOWER(name) LIKE LOWER($1) OR LOWER(brand) LIKE LOWER($1)",
        [`%${term}%`]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
module.exports = router;

// filtriranje po tipu koze
router.get('/filter/oily', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM products WHERE oily = true');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  