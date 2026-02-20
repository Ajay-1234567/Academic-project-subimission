const mysql = require('mysql2/promise');
(async () => {
    const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'Root1234', database: 'academic_portal' });
    const [r] = await c.query("SELECT id, name, email, role FROM users WHERE email LIKE '%cutmap%'");
    if (r.length === 0) {
        console.log('No user with cutmap email found. The registration must have failed truly.');
    } else {
        r.forEach(u => console.log(JSON.stringify(u)));
    }
    await c.end();
})();
