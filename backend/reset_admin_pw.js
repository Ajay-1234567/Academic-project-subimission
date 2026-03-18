const mysql = require('mysql2/promise');
const dbConfig = { host: 'localhost', user: 'root', password: 'Root1234', database: 'academic_portal' };

async function updatePassword() {
    try {
        const p = await mysql.createPool(dbConfig);
        await p.query('UPDATE users SET password = ? WHERE email = ?', ['Admin@123', 'admin@gmail.com']);
        console.log('Password successfully updated for admin@gmail.com');
        await p.end();
    } catch (e) {
        console.error(e);
    }
}
updatePassword();
