const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    database: 'academic_portal'
};

async function fixUsers() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        // Show all users
        const [users] = await connection.query('SELECT id, name, username, email, role, password FROM users');
        console.log('\n=== Current Users ===');
        users.forEach(u => {
            console.log(`  [${u.id}] ${u.name} | role: ${u.role} | username: ${u.username} | email: ${u.email} | pass: ${u.password}`);
        });

        // Fix: copy email from username if email is null and username looks like an email
        for (const u of users) {
            if (!u.email && u.username) {
                let email = u.username;
                // If username doesn't look like email, create one
                if (!email.includes('@')) {
                    email = `${u.username}@portal.com`;
                }
                await connection.query('UPDATE users SET email = ? WHERE id = ?', [email, u.id]);
                console.log(`  ✅ Fixed user ${u.name}: email set to ${email}`);
            }
        }

        // Show updated users
        const [updated] = await connection.query('SELECT id, name, email, role FROM users');
        console.log('\n=== Updated Users ===');
        updated.forEach(u => {
            console.log(`  [${u.id}] ${u.name} | ${u.email} | ${u.role}`);
        });

        await connection.end();
        console.log('\nDone! You can now log in using email addresses.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

fixUsers();
