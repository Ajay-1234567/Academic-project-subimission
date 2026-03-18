const mysql = require('mysql2/promise');
const dbConfig = { host: 'localhost', user: 'root', password: 'Root1234', database: 'academic_portal' };

async function run() {
    const pool = mysql.createPool(dbConfig);
    try {
        const [subjects] = await pool.query('SELECT name FROM subjects');
        console.log('Current subjects:', subjects);

        // Fix any unassigned subjects to Computer Science (CSE)
        await pool.query('UPDATE subjects SET branch = ? WHERE branch IS NULL OR branch = ""', ['Computer Science (CSE)']);

        // Specific fix for Angular
        await pool.query('UPDATE subjects SET domain = ? WHERE name = ?', ['CSW', 'Angular']);

        console.log('Fixed subjects branches and domains.');
    } catch (e) { console.error(e); } finally { await pool.end(); }
}
run();
