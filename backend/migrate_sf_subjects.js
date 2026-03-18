// Script to migrate per-faculty subjects into student_faculty.subject
// based on which subjects each faculty has defined in their subjects table

const mysql = require('mysql2/promise');

async function migrate() {
    const pool = await mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Root1234',
        database: 'academic_portal'
    });

    console.log('Connected. Starting migration...\n');

    // Get all faculty
    const [faculties] = await pool.query(`SELECT id, name FROM users WHERE role = 'faculty'`);

    for (const faculty of faculties) {
        console.log(`\nFaculty: ${faculty.name} (id=${faculty.id})`);

        // Get subjects this faculty teaches
        const [subjects] = await pool.query(
            `SELECT name FROM subjects WHERE facultyId = ?`, [faculty.id]
        );
        const subjectNames = subjects.map(s => s.name);
        console.log(`  Faculty subjects: ${subjectNames.join(', ') || '(none)'}`);

        // Get all students assigned to this faculty
        const [assignments] = await pool.query(
            `SELECT sf.studentId, sf.subject, u.name, u.subject as globalSubject
             FROM student_faculty sf
             JOIN users u ON sf.studentId = u.id
             WHERE sf.facultyId = ?`, [faculty.id]
        );

        for (const a of assignments) {
            // If sf.subject is already set, skip
            if (a.subject) {
                console.log(`  Student ${a.name}: already has sf.subject = "${a.subject}" — skipping`);
                continue;
            }

            // Find overlap between faculty's subjects and student's global subjects
            const studentSubjs = a.globalSubject ? a.globalSubject.split(',').map(s => s.trim()) : [];
            const matched = subjectNames.filter(fs =>
                studentSubjs.some(ss => ss.toLowerCase().includes(fs.toLowerCase()) || fs.toLowerCase().includes(ss.toLowerCase()))
            );

            if (matched.length > 0) {
                const sfSubject = matched.join(', ');
                await pool.query(
                    `UPDATE student_faculty SET subject = ? WHERE studentId = ? AND facultyId = ?`,
                    [sfSubject, a.studentId, faculty.id]
                );
                console.log(`  Student ${a.name}: set sf.subject = "${sfSubject}"`);
            } else if (subjectNames.length > 0) {
                // If no overlap found, assign all faculty's subjects
                const sfSubject = subjectNames.join(', ');
                await pool.query(
                    `UPDATE student_faculty SET subject = ? WHERE studentId = ? AND facultyId = ?`,
                    [sfSubject, a.studentId, faculty.id]
                );
                console.log(`  Student ${a.name}: no match found, assigned all faculty subjects = "${sfSubject}"`);
            } else {
                console.log(`  Student ${a.name}: faculty has no subjects defined — leaving NULL`);
            }
        }
    }

    console.log('\nMigration complete!');
    await pool.end();
}

migrate().catch(console.error);
