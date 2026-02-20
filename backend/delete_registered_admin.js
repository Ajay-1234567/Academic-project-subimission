const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function deleteAdmin() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        // Delete Admin@gmail.com
        const email = 'Admin@gmail.com';
        console.log(`Deleting user with email: ${email}`);

        const [result] = await connection.query('DELETE FROM users WHERE email = ?', [email]);

        if (result.affectedRows > 0) {
            console.log('User deleted successfully.');
        } else {
            console.log('User not found (or already deleted).');
        }
        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

deleteAdmin();
