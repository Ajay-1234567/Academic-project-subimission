const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB Config from Env
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root1234',
    database: process.env.DB_NAME || 'academic_portal',
    ssl: process.env.DB_SSL === 'true' ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    } : undefined
};

let pool;
async function initDB() {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool;
}

// Global middleware to initialize DB
app.use(async (req, res, next) => {
    try {
        await initDB();
        next();
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

app.get('/api', (req, res) => res.json({ status: 'API is running', time: new Date() }));

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            const { password, ...user } = rows[0];
            res.json(user);
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/stats', async (req, res) => {
    try {
        const [[{ students }]] = await pool.query("SELECT COUNT(*) as students FROM users WHERE role = 'student'");
        const [[{ faculty }]] = await pool.query("SELECT COUNT(*) as faculty FROM users WHERE role = 'faculty'");
        const [[{ projects }]] = await pool.query("SELECT COUNT(*) as projects FROM projects");
        res.json({ students, faculty, projects });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generic fallbacks for other missing routes
app.get('/api/*', (req, res) => res.status(404).json({ message: 'Route not found' }));

module.exports = app;
