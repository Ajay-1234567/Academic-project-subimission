const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function deleteUser() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const username = '231801340005';

        // Delete user
        const [result] = await connection.query(
            'DELETE FROM users WHERE username = ?',
            [username]
        );

        if (result.affectedRows > 0) {
            console.log(`User ${username} deleted successfully. You can now register it again.`);
        } else {
            console.log(`User ${username} was not found (already deleted).`);
        }

        await connection.end();
    } catch (err) {
        console.error('Error deleting user:', err);
    }
}

deleteUser();
