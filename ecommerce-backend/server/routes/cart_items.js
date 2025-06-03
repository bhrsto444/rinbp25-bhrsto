const express = require('express');
const router = express.Router();
const pool = require('../db/pg');

// Dodaj proizvod u košaricu
router.post('/', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  try {
    // 1. Pronađi aktivnu košaricu za korisnika
    const cartResult = await pool.query(
      'SELECT id FROM carts WHERE user_id = $1 AND active = true',
      [user_id]
    );
    if (cartResult.rows.length === 0) {
      return res.status(400).json({ message: 'No active cart for this user.' });
    }
    const cart_id = cartResult.rows[0].id;

    // 2. Dodaj proizvod u cart_items
    const result = await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [cart_id, product_id, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Dohvati sve stavke iz košarice za korisnika
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const cartResult = await pool.query(
      'SELECT id FROM carts WHERE user_id = $1 AND active = true',
      [user_id]
    );
    if (cartResult.rows.length === 0) {
      return res.status(404).json({ message: 'No active cart for this user.' });
    }
    const cart_id = cartResult.rows[0].id;

    const itemsResult = await pool.query(
      `SELECT ci.*, p.name, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cart_id]
    );
    res.json(itemsResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//Ažuriranje količine proizvoda u košarici
// PATCH /cart-items/:id
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//Brisanje proizvoda iz košarice
// DELETE /cart-items/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM cart_items WHERE id = $1 RETURNING *',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      res.json({ message: 'Cart item deleted', item: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  //brisanje svih stavki iz košarice iz aktivne košarice korisnika
  // DELETE /cart-items/empty/:user_id
router.delete('/empty/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
      // Pronađi aktivnu košaricu
      const cartResult = await pool.query(
        'SELECT id FROM carts WHERE user_id = $1 AND active = true',
        [user_id]
      );
      if (cartResult.rows.length === 0) {
        return res.status(404).json({ message: 'No active cart for this user.' });
      }
      const cart_id = cartResult.rows[0].id;
  
      // Obriši sve stavke iz te košarice
      await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart_id]);
      res.json({ message: 'Cart emptied.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

module.exports = router;
