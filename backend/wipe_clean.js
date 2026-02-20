const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function wipeDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Disable foreign key checks to allow truncation in any order
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('Clearing all tables...');
        await connection.query('TRUNCATE TABLE evaluations');
        await connection.query('TRUNCATE TABLE projects');
        await connection.query('TRUNCATE TABLE announcements');
        await connection.query('TRUNCATE TABLE subjects');
        await connection.query('TRUNCATE TABLE users');

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('All data wiped. Database is clean and ready for fresh registration.');
        await connection.end();
    } catch (err) {
        console.error('Error wiping database:', err);
    }
}

wipeDB();
