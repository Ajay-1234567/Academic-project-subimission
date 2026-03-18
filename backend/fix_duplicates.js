const mysql = require('mysql2/promise');

async function fix() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Root1234',
        database: 'academic_portal'
    });
    try {
        // Delete all Angular subjects except the one with the lowest ID
        await pool.query('DELETE FROM subjects WHERE name = "Angular" AND id NOT IN (SELECT id FROM (SELECT MIN(id) as id FROM subjects WHERE name = "Angular") as t)');
        console.log('Duplicates removed');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
fix();
