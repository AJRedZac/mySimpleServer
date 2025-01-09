const express = require('express');
const { Pool } = require('pg'); // Import PostgreSQL client

const app = express();
const PORT = process.env.PORT || 3000;

// Configure the PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Render requires SSL with this configuration
    },
});

// Route to register a visit
app.get('/register-visit', async (req, res) => {
    const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0].trim();
    const userAgent = (req.headers['user-agent'] || '').substring(0, 255);
    const referer = req.headers['referer'] || 'Direct Access';
    const method = req.method;
    const path = req.path;
    const protocol = req.protocol;
    const acceptedLanguages = req.headers['accept-language'];
    const timestamp = new Date().toISOString();

	console.log('Visit registered:', { ip, userAgent, referer, method, path, protocol, acceptedLanguages, timestamp });
	
    try {
        // Insert the visit into the database
        await pool.query(
            `INSERT INTO visits (ip, user_agent, referer, method, path, protocol, accepted_languages, timestamp) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [ip, userAgent, referer, method, path, protocol, acceptedLanguages, timestamp]
        );

        console.log('Visit registered in DB:', { ip, userAgent, referer, method, path, protocol, acceptedLanguages, timestamp });
        res.status(200).send('Visit registered');
    } catch (err) {
        console.error('Error storing visit:', err);
        res.status(500).send('Error storing visit');
    }
});

// Route to fetch all visits (for debugging)
app.get('/visits', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM visits');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching visits:', err);
        res.status(500).send('Error fetching visits');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
