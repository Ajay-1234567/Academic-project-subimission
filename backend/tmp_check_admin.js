const mysql = require('mysql2/promise');
const dbConfig = { host: 'localhost', user: 'root', password: 'Root1234', database: 'academic_portal' };

async function checkAdmin() {
    try {
        const p = await mysql.createPool(dbConfig);
        const [rows] = await p.query('SELECT id, name, email, role, password FROM users WHERE role = "admin"');
        console.log('Admin Users:', JSON.stringify(rows, null, 2));
        await p.end();
    } catch (e) {
        console.error(e);
    }
}
checkAdmin();
