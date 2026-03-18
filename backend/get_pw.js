const mysql = require('mysql2/promise');
(async () => {
    const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'Root1234', database: 'academic_portal' });
    const [r] = await c.query("SELECT email, password, role FROM users WHERE email='231801340005@cutmap.ac.in'");
    if(r.length > 0) {
        console.log(r[0]);
    } else {
        console.log("USER NOT FOUND");
    }
    await c.end();
})();
