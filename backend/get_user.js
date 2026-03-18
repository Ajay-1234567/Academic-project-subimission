const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Root1234',
        database: 'academic_portal'
    });
    const [rows] = await c.query("SELECT id, name, email, password, role FROM users WHERE email LIKE '%cutmap%'");
    let out = '';
    rows.forEach(r => {
        out += `User ${r.id}:\n`;
        out += `Email: |${r.email}| length: ${r.email.length}\n`;
        out += `Email hex: ${Buffer.from(r.email).toString('hex')}\n`;
        out += `Password: |${r.password}| length: ${r.password.length}\n`;
        out += `Password hex: ${Buffer.from(r.password).toString('hex')}\n`;
        out += `Name: |${r.name}| length: ${r.name.length}\n`;
        out += `Name hex: ${Buffer.from(r.name).toString('hex')}\n`;
    });
    fs.writeFileSync('out_utf8.txt', out, 'utf8');
    await c.end();
}
main();
