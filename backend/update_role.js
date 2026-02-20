const mysql = require('mysql2/promise');
(async () => {
    const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'Root1234', database: 'academic_portal' });
    await c.query("UPDATE users SET role='faculty' WHERE email='gajyakumar264@gmail.com'");
    const [r] = await c.query("SELECT id, name, email, role FROM users WHERE email='gajyakumar264@gmail.com'");
    console.log('Updated:', JSON.stringify(r[0]));
    await c.end();
})();
