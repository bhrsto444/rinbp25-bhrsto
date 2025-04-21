const express = require('express');
const router = express.Router();
const pool = require('../db/pg');  // Veza na PostgreSQL

// Ruta za dodavanje korisnika
router.post('/add', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [first_name, last_name, email, password]
        );
        res.json(result.rows[0]);  // Vraćamo dodanog korisnika
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding user");
    }
});

module.exports = router;
