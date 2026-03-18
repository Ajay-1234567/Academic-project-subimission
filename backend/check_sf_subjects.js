const mysql = require('mysql2/promise');
async function check() {
    const pool = await mysql.createPool({ host: 'localhost', user: 'root', password: 'Root1234', database: 'academic_portal' });
    const [rows] = await pool.query(`
        SELECT u.name as student, f.name as faculty, sf.subject as sf_subject, u.subject as global_subject
        FROM student_faculty sf
        JOIN users u ON sf.studentId = u.id
        JOIN users f ON sf.facultyId = f.id
        ORDER BY f.name, u.name
    `);
    console.table(rows);
    await pool.end();
}
check().catch(console.error);
