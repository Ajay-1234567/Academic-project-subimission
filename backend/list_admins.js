const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function listAdmins() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT * FROM users WHERE email LIKE "%Admin%" OR username LIKE "%Admin%"');
        console.table(rows);
        await connection.end();
    } catch (err) {
        console.log(err);
    }
}

listAdmins();
