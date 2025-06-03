const express = require('express');
const router = express.Router();
const pool = require('../db/pg'); // Veza na PostgreSQL

// POST /wishlist - Dodaj proizvod na listu želja
router.post('/', async (req, res) => {
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({ message: 'user_id and product_id are required' });
  }

  try {
    // Opcionalno: Provjeri postoji li korisnik i proizvod prije dodavanja
    // Opcionalno: Provjeri postoji li već ta stavka na listi želja

    const result = await pool.query(
      `INSERT INTO wishlist (user_id, product_id)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, product_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    // Dodaj specifične poruke za strane ključeve ako je potrebno (slično kao u carts.js)
    if (err.code === '23503') { // foreign key violation
        return res.status(400).json({ message: 'Invalid user_id or product_id' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /wishlist/:user_id - Dohvati sve stavke s liste želja za korisnika
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    // Provjeri postoji li korisnik (opcionalno, ali dobro)
    // const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
    // if (userCheck.rows.length === 0) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    const result = await pool.query(
      `SELECT w.id, w.user_id, w.product_id, w.added_at,
              p.label, p.brand, p.name, p.price, p.rank, p.ingredients,
              p.combination, p.dry, p.normal, p.oily, p.sensitive
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /wishlist/:id - Obriši stavku s liste želja po ID-u stavke
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM wishlist WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }
    res.json({ message: 'Wishlist item deleted', item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;