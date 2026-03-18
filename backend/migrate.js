const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
    try {
        console.log("Reading dump...");
        const dump = fs.readFileSync('dump.sql', 'utf8');
        
        console.log("Connecting to TiDB...");
        const conn = await mysql.createConnection({
            host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: 4000,
            user: '3uCMeBpZcpHkxK1.root',
            password: 'at3nOqjPLQNPdvdl',
            database: 'test',
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            },
            multipleStatements: true
        });
        
        console.log("Executing dump...");
        await conn.query(dump);
        console.log("Done!");
        await conn.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
