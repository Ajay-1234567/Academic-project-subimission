const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function checkState() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [students] = await connection.query('SELECT id, name, email FROM users WHERE role = "student"');
        console.log(JSON.stringify(students, null, 2));

        if (students.length > 0) {
            const sid = students[0].id; // taking first student found
            const [assignments] = await connection.query('SELECT * FROM student_faculty WHERE studentId = ?', [sid]);
            console.log('Assignments:', JSON.stringify(assignments, null, 2));

            if (assignments.length > 0) {
                const fids = assignments.map(a => a.facultyId);
                const [subjects] = await connection.query('SELECT * FROM subjects WHERE facultyId IN (?)', [fids]);
                console.log('Subjects:', JSON.stringify(subjects, null, 2));
            }
        }
        await connection.end();
    } catch (e) { console.error(e); }
}
checkState();
