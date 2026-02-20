const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function updateUserPassword() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const username = '231801340005';
        const newPassword = 'password'; // Resetting to 'password' to be sure

        // Update password
        const [result] = await connection.query(
            'UPDATE users SET password = ? WHERE username = ?',
            [newPassword, username]
        );

        if (result.affectedRows > 0) {
            console.log(`Password for user ${username} updated successfully to: ${newPassword}`);
        } else {
            console.log(`User ${username} not found.`);
        }

        await connection.end();
    } catch (err) {
        console.error('Error updating password:', err);
    }
}

updateUserPassword();
