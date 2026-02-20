const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function addUser() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const username = '231801340005';
        const password = 'password'; // Default password
        const role = 'student';
        const name = 'Student 231801340005';

        // Check if user exists
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            console.log(`User ${username} already exists.`);
        } else {
            await connection.query(
                'INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)',
                [username, password, role, name]
            );
            console.log(`User ${username} created successfully with password: ${password}`);
        }

        await connection.end();
    } catch (err) {
        console.error('Error adding user:', err);
    }
}

addUser();
