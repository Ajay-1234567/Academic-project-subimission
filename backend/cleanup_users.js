const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function cleanupUsers() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const username1 = '8144283289';
        const username2 = 'G Ajay';

        // Delete users
        const [result] = await connection.query(
            'DELETE FROM users WHERE username IN (?, ?)',
            [username1, username2]
        );

        if (result.affectedRows > 0) {
            console.log(`Deleted ${result.affectedRows} user(s). You can now register '8144283289' again.`);
        } else {
            console.log(`Users not found (already deleted).`);
        }

        await connection.end();
    } catch (err) {
        console.error('Error deleting users:', err);
    }
}

cleanupUsers();
