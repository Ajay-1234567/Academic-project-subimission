const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function resetStudentData() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Clear assignments
        await connection.query('DELETE FROM student_faculty');
        console.log('Cleared student_faculty table.');

        // 2. Clear user assignments metadata
        await connection.query('UPDATE users SET assignedFacultyId = NULL, subject = NULL WHERE role = "student"');
        console.log('Cleared assignedFacultyId and subject from users table.');

        await connection.end();
    } catch (err) {
        console.error('Error resetting student data:', err);
    }
}

resetStudentData();
