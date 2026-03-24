const mysql = require('mysql2/promise');

async function checkUser() {
    const dbConfig = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'Root1234',
        database: 'academic_portal'
    };
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['231801340005@cutmap.ac.in']);
        console.log('User found:', rows);
        await connection.end();
    } catch (err) {
        console.error('Error:', err);
    }
}
checkUser();
