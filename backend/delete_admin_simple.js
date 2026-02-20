const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function deleteAdminUser() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const email = 'Admin@gmail.com';

        console.log(`Attempting to delete user: ${email}`);
        const [result] = await connection.query('DELETE FROM users WHERE email = ?', [email]);

        if (result.affectedRows > 0) {
            console.log('User deleted successfully.');
        } else {
            console.log('User not found.');
        }
        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

deleteAdminUser();
