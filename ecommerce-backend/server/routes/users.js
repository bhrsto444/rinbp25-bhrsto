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

// Ruta za brisanje određenog korisnika po ID-u
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Provjera je li id validan UUID
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return res.status(400).json({ message: "Neispravan format ID-a" });
        }

        const result = await pool.query(
            'DELETE FROM users WHERE id = $1::uuid RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Korisnik nije pronađen" });
        }

        res.json({ message: "Korisnik je uspješno obrisan", deletedUser: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Greška prilikom brisanja korisnika" });
    }
});

// Ruta za brisanje svih korisnika
router.delete('/', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM users RETURNING *');
        res.json({ 
            message: "Svi korisnici su uspješno obrisani", 
            deletedCount: result.rows.length,
            deletedUsers: result.rows 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Greška prilikom brisanja svih korisnika" });
    }
});

module.exports = router;
