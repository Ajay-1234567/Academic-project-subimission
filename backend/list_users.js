const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function listUsers() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT id, name, username, email, role FROM users');
        console.log(JSON.stringify(rows, null, 2));
        await connection.end();
    } catch (err) {
        console.log(err);
    }
}

listUsers();
