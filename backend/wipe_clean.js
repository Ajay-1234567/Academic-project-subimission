const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function wipeAndReset() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const tables = [
            'evaluations',
            'projects',
            'announcements',
            'subjects',
            'group_members',
            'student_groups',
            'student_faculty',
            'users'
        ];

        for (const table of tables) {
            console.log(`Truncating ${table}...`);
            await connection.query(`TRUNCATE TABLE ${table}`);
        }

        console.log('Adding back default users: Admin, Mr. Aswin, and Mr. Balram...');

        // Add Admin
        await connection.query(
            'INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)',
            [6, 'admin@gmail.com', 'admin123', 'admin', 'Admin']
        );

        // Add Mr. Aswin
        await connection.query(
            'INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)',
            [4, 'aswinsir@gmail.com', 'aswinsir', 'faculty', 'Mr. Aswin Sir']
        );

        // Add Mr. Balram
        await connection.query(
            'INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)',
            [2, 'balramsir@gmail.com', 'balramsir', 'faculty', 'Mr. Balram Sir']
        );

        // Add Subjects for faculty
        console.log('Adding back subjects...');
        await connection.query(
            'INSERT INTO subjects (name, department, semester, facultyId) VALUES (?, ?, ?, ?)',
            ['AWS', 'Computer Science', '3-1', 4]
        );
        await connection.query(
            'INSERT INTO subjects (name, department, semester, facultyId) VALUES (?, ?, ?, ?)',
            ['Angular', 'Information Technology', '3-2', 2]
        );
        await connection.query(
            'INSERT INTO subjects (name, department, semester, facultyId) VALUES (?, ?, ?, ?)',
            ['Spring-Boot', 'Data Science', '4-1', 2]
        );
        await connection.query(
            'INSERT INTO subjects (name, department, semester, facultyId) VALUES (?, ?, ?, ?)',
            ['Product Development', 'Electronics', '4-1', 2]
        );

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('SUCCESS: Database has been wiped clean and basic faculty structure has been restored.');
        console.log('You can now add students fresh.');

    } catch (err) {
        console.error('Error during wipe and reset:', err);
    } finally {
        if (connection) await connection.end();
    }
}

wipeAndReset();
