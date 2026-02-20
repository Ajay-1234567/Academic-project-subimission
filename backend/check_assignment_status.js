const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function check() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        // Get the student 'Ajay'
        const [students] = await connection.query('SELECT id, name, email FROM users WHERE role = "student"');
        console.log('Students found:', students.length);

        if (students.length > 0) {
            const sid = students[0].id;
            console.log(`Checking assignments for student ID: ${sid} (${students[0].name})`);

            const [assignments] = await connection.query('SELECT * FROM student_faculty WHERE studentId = ?', [sid]);
            console.log('Number of assignments in student_faculty table:', assignments.length);

            if (assignments.length === 0) {
                console.log('CONCLUSION: The student has NO linked faculties in the new table.');
            } else {
                console.log('CONCLUSION: The student HAS linked faculties.');
                console.table(assignments);
            }
        }
        await connection.end();
    } catch (e) { console.error(e); }
}

check();
