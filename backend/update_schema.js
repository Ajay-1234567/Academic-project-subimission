const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function updateSchema() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Create student_faculty table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS student_faculty (
                studentId INT,
                facultyId INT,
                assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (studentId, facultyId),
                FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (facultyId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Created student_faculty table.');

        // 2. Migrate existing assignments
        const [users] = await connection.query('SELECT id, assignedFacultyId FROM users WHERE role = "student" AND assignedFacultyId IS NOT NULL');

        for (const user of users) {
            try {
                await connection.query('INSERT IGNORE INTO student_faculty (studentId, facultyId) VALUES (?, ?)', [user.id, user.assignedFacultyId]);
                console.log(`Migrated student ${user.id} to faculty ${user.assignedFacultyId}`);
            } catch (e) {
                console.error(`Failed to migrate student ${user.id}:`, e.message);
            }
        }

        console.log('Schema update complete.');
        await connection.end();
    } catch (err) {
        console.error('Error updating schema:', err);
    }
}

updateSchema();
