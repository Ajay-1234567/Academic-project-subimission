const mysql = require('mysql2/promise');

async function update() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Root1234',
        database: 'academic_portal'
    });
    await c.query("UPDATE users SET department='Computer Science' WHERE role='student'");
    console.log('Students updated with department.');
    await c.end();
}
update();
