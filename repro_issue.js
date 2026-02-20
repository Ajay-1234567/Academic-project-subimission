
async function run() {
    const email = 'testfaculty_' + Date.now() + '@example.com';
    const password = 'password123';

    console.log('1. Registering new faculty...');
    const regRes = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            role: 'faculty',
            name: 'Test Faculty'
        })
    });

    const regData = await regRes.json();
    console.log('Registration status:', regRes.status);
    console.log('Registration data:', regData);

    if (!regRes.ok) return;

    const userId = regData.id;
    console.log('User ID:', userId);

    console.log('2. Adding subject...');
    const subRes = await fetch('http://localhost:3000/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Subject',
            department: 'Computer Science',
            semester: '1-1',
            facultyId: userId
        })
    });

    const subData = await subRes.json();
    console.log('Add Subject status:', subRes.status);
    console.log('Add Subject data:', subData);
}

run().catch(console.error);
