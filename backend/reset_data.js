const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function resetData() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Delete Child Tables
        await connection.query('DELETE FROM evaluations');
        await connection.query('DELETE FROM projects');
        await connection.query('DELETE FROM announcements');
        console.log('Cleared child tables.');

        // 2. Delete Users (All of them)
        await connection.query('DELETE FROM users');
        console.log('Cleared all users.');

        // 3. Reset Auto Increment (Optional, but good for fresh start)
        await connection.query('ALTER TABLE users AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE projects AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE evaluations AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE announcements AUTO_INCREMENT = 1');

        // 4. Re-insert Default Users (matching server.js defaults)
        await connection.query(`
            INSERT INTO users (username, password, role, name, email) VALUES 
            ('student1', 'password', 'student', 'Alice Student', 'student1@university.edu'),
            ('faculty1', 'password', 'faculty', 'Dr. Bob Faculty', 'faculty1@university.edu'),
            ('admin', 'password', 'admin', 'Admin User', 'admin@university.edu')
        `);
        console.log('Restored default users.');

        await connection.end();
        console.log('Fresh start complete. Please log out and log back in.');
    } catch (err) {
        console.error('Error resetting data:', err);
    }
}

resetData();
