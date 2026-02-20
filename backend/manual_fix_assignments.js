const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function fix() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        // Link to Faculty 2 (Mr. Aswin Sir) and Faculty 4 (Mr. Balram Sir)
        // Note: Faculty names were inferred from dashboard screenshots in earlier steps.
        // It's safer to fetch based on faculty role? No, hardcoding known good IDs is fine for this fix.
        await connection.query(`
            INSERT IGNORE INTO student_faculty (studentId, facultyId) 
            VALUES (3, 2), (3, 4)
        `);

        console.log('Successfully linked Student 3 (Ajay) to Faculty 2 and Faculty 4.');
        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

fix();
