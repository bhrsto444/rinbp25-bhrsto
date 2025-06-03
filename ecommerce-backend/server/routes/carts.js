const express = require('express');
const router = express.Router();
const pool = require('../db/pg'); // PostgreSQL konektor

// GET /carts/:user_id - Dohvati košaricu za korisnika
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM carts WHERE user_id = $1 AND active = true',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Active cart not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /carts - Kreiraj novu košaricu
router.post('/', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required' });
  }

  try {
    console.log('Attempting to create cart with user_id:', user_id);
    
    // Prvo provjerimo postoji li korisnik
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1::uuid',
      [user_id]
    );
    
    if (userCheck.rows.length === 0) {
      console.log('User not found with ID:', user_id);
      return res.status(400).json({ message: 'User not found' });
    }
    
    console.log('User found, creating cart...');
    
    // Eksplicitno postavljamo sva polja, uključujući created_at
    const result = await pool.query(
      `INSERT INTO carts (id, user_id, active, created_at)
       VALUES (gen_random_uuid(), $1::uuid, true, now())
       RETURNING *`,
      [user_id]
    );

    console.log('Cart created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating cart:', err);
    console.error('Error code:', err.code);
    console.error('Error detail:', err.detail);
    console.error('Error hint:', err.hint);
    
    // Check for foreign key violation
    if (err.code === '23503') {
      return res.status(400).json({ message: 'Invalid user_id: User does not exist' });
    }
    
    // Check for invalid input syntax for UUID
    if (err.code === '22P02') {
      return res.status(400).json({ message: 'Invalid UUID format for user_id' });
    }
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /carts/:user_id/deactivate - Deaktiviraj (isprazni) košaricu nakon kupnje
router.patch('/:user_id/deactivate', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE carts SET active = false WHERE user_id = $1 AND active = true RETURNING *`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No active cart to deactivate' });
    }

    res.json({ message: 'Cart deactivated', cart: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//CHECKOUT LOGIJA--sa svime tj. kada se napusti košarica ide se u narudžbu
// PATCH /carts/:user_id/checkout
router.patch('/:user_id/checkout', async (req, res) => {
    const { user_id } = req.params;
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // 1. Pronađi aktivnu košaricu
      const cartResult = await client.query(
        'SELECT id FROM carts WHERE user_id = $1 AND active = true',
        [user_id]
      );
      if (cartResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'No active cart to checkout' });
      }
      const cart_id = cartResult.rows[0].id;
  
      // 2. Dohvati sve stavke iz košarice
      const itemsResult = await client.query(
        `SELECT product_id, quantity, p.price
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = $1`,
        [cart_id]
      );
      const items = itemsResult.rows;
      if (items.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Cart is empty' });
      }
  
      // 3. Izračunaj ukupnu cijenu
      const total_price = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
      // 4. Kreiraj narudžbu
      const orderResult = await client.query(
        `INSERT INTO orders (id, user_id, created_at, status, total_price)
         VALUES (gen_random_uuid(), $1, now(), 'pending', $2)
         RETURNING *`,
        [user_id, total_price]
      );
      const order_id = orderResult.rows[0].id;
  
      // 5. Dodaj stavke narudžbe
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (id, order_id, product_id, quantity, price_at_order)
           VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
          [order_id, item.product_id, item.quantity, item.price]
        );
      }
  
      // 6. Deaktiviraj košaricu
      await client.query(
        'UPDATE carts SET active = false WHERE id = $1',
        [cart_id]
      );
  
      // 7. (Opcionalno) Kreiraj novu praznu košaricu
      await client.query(
        'INSERT INTO carts (id, user_id, active) VALUES (gen_random_uuid(), $1, true)',
        [user_id]
      );
  
      await client.query('COMMIT');
      res.json({ message: 'Checkout successful, order created.', order_id });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    } finally {
      client.release();
    }
  });
/*
Što se događa s ključevima?
order_items.order_id → pokazuje na orders.id
order_items.product_id → pokazuje na products.id
orders.user_id → pokazuje na users.id
Sve veze su automatski postavljene kroz INSERT upite.
Što još možeš?
Dodati status narudžbe (pending, paid, shipped…)
Dodati podatke o adresi, načinu plaćanja, itd.
Slati email korisniku o narudžbi
*/

/*Sažetak:
Dodaj proizvode u košaricu.
Pozovi checkout rutu (PATCH /carts/:user_id/checkout).
Provjeri narudžbu i stavke narudžbe u bazi.
total_price se računa kao suma (cijena proizvoda × količina) za sve stavke.*/
module.exports = router;
