const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root1234',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

async function initDB() {
    try {
        // 1. Create DB if not exists (using a temporary connection)
        const tempConnection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS academic_portal`);
        await tempConnection.end();

        // 2. Initialize Pool with the Database
        pool = mysql.createPool({
            ...dbConfig,
            database: 'academic_portal'
        });

        const connection = await pool.getConnection();

        // Create Users Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('student', 'faculty', 'admin') NOT NULL,
                name VARCHAR(255) NOT NULL
            )
        `);

        // Create Projects Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                abstract TEXT,
                repoUrl VARCHAR(255),
                studentId INT,
                facultyId INT,
                status VARCHAR(50) DEFAULT 'Submitted',
                score INT,
                submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (studentId) REFERENCES users(id),
                FOREIGN KEY (facultyId) REFERENCES users(id)
            )
        `);

        // Create Evaluations Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS evaluations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                projectId INT,
                facultyId INT,
                comments TEXT,
                score INT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (projectId) REFERENCES projects(id),
                FOREIGN KEY (facultyId) REFERENCES users(id)
            )
        `);

        // Create Announcements Table (Deadline Notifications)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                deadline DATETIME,
                facultyId INT,
                facultyName VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (facultyId) REFERENCES users(id)
            )
        `);

        // Create Subjects Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS subjects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                department VARCHAR(255),
                semester VARCHAR(20),
                facultyId INT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (facultyId) REFERENCES users(id)
            )
        `);

        // Add department & subject columns to users if not exist
        try { await connection.query(`ALTER TABLE users ADD COLUMN department VARCHAR(255) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users ADD COLUMN subject VARCHAR(255) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users ADD COLUMN assignedFacultyId INT DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT NULL UNIQUE`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users ADD COLUMN academicYear VARCHAR(20) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE projects ADD COLUMN semester VARCHAR(10) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE projects ADD COLUMN subject VARCHAR(255) DEFAULT NULL`); } catch (e) { }

        // Make username nullable for email-based registration
        try { await connection.query(`ALTER TABLE users MODIFY COLUMN username VARCHAR(255) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users DROP INDEX username`); } catch (e) { }

        // Insert Default Users if not exist
        /*
        const [users] = await connection.query('SELECT * FROM users');
        if (users.length === 0) {
            await connection.query(`
                INSERT INTO users (username, password, role, name) VALUES 
                ('student1', 'password', 'student', 'Alice Student'),
                ('faculty1', 'password', 'faculty', 'Dr. Bob Faculty'),
                ('admin', 'password', 'admin', 'Admin User')
            `);
            console.log('Default users inserted.');
        }
        */

        connection.release();
        console.log('Database initialized successfully.');

        // Start Server inside initDB to ensure DB is ready
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('Database initialization failed:', err);
    }
}

initDB();

// Auth Route — login with email
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password]
        );
        if (rows.length > 0) {
            const user = rows[0];
            const { password: _, ...userWithoutPass } = user;
            res.json(userWithoutPass);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register with email
app.post('/api/register', async (req, res) => {
    const { email, password, role, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered. Please log in.' });
        }
        const [result] = await pool.query(
            'INSERT INTO users (email, username, password, role, name) VALUES (?, ?, ?, ?, ?)',
            [email, email, password, role, name]
        );
        res.json({ id: result.insertId, email, role, name, password });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Public Stats Route
app.get('/api/stats', async (req, res) => {
    try {
        const [[{ students }]] = await pool.query(`SELECT COUNT(*) as students FROM users WHERE role = 'student'`);
        const [[{ faculty }]] = await pool.query(`SELECT COUNT(*) as faculty FROM users WHERE role = 'faculty'`);
        const [[{ projects }]] = await pool.query(`SELECT COUNT(*) as projects FROM projects`);
        const [[{ departments }]] = await pool.query(`SELECT COUNT(DISTINCT department) as departments FROM users WHERE department IS NOT NULL AND department != ''`);
        res.json({ students, faculty, projects, departments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Projects Routes
app.get('/api/projects', async (req, res) => {
    const { role, userId } = req.query;
    try {
        let query = `
            SELECT p.*, u.name as studentName, u.email as studentEmail
            FROM projects p 
            LEFT JOIN users u ON p.studentId = u.id
        `;
        let params = [];

        if (role === 'student') {
            query += ' WHERE p.studentId = ?';
            params.push(userId);
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects', async (req, res) => {
    const { title, abstract, repoUrl, studentId, semester, subject } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO projects (title, abstract, repoUrl, studentId, status, semester, subject) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, abstract, repoUrl, studentId, 'Submitted', semester || null, subject || null]
        );

        const newProject = {
            id: result.insertId,
            title, abstract, repoUrl, studentId, status: 'Submitted', score: null, semester: semester || null, subject: subject || null
        };
        res.json(newProject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT p.*, u.name as studentName, u.email as studentEmail
            FROM projects p 
            LEFT JOIN users u ON p.studentId = u.id
            WHERE p.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Fetch evaluations if any
        const [evals] = await pool.query(`
            SELECT e.*, u.name as facultyName 
            FROM evaluations e 
            LEFT JOIN users u ON e.facultyId = u.id
            WHERE e.projectId = ?
            ORDER BY e.createdAt DESC
        `, [id]);

        const project = rows[0];
        project.evaluations = evals;

        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Evaluations Routes
app.post('/api/evaluate', async (req, res) => {
    const { projectId, comments, score, facultyId } = req.body;
    try {
        // Update project status
        await pool.query(
            'UPDATE projects SET status = ?, score = ?, facultyId = ? WHERE id = ?',
            ['Evaluated', score, facultyId, projectId]
        );

        // Add evaluation record
        await pool.query(
            'INSERT INTO evaluations (projectId, facultyId, comments, score) VALUES (?, ?, ?, ?)',
            [projectId, facultyId, comments, score]
        );

        const [updatedProject] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
        res.json(updatedProject[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Routes
app.get('/api/stats', async (req, res) => {
    try {
        const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['student']);
        const [facultyCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['faculty']);
        const [projectCount] = await pool.query('SELECT COUNT(*) as count FROM projects');
        const [recentActivity] = await pool.query(`
            SELECT 'New User' as type, name as detail, id as id FROM users ORDER BY id DESC LIMIT 3
        `);

        res.json({
            students: studentCount[0].count,
            faculty: facultyCount[0].count,
            projects: projectCount[0].count,
            activity: recentActivity
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    const { role } = req.query;
    try {
        let query = 'SELECT id, username, email, name, role, password FROM users';
        let params = [];

        if (role) {
            query += ' WHERE role = ?';
            params.push(role);
        }

        query += ' ORDER BY id DESC';

        const [users] = await pool.query(query, params);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await pool.query('SELECT id, name, email, role, department, subject, assignedFacultyId FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        // If student, fetch assigned faculties
        if (user.role === 'student') {
            const [rows] = await pool.query(`
                SELECT u.id, u.name, u.email 
                FROM users u
                JOIN student_faculty sf ON u.id = sf.facultyId
                WHERE sf.studentId = ?
            `, [id]);
            user.assignedFaculties = rows;
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User Profile (Expanded for Faculty/Admin editing)
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, password, email, department, subject } = req.body;
    try {
        // 1. If email is changing, check for duplicates
        if (email) {
            const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
            if (existing.length > 0) {
                return res.status(409).json({ message: 'Email already used by another user.' });
            }
        }

        // 2. Build Update Query dynamically
        let fields = ['name = ?'];
        let params = [name];

        if (password) {
            fields.push('password = ?');
            params.push(password);
        }
        if (email) {
            fields.push('email = ?');
            fields.push('username = ?'); // Keep username synced with email
            params.push(email);
            params.push(email);
        }
        if (department !== undefined) {
            fields.push('department = ?');
            params.push(department || null);
        }
        if (subject !== undefined) {
            fields.push('subject = ?');
            params.push(subject || null);
        }

        params.push(id);

        await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

        // 3. Return updated user
        const [updatedUser] = await pool.query('SELECT id, name, email, role, department, subject, password FROM users WHERE id = ?', [id]);
        res.json(updatedUser[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Project
app.put('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { title, abstract, repoUrl } = req.body;
    try {
        // Check if already graded
        const [existing] = await pool.query('SELECT score FROM projects WHERE id = ?', [id]);
        if (existing.length > 0 && existing[0].score !== null) {
            return res.status(403).json({ message: 'Cannot edit a graded project.' });
        }

        await pool.query(
            'UPDATE projects SET title = ?, abstract = ?, repoUrl = ? WHERE id = ?',
            [title, abstract, repoUrl, id]
        );
        res.json({ message: 'Project updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Project
app.delete('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Check if already graded
        const [existing] = await pool.query('SELECT score FROM projects WHERE id = ?', [id]);
        if (existing.length > 0 && existing[0].score !== null) {
            return res.status(403).json({ message: 'Cannot delete a graded project.' });
        }

        await pool.query('DELETE FROM projects WHERE id = ?', [id]);
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- ANNOUNCEMENTS / DEADLINES ----

// Get all announcements (students + faculty)
app.get('/api/announcements', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM announcements ORDER BY createdAt DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create announcement (faculty only)
app.post('/api/announcements', async (req, res) => {
    const { title, message, deadline, facultyId, facultyName } = req.body;
    if (!title || !message) {
        return res.status(400).json({ message: 'Title and message are required.' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO announcements (title, message, deadline, facultyId, facultyName) VALUES (?, ?, ?, ?, ?)',
            [title, message, deadline || null, facultyId, facultyName]
        );
        const [newRow] = await pool.query('SELECT * FROM announcements WHERE id = ?', [result.insertId]);
        res.status(201).json(newRow[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete announcement (faculty only)
app.delete('/api/announcements/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
        res.json({ message: 'Announcement deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- SUBJECTS MANAGEMENT ----
app.get('/api/subjects', async (req, res) => {
    const { department, semester, facultyId } = req.query;
    try {
        let query = 'SELECT * FROM subjects WHERE 1=1';
        let params = [];

        if (department) { query += ' AND department = ?'; params.push(department); }
        if (semester) { query += ' AND semester = ?'; params.push(semester); }
        if (facultyId) { query += ' AND facultyId = ?'; params.push(facultyId); }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/subjects', async (req, res) => {
    const { name, department, semester, facultyId } = req.body;
    console.log('POST /api/subjects body:', req.body); // Debug log
    if (!name || !semester) return res.status(400).json({ message: 'Name and Semester required' });
    try {
        const [result] = await pool.query(
            'INSERT INTO subjects (name, department, semester, facultyId) VALUES (?, ?, ?, ?)',
            [name, department, semester, facultyId]
        );
        res.json({ id: result.insertId, name, department, semester, facultyId });
    } catch (err) {
        console.error('Error adding subject:', err); // Debug log
        res.status(500).json({ error: err.message });
    }
});
app.delete('/api/subjects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
        res.json({ message: 'Subject deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---- FACULTY STUDENT MANAGEMENT ----

// Get all students (optionally filtered by this faculty)
app.get('/api/faculty/:facultyId/students', async (req, res) => {
    const { facultyId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email, u.username, u.role, u.department, u.subject, u.academicYear
             FROM users u
             JOIN student_faculty sf ON u.id = sf.studentId
             WHERE u.role = 'student' AND sf.facultyId = ?
             ORDER BY u.name ASC`,
            [facultyId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add (register) a new student and assign to this faculty
app.post('/api/faculty/:facultyId/students', async (req, res) => {
    const { facultyId } = req.params;
    const { name, email, password, department, subject, academicYear } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required.' });
    }
    try {
        let studentId;
        // Check if email already exists
        const [existing] = await pool.query('SELECT id, role, subject FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            const user = existing[0];
            if (user.role !== 'student') {
                return res.status(409).json({ message: 'Email is registered to a non-student account.' });
            }
            studentId = user.id;

            // Check if already assigned to this faculty
            const [assignment] = await pool.query('SELECT * FROM student_faculty WHERE studentId = ? AND facultyId = ?', [studentId, facultyId]);
            if (assignment.length === 0) {
                await pool.query('INSERT INTO student_faculty (studentId, facultyId) VALUES (?, ?)', [studentId, facultyId]);
            }

            // Update student metadata AND append subjects if provided
            let newSubjectStr = user.subject || '';
            if (subject) {
                // Simple append logic: "Math, Physics" + "Chemistry" -> "Math, Physics, Chemistry"
                // Avoid duplicates
                const existingSubjs = newSubjectStr ? newSubjectStr.split(',').map(s => s.trim()) : [];
                const newSubjs = subject.split(',').map(s => s.trim());
                const combined = [...new Set([...existingSubjs, ...newSubjs])];
                newSubjectStr = combined.join(', ');
            }

            await pool.query(
                `UPDATE users 
                 SET name = ?, department = COALESCE(?, department), subject = ?, academicYear = COALESCE(?, academicYear)
                 WHERE id = ?`,
                [name, department || null, newSubjectStr, academicYear || null, studentId]
            );

        } else {
            // Create new student
            if (!password) {
                return res.status(400).json({ message: 'Password is required for new students.' });
            }

            const [result] = await pool.query(
                `INSERT INTO users (name, email, username, password, role, department, subject, academicYear)
                 VALUES (?, ?, ?, ?, 'student', ?, ?, ?)`,
                [name, email, email, password, department || null, subject || null, academicYear || null]
            );
            studentId = result.insertId;

            // Assign to faculty
            await pool.query('INSERT INTO student_faculty (studentId, facultyId) VALUES (?, ?)', [studentId, facultyId]);
        }

        const [finalStudent] = await pool.query(
            'SELECT id, name, email, role, department, subject, academicYear FROM users WHERE id = ?',
            [studentId]
        );
        res.status(201).json(finalStudent[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Remove a student from faculty's list
app.delete('/api/faculty/students/:studentId', async (req, res) => {
    const { studentId } = req.params;
    // We need facultyId from somewhere. Assuming endpoint structure
    // Wait, the original route was slightly ambiguous on facultyId context for delete.
    // Ideally DELETE /api/faculty/:facultyId/students/:studentId
    // But let's assume valid session or we need to pass facultyId in body/query?
    // Let's change the route to include facultyId for correctness in new schema
    res.status(400).json({ message: "Use the specific route DELETE /api/faculty/:facultyId/students/:studentId" });
});

app.delete('/api/faculty/:facultyId/students/:studentId', async (req, res) => {
    const { facultyId, studentId } = req.params;
    try {
        await pool.query('DELETE FROM student_faculty WHERE studentId = ? AND facultyId = ?', [studentId, facultyId]);
        res.json({ message: 'Student removed from your list.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
