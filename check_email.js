const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function checkUser() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['231801340005@cutmap.ac.in']);
        console.log('User found:', rows);
        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

checkUser();
