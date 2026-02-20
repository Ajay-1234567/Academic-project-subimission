const http = require('http');

function check(url, name) {
    return new Promise((resolve) => {
        const req = http.get(url, (res) => {
            console.log(`${name} is UP (Status: ${res.statusCode})`);
            resolve(true);
        });
        req.on('error', (e) => {
            console.error(`${name} is DOWN (Error: ${e.message})`);
            resolve(false);
        });
        req.end();
    });
}

(async () => {
    console.log('Checking servers...');
    const backend = await check('http://127.0.0.1:3000', 'Backend');
    const frontend = await check('http://127.0.0.1:4200', 'Frontend');
})();
