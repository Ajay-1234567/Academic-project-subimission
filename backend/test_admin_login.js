const axios = require('axios');

async function testAdminLogin() {
    try {
        const response = await axios.post('http://localhost:3000/api/login', {
            email: 'admin@gmail.com',
            password: 'admin123'
        });
        console.log('Login Success:', response.data);
    } catch (error) {
        console.error('Login Failed:', error.response?.data || error.message);
    }
}

testAdminLogin();
