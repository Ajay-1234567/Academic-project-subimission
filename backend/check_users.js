const mysql = require('mysql2/promise');

async function check() {
    try {
        const c = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Root1234',
            database: 'academic_portal'
        });
        const [rows] = await c.query("SELECT id, name, email, role FROM users");
        console.table(rows);
        await c.end();
    } catch (e) { console.error(e); }
}
check();
