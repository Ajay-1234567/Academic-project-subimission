const mysql = require('mysql2/promise');
const fs = require('fs');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function debugState() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [students] = await connection.query('SELECT id, name, email, department, subject, academicYear FROM users WHERE role = "student"');
        const [assignments] = await connection.query('SELECT * FROM student_faculty');
        const [subjects] = await connection.query('SELECT * FROM subjects');

        const output = {
            students,
            assignments,
            subjects
        };

        fs.writeFileSync('debug_output.json', JSON.stringify(output, null, 2));
        console.log('Debug output written to debug_output.json');

        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

debugState();
