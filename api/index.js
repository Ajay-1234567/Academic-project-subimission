const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('API is running'));

// Global middleware to await DB connection on serverless environments
app.use(async (req, res, next) => {
    try {
        await initDB();
        next();
    } catch (err) {
        console.error('DB middleware failed:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root1234',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true' ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    } : undefined
};

let pool;
let initPromise = null;

async function initDB() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
        const dbName = process.env.DB_NAME || 'academic_portal';
    try {
        const tempConnection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            ssl: dbConfig.ssl
        });
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await tempConnection.end();

        pool = mysql.createPool({
            ...dbConfig,
            database: dbName
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

        // Create Announcements Table
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
                branch VARCHAR(255) DEFAULT NULL,
                domain VARCHAR(255) DEFAULT NULL,
                semester VARCHAR(20),
                facultyId INT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (facultyId) REFERENCES users(id)
            )
        `);

        // Add columns to subjects if not exist
        try { await connection.query(`ALTER TABLE subjects ADD COLUMN branch VARCHAR(255) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE subjects ADD COLUMN domain VARCHAR(255) DEFAULT NULL`); } catch (e) { }

        // Create Student-Faculty mapping table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS student_faculty (
                studentId INT NOT NULL,
                facultyId INT NOT NULL,
                subject VARCHAR(500) DEFAULT NULL,
                PRIMARY KEY (studentId, facultyId),
                FOREIGN KEY (studentId) REFERENCES users(id),
                FOREIGN KEY (facultyId) REFERENCES users(id)
            )
        `);
        // Add subject column to existing student_faculty tables
        try { await connection.query(`ALTER TABLE student_faculty ADD COLUMN subject VARCHAR(500) DEFAULT NULL`); } catch (e) { }

        // Create Student Groups Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS student_groups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                groupNumber VARCHAR(50) NOT NULL,
                groupName VARCHAR(255),
                facultyId INT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (facultyId) REFERENCES users(id)
            )
        `);

        // Create Group Members Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS group_members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                groupId INT NOT NULL,
                studentId INT NOT NULL,
                UNIQUE KEY unique_student_group (studentId, groupId),
                FOREIGN KEY (groupId) REFERENCES student_groups(id) ON DELETE CASCADE,
                FOREIGN KEY (studentId) REFERENCES users(id)
            )
        `);

        // Add columns to users if not exist
        try { await connection.query(`ALTER TABLE users ADD COLUMN department VARCHAR(255) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users ADD COLUMN subject VARCHAR(255) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users ADD COLUMN assignedFacultyId INT DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT NULL UNIQUE`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users ADD COLUMN academicYear VARCHAR(20) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users ADD COLUMN rollNumber VARCHAR(50) DEFAULT NULL`); } catch (e) { }

        // Add columns to projects if not exist
        try { await connection.query(`ALTER TABLE projects ADD COLUMN semester VARCHAR(10) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE projects ADD COLUMN subject VARCHAR(255) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE projects ADD COLUMN projectType ENUM('solo', 'group') DEFAULT 'solo'`); } catch (e) { }
        try { await connection.query(`ALTER TABLE projects ADD COLUMN groupId INT DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE projects ADD COLUMN submitterName VARCHAR(255) DEFAULT NULL`); } catch (e) { }

        // Create Sections Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                graduationYear VARCHAR(20) NOT NULL,
                department VARCHAR(255) DEFAULT 'B.Tech',
                branches TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add branch, section and domain to users
        try { await connection.query(`ALTER TABLE users ADD COLUMN branch VARCHAR(255) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users ADD COLUMN section VARCHAR(255) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users ADD COLUMN domain VARCHAR(255) DEFAULT NULL`); } catch (e) { }

        // Create Problem Statements Table (Real-world projects)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS problem_statements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                branch VARCHAR(255),
                domain VARCHAR(255),
                difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
                createdBy INT,
                assignedToFacultyId INT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (createdBy) REFERENCES users(id),
                FOREIGN KEY (assignedToFacultyId) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        // Add domain to sections
        try { await connection.query(`ALTER TABLE sections ADD COLUMN domain VARCHAR(255) DEFAULT NULL`); } catch (e) { }

        // Make username nullable for email-based registration
        try { await connection.query(`ALTER TABLE users MODIFY COLUMN username VARCHAR(255) DEFAULT NULL`); } catch (e) { }
        try { await connection.query(`ALTER TABLE users DROP INDEX username`); } catch (e) { }

        connection.release();
        console.log('Database initialized successfully.');

        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
            });
        }

    } catch (err) {
        console.error('Database initialization failed:', err);
    }
    })();
    return initPromise;
}

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    initDB();
}

module.exports = app;

// Auth Route
app.post('/login', async (req, res) => {
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
app.post('/register', async (req, res) => {
    const { email, password, role, name, department, branch, academicYear, domain, section } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered. Please log in.' });
        }
        const [result] = await pool.query(
            'INSERT INTO users (email, username, password, role, name, department, branch, domain, academicYear, section) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [email, email, password, role, name, department || null, branch || null, domain || null, academicYear || null, section || null]
        );
        res.json({ id: result.insertId, email, role, name, password, department, branch, domain, academicYear, section });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Public Stats Route
app.get('/stats', async (req, res) => {
    try {
        const [[{ students }]] = await pool.query(`SELECT COUNT(*) as students FROM users WHERE role = 'student'`);
        const [[{ faculty }]] = await pool.query(`SELECT COUNT(*) as faculty FROM users WHERE role = 'faculty'`);
        const [[{ projects }]] = await pool.query(`SELECT COUNT(*) as projects FROM projects`);
        const [[{ departments }]] = await pool.query(`SELECT COUNT(DISTINCT department) as departments FROM users WHERE department IS NOT NULL AND department != ''`);
        const [recentActivity] = await pool.query(`SELECT 'New User' as type, name as detail, id as id FROM users ORDER BY id DESC LIMIT 3`);
        res.json({ students, faculty, projects, departments, activity: recentActivity });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Projects Routes
app.get('/projects', async (req, res) => {
    const { role, userId } = req.query;
    try {
        console.log('Incoming /projects request:', { role, userId });

        let query = `
            SELECT p.*, u.name as studentName, u.email as studentEmail, u.rollNumber as studentRollNumber,
                   sg.groupNumber, sg.groupName
            FROM projects p 
            LEFT JOIN users u ON p.studentId = u.id
            LEFT JOIN student_groups sg ON p.groupId = sg.id
        `;
        let params = [];

        if (role === 'student') {
            query += ' WHERE p.studentId = ?';
            params.push(userId);
        } else if (role === 'faculty') {
            // Filter projects to only those belonging to subjects the faculty teaches
            query += ` WHERE p.subject IN (SELECT name FROM subjects WHERE facultyId = ?)`;
            params.push(userId);
        } else if (role !== 'admin') {
            // If not admin and not student/faculty, don't return anything (security)
            console.warn('Unknown role for projects request:', role);
            return res.json([]);
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get projects for a group
app.get('/projects/group/:groupId', async (req, res) => {
    const { groupId } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT p.*, u.name as studentName, u.email as studentEmail, u.rollNumber as studentRollNumber,
                   sg.groupNumber, sg.groupName
            FROM projects p
            LEFT JOIN users u ON p.studentId = u.id
            LEFT JOIN student_groups sg ON p.groupId = sg.id
            WHERE p.groupId = ?
        `, [groupId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/projects', async (req, res) => {
    const { title, abstract, repoUrl, studentId, semester, subject, projectType, groupId, submitterName } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO projects (title, abstract, repoUrl, studentId, status, semester, subject, projectType, groupId, submitterName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, abstract, repoUrl, studentId, 'Submitted', semester || null, subject || null, projectType || 'solo', groupId || null, submitterName || null]
        );

        const newProject = {
            id: result.insertId,
            title, abstract, repoUrl, studentId, status: 'Submitted', score: null,
            semester: semester || null, subject: subject || null,
            projectType: projectType || 'solo', groupId: groupId || null, submitterName: submitterName || null
        };
        res.json(newProject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT p.*, u.name as studentName, u.email as studentEmail, u.rollNumber as studentRollNumber,
                   sg.groupNumber, sg.groupName
            FROM projects p 
            LEFT JOIN users u ON p.studentId = u.id
            LEFT JOIN student_groups sg ON p.groupId = sg.id
            WHERE p.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const [evals] = await pool.query(`
            SELECT e.*, u.name as facultyName 
            FROM evaluations e 
            LEFT JOIN users u ON e.facultyId = u.id
            WHERE e.projectId = ?
            ORDER BY e.createdAt DESC
        `, [id]);

        const project = rows[0];
        project.evaluations = evals;

        // If group project, get all group members
        if (project.groupId) {
            const [members] = await pool.query(`
                SELECT u.id, u.name, u.email, u.rollNumber
                FROM group_members gm
                JOIN users u ON gm.studentId = u.id
                WHERE gm.groupId = ?
            `, [project.groupId]);
            project.groupMembers = members;
        }

        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Evaluations Routes
app.post('/evaluate', async (req, res) => {
    const { projectId, comments, score, facultyId } = req.body;
    try {
        await pool.query(
            'UPDATE projects SET status = ?, score = ?, facultyId = ? WHERE id = ?',
            ['Evaluated', score, facultyId, projectId]
        );

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

// Users Routes
app.get('/users', async (req, res) => {
    const { role } = req.query;
    try {
        let query = '';
        let params = [];

        if (role === 'student') {
            query = `
                SELECT u.id, u.username, u.email, u.name, u.role, u.password, u.department, 
                       u.subject, u.academicYear, u.rollNumber, u.branch, u.section, u.domain,
                       GROUP_CONCAT(f.name SEPARATOR ', ') as addedByFaculty
                FROM users u
                LEFT JOIN student_faculty sf ON u.id = sf.studentId
                LEFT JOIN users f ON sf.facultyId = f.id
                WHERE u.role = 'student'
                GROUP BY u.id
                ORDER BY u.id DESC
            `;
        } else {
            query = 'SELECT id, username, email, name, role, password, department, subject, academicYear, rollNumber, branch, section, domain FROM users';
            if (role) {
                query += ' WHERE role = ?';
                params.push(role);
            }
            query += ' ORDER BY id DESC';
        }

        const [users] = await pool.query(query, params);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [user] = await pool.query('SELECT role FROM users WHERE id = ?', [id]);
        if (user.length === 0) return res.status(404).json({ message: 'User not found' });

        const role = user[0].role;
        if (role === 'student') {
            await pool.query('DELETE FROM group_members WHERE studentId = ?', [id]);
            await pool.query('DELETE FROM student_faculty WHERE studentId = ?', [id]);
            await pool.query('DELETE FROM evaluations WHERE projectId IN (SELECT id FROM projects WHERE studentId = ?)', [id]);
            await pool.query('DELETE FROM projects WHERE studentId = ?', [id]);
        } else if (role === 'faculty') {
            await pool.query('DELETE FROM student_faculty WHERE facultyId = ?', [id]);
            await pool.query('DELETE FROM evaluations WHERE facultyId = ?', [id]);
            await pool.query('DELETE FROM group_members WHERE groupId IN (SELECT id FROM student_groups WHERE facultyId = ?)', [id]);
            await pool.query('DELETE FROM student_groups WHERE facultyId = ?', [id]);
            await pool.query('DELETE FROM subjects WHERE facultyId = ?', [id]);
            await pool.query('DELETE FROM problem_statements WHERE createdBy = ?', [id]);
            await pool.query('UPDATE problem_statements SET assignedToFacultyId = NULL WHERE assignedToFacultyId = ?', [id]);
            await pool.query('DELETE FROM announcements WHERE facultyId = ?', [id]);
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete User Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await pool.query('SELECT id, name, email, role, department, subject, assignedFacultyId, academicYear, rollNumber, branch, section, domain FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        if (user.role === 'student') {
            const [rows] = await pool.query(`
                SELECT u.id, u.name, u.email, sf.subject
                FROM users u
                JOIN student_faculty sf ON u.id = sf.facultyId
                WHERE sf.studentId = ?
            `, [id]);
            user.assignedFaculties = rows;

            // Get group info
            const [groupInfo] = await pool.query(`
                SELECT sg.id, sg.groupNumber, sg.groupName
                FROM group_members gm
                JOIN student_groups sg ON gm.groupId = sg.id
                WHERE gm.studentId = ?
            `, [id]);
            user.groups = groupInfo;
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, password, email, department, subject, rollNumber, branch, section, domain } = req.body;
    try {
        if (email) {
            const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
            if (existing.length > 0) {
                return res.status(409).json({ message: 'Email already used by another user.' });
            }
        }

        let fields = ['name = ?'];
        let params = [name];

        if (password) {
            fields.push('password = ?');
            params.push(password);
        }
        if (email) {
            fields.push('email = ?');
            fields.push('username = ?');
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
        if (rollNumber !== undefined) {
            fields.push('rollNumber = ?');
            params.push(rollNumber || null);
        }
        if (branch !== undefined) {
            fields.push('branch = ?');
            params.push(branch || null);
        }
        if (domain !== undefined) {
            fields.push('domain = ?');
            params.push(domain || null);
        }
        if (section !== undefined) {
            fields.push('section = ?');
            params.push(section || null);
        }

        params.push(id);

        await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

        const [updatedUser] = await pool.query('SELECT id, name, email, role, department, subject, password, rollNumber, branch, section, domain FROM users WHERE id = ?', [id]);
        res.json(updatedUser[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Project
app.put('/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { title, abstract, repoUrl } = req.body;
    try {
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
app.delete('/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
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
app.get('/announcements', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM announcements ORDER BY createdAt DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/announcements', async (req, res) => {
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

app.delete('/announcements/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
        res.json({ message: 'Announcement deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- SUBJECTS MANAGEMENT ----
app.get('/subjects', async (req, res) => {
    const { department, semester, facultyId, branch, domain } = req.query;
    try {
        let query = `
            SELECT s.*, u.name as facultyName 
            FROM subjects s 
            LEFT JOIN users u ON s.facultyId = u.id 
            WHERE 1=1
        `;
        let params = [];

        if (department) { query += ' AND s.department = ?'; params.push(department); }
        if (semester) { query += ' AND s.semester = ?'; params.push(semester); }
        if (facultyId) { query += ' AND s.facultyId = ?'; params.push(facultyId); }
        if (branch) { query += ' AND s.branch = ?'; params.push(branch); }
        if (domain) { query += ' AND s.domain = ?'; params.push(domain); }
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/subjects', async (req, res) => {
    const { name, department, semester, facultyId, branch, domain } = req.body;
    if (!name || !semester) return res.status(400).json({ message: 'Name and Semester required' });
    try {
        const [result] = await pool.query(
            'INSERT INTO subjects (name, department, semester, facultyId, branch, domain) VALUES (?, ?, ?, ?, ?, ?)',
            [name, department, semester, facultyId, branch || null, domain || null]
        );
        res.json({ id: result.insertId, name, department, semester, facultyId, branch, domain });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/subjects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
        res.json({ message: 'Subject deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---- FACULTY STUDENT MANAGEMENT ----

// Get all students assigned to faculty ΓÇö including submission status
app.get('/faculty/:facultyId/students', async (req, res) => {
    const { facultyId } = req.params;
    try {
        // Get students assigned to this faculty
        const [students] = await pool.query(`
            SELECT u.id, u.name, u.email, u.username, u.role, u.department,
                   sf.subject AS subject_mapping,
                   u.academicYear, u.rollNumber
            FROM users u
            JOIN student_faculty sf ON u.id = sf.studentId
            WHERE u.role = 'student' AND sf.facultyId = ?
            ORDER BY u.name ASC
        `, [facultyId]);

        // Process each student to get counts and groups safely
        for (let s of students) {
            const [counts] = await pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM projects p WHERE p.studentId = ? AND p.subject IN (SELECT name FROM subjects WHERE facultyId = ?)) as total,
                    (SELECT COUNT(*) FROM projects p WHERE p.studentId = ? AND p.score IS NOT NULL AND p.subject IN (SELECT name FROM subjects WHERE facultyId = ?)) as graded
            `, [s.id, facultyId, s.id, facultyId]);

            s.totalSubmissions = counts[0]?.total || 0;
            s.gradedSubmissions = counts[0]?.graded || 0;
            s.subject = s.subject_mapping;

            const [groups] = await pool.query(`
                SELECT sg.id, sg.groupNumber, sg.groupName
                FROM group_members gm
                JOIN student_groups sg ON gm.groupId = sg.id
                WHERE gm.studentId = ? AND sg.facultyId = ?
            `, [s.id, facultyId]);
            s.groups = groups;
            s.hasSubmitted = s.totalSubmissions > 0;
        }

        res.json(students);
    } catch (err) {
        console.error('Error fetching faculty students:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add a new student and assign to faculty
app.post('/faculty/:facultyId/students', async (req, res) => {
    const { facultyId } = req.params;
    const { name, email, password, department, subject, academicYear, rollNumber, branch, section, domain } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required.' });
    }
    try {
        let studentId;
        const [existing] = await pool.query('SELECT id, role, subject FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            const user = existing[0];
            if (user.role !== 'student') {
                return res.status(409).json({ message: 'Email is registered to a non-student account.' });
            }
            studentId = user.id;

            const [assignment] = await pool.query('SELECT * FROM student_faculty WHERE studentId = ? AND facultyId = ?', [studentId, facultyId]);
            if (assignment.length === 0) {
                await pool.query('INSERT INTO student_faculty (studentId, facultyId, subject) VALUES (?, ?, ?)', [studentId, facultyId, subject || null]);
            } else {
                // Update the per-faculty subject for this student
                if (subject) {
                    await pool.query('UPDATE student_faculty SET subject = ? WHERE studentId = ? AND facultyId = ?', [subject, studentId, facultyId]);
                }
            }

            let newSubjectStr = user.subject || '';
            if (subject) {
                const existingSubjs = newSubjectStr ? newSubjectStr.split(',').map(s => s.trim()) : [];
                const newSubjs = subject.split(',').map(s => s.trim());
                const combined = [...new Set([...existingSubjs, ...newSubjs])];
                newSubjectStr = combined.join(', ');
            }

            await pool.query(
                `UPDATE users 
                 SET name = ?, department = COALESCE(?, department), subject = ?, academicYear = COALESCE(?, academicYear),
                     rollNumber = COALESCE(?, rollNumber), branch = COALESCE(?, branch), domain = COALESCE(?, domain), section = COALESCE(?, section)
                 WHERE id = ?`,
                [name, department || null, newSubjectStr, academicYear || null, rollNumber || null, branch || null, domain || null, section || null, studentId]
            );

        } else {
            if (!password) {
                return res.status(400).json({ message: 'Password is required for new students.' });
            }

            const [result] = await pool.query(
                `INSERT INTO users (name, email, username, password, role, department, subject, academicYear, rollNumber, branch, domain, section)
                 VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, email, password, department || null, subject || null, academicYear || null, rollNumber || null, branch || null, domain || null, section || null]
            );
            studentId = result.insertId;

            await pool.query('INSERT INTO student_faculty (studentId, facultyId, subject) VALUES (?, ?, ?)', [studentId, facultyId, subject || null]);
        }

        const [finalStudent] = await pool.query(
            'SELECT id, name, email, role, department, subject, academicYear, rollNumber, branch, domain, section FROM users WHERE id = ?',
            [studentId]
        );
        res.status(201).json(finalStudent[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/faculty/:facultyId/students/:studentId', async (req, res) => {
    const { facultyId, studentId } = req.params;
    try {
        await pool.query('DELETE FROM student_faculty WHERE studentId = ? AND facultyId = ?', [studentId, facultyId]);
        res.json({ message: 'Student removed from your list.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- GROUP MANAGEMENT ----

// Get groups for a faculty
app.get('/faculty/:facultyId/groups', async (req, res) => {
    const { facultyId } = req.params;
    try {
        const [groups] = await pool.query(
            `SELECT sg.*, 
                    COUNT(gm.id) as memberCount
             FROM student_groups sg
             LEFT JOIN group_members gm ON sg.id = gm.groupId
             WHERE sg.facultyId = ?
             GROUP BY sg.id
             ORDER BY sg.groupNumber ASC`,
            [facultyId]
        );

        // Get members for each group
        for (let group of groups) {
            const [members] = await pool.query(`
                SELECT u.id, u.name, u.email, u.rollNumber, u.department, u.academicYear,
                       (SELECT COUNT(*) FROM projects p WHERE p.studentId = u.id) as submissions
                FROM group_members gm
                JOIN users u ON gm.studentId = u.id
                WHERE gm.groupId = ?
            `, [group.id]);
            group.members = members;

            // Check if group has submitted a project
            const [groupProjects] = await pool.query(
                'SELECT id, title, status, score FROM projects WHERE groupId = ? ORDER BY submittedAt DESC',
                [group.id]
            );
            group.projects = groupProjects;
            group.hasSubmitted = groupProjects.length > 0;
        }

        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new group
app.post('/faculty/:facultyId/groups', async (req, res) => {
    const { facultyId } = req.params;
    const { groupNumber, groupName, memberIds } = req.body;

    if (!groupNumber) {
        return res.status(400).json({ message: 'Group number is required.' });
    }

    try {
        // Check if group number already exists for this faculty
        const [existing] = await pool.query(
            'SELECT id FROM student_groups WHERE groupNumber = ? AND facultyId = ?',
            [groupNumber, facultyId]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: `Group ${groupNumber} already exists.` });
        }

        const [result] = await pool.query(
            'INSERT INTO student_groups (groupNumber, groupName, facultyId) VALUES (?, ?, ?)',
            [groupNumber, groupName || null, facultyId]
        );

        const groupId = result.insertId;

        // Add members
        if (memberIds && memberIds.length > 0) {
            for (const studentId of memberIds) {
                // Remove student from other groups in this faculty first (student can only be in one group per faculty)
                const [existingGroups] = await pool.query(`
                    SELECT gm.groupId FROM group_members gm
                    JOIN student_groups sg ON gm.groupId = sg.id
                    WHERE gm.studentId = ? AND sg.facultyId = ?
                `, [studentId, facultyId]);

                for (const eg of existingGroups) {
                    await pool.query('DELETE FROM group_members WHERE studentId = ? AND groupId = ?', [studentId, eg.groupId]);
                }

                await pool.query('INSERT IGNORE INTO group_members (groupId, studentId) VALUES (?, ?)', [groupId, studentId]);
            }
        }

        const [newGroup] = await pool.query('SELECT * FROM student_groups WHERE id = ?', [groupId]);
        const [members] = await pool.query(`
            SELECT u.id, u.name, u.email, u.rollNumber
            FROM group_members gm
            JOIN users u ON gm.studentId = u.id
            WHERE gm.groupId = ?
        `, [groupId]);

        res.status(201).json({ ...newGroup[0], members, projects: [], hasSubmitted: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update group (add/remove members)
app.put('/faculty/:facultyId/groups/:groupId', async (req, res) => {
    const { facultyId, groupId } = req.params;
    const { groupName, memberIds } = req.body;

    try {
        if (groupName !== undefined) {
            await pool.query('UPDATE student_groups SET groupName = ? WHERE id = ? AND facultyId = ?', [groupName, groupId, facultyId]);
        }

        if (memberIds !== undefined) {
            // Clear existing members
            await pool.query('DELETE FROM group_members WHERE groupId = ?', [groupId]);

            // Add new members
            for (const studentId of memberIds) {
                // Remove student from other groups in this faculty
                const [existingGroups] = await pool.query(`
                    SELECT gm.groupId FROM group_members gm
                    JOIN student_groups sg ON gm.groupId = sg.id
                    WHERE gm.studentId = ? AND sg.facultyId = ? AND gm.groupId != ?
                `, [studentId, facultyId, groupId]);

                for (const eg of existingGroups) {
                    await pool.query('DELETE FROM group_members WHERE studentId = ? AND groupId = ?', [studentId, eg.groupId]);
                }

                await pool.query('INSERT IGNORE INTO group_members (groupId, studentId) VALUES (?, ?)', [groupId, studentId]);
            }
        }

        const [members] = await pool.query(`
            SELECT u.id, u.name, u.email, u.rollNumber
            FROM group_members gm
            JOIN users u ON gm.studentId = u.id
            WHERE gm.groupId = ?
        `, [groupId]);

        res.json({ message: 'Group updated', members });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a group
app.delete('/faculty/:facultyId/groups/:groupId', async (req, res) => {
    const { facultyId, groupId } = req.params;
    try {
        await pool.query('DELETE FROM student_groups WHERE id = ? AND facultyId = ?', [groupId, facultyId]);
        res.json({ message: 'Group deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- ADMIN: Faculty + their students ----
app.get('/admin/faculty-students', async (req, res) => {
    try {
        // Get all faculty
        const [faculties] = await pool.query(
            `SELECT id, name, email FROM users WHERE role = 'faculty' ORDER BY name ASC`
        );

        for (let faculty of faculties) {
            // Get students assigned to this faculty
            // Get students from student_faculty table
            const [students] = await pool.query(`
                SELECT u.id, u.name, u.email, u.department,
                       sf.subject AS subject_mapping,
                       u.academicYear, u.rollNumber
                FROM users u
                JOIN student_faculty sf ON u.id = sf.studentId
                WHERE u.role = 'student' AND sf.facultyId = ?
                ORDER BY u.name ASC
            `, [faculty.id]);

            // For each student, get counts and group info separately (safer)
            for (let s of students) {
                // Get counts restricted to the faculty's subjects
                const [countRows] = await pool.query(`
                    SELECT 
                        (SELECT COUNT(*) FROM projects p WHERE p.studentId = ? AND p.subject IN (SELECT name FROM subjects WHERE facultyId = ?)) as total,
                        (SELECT COUNT(*) FROM projects p WHERE p.studentId = ? AND p.score IS NOT NULL AND p.subject IN (SELECT name FROM subjects WHERE facultyId = ?)) as graded
                `, [s.id, faculty.id, s.id, faculty.id]);

                s.totalSubmissions = countRows[0]?.total || 0;
                s.gradedCount = countRows[0]?.graded || 0;
                s.subject = s.subject_mapping; // Use the mapping table's subject

                const [groups] = await pool.query(`
                    SELECT sg.id, sg.groupNumber, sg.groupName
                    FROM group_members gm
                    JOIN student_groups sg ON gm.groupId = sg.id
                    WHERE gm.studentId = ? AND sg.facultyId = ?
                `, [s.id, faculty.id]);
                s.groups = groups;
                s.hasSubmitted = s.totalSubmissions > 0;
            }

            faculty.students = students;
            faculty.totalStudents = students.length;
            faculty.submittedCount = students.filter(s => s.totalSubmissions > 0).length;
            faculty.notSubmittedCount = students.filter(s => s.totalSubmissions === 0).length;
        }

        res.json(faculties);
    } catch (err) {
        console.error('CRITICAL ERROR in Admin Faculty Overview:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get student's group info
app.get('/students/:studentId/group', async (req, res) => {
    const { studentId } = req.params;
    try {
        const [groups] = await pool.query(`
            SELECT sg.id, sg.groupNumber, sg.groupName, sg.facultyId
            FROM group_members gm
            JOIN student_groups sg ON gm.groupId = sg.id
            WHERE gm.studentId = ?
        `, [studentId]);

        if (groups.length === 0) {
            return res.json(null);
        }

        const group = groups[0];

        // Get all members of this group
        const [members] = await pool.query(`
            SELECT u.id, u.name, u.email, u.rollNumber
            FROM group_members gm
            JOIN users u ON gm.studentId = u.id
            WHERE gm.groupId = ?
        `, [group.id]);

        // Get group projects
        const [projects] = await pool.query(`
            SELECT p.*, u.name as submitterStudentName, u.rollNumber as submitterStudentRoll
            FROM projects p
            LEFT JOIN users u ON p.studentId = u.id
            WHERE p.groupId = ?
            ORDER BY p.submittedAt DESC
        `, [group.id]);

        res.json({ ...group, members, projects });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- SECTIONS MANAGEMENT ----
app.get('/sections', async (req, res) => {
    const { department, graduationYear, branch, domain } = req.query;
    try {
        let query = 'SELECT * FROM sections WHERE 1=1';
        let params = [];
        if (department) { query += ' AND department = ?'; params.push(department); }
        if (graduationYear) { query += ' AND graduationYear = ?'; params.push(graduationYear); }
        if (branch) { query += ' AND branches LIKE ?'; params.push(`%${branch}%`); }
        if (domain) {
            query += ' AND (domain = ? OR domain IS NULL OR domain = "" OR domain = "None / General")';
            params.push(domain);
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/sections', async (req, res) => {
    const { id, name, graduationYear, department, branches, domain } = req.body;
    try {
        if (id) {
            await pool.query(
                'UPDATE sections SET name = ?, graduationYear = ?, department = ?, branches = ?, domain = ? WHERE id = ?',
                [name, graduationYear, department || 'B.Tech', branches, domain || null, id]
            );
            res.json({ id, name, graduationYear, department, branches, domain });
        } else {
            const [result] = await pool.query(
                'INSERT INTO sections (name, graduationYear, department, branches, domain) VALUES (?, ?, ?, ?, ?)',
                [name, graduationYear, department || 'B.Tech', branches, domain || null]
            );
            res.status(201).json({ id: result.insertId, name, graduationYear, department, branches, domain });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/sections/:id', async (req, res) => {
    console.log(`ATTEMPTING TO DELETE SECTION ID: ${req.params.id}`);
    try {
        const [result] = await pool.query('DELETE FROM sections WHERE id = ?', [req.params.id]);
        console.log(`DELETE RESULT for ID ${req.params.id}:`, result.affectedRows);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.json({ message: 'Section deleted' });
    } catch (err) {
        console.error('DELETE ERROR:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Problem Statements (Real-world projects)
app.get('/problem-statements', async (req, res) => {
    const { facultyId, branch } = req.query;
    try {
        let query = `
            SELECT ps.*, u.name as creatorName, f.name as assignedFacultyName 
            FROM problem_statements ps
            LEFT JOIN users u ON ps.createdBy = u.id
            LEFT JOIN users f ON ps.assignedToFacultyId = f.id
            WHERE 1=1
        `;
        let params = [];

        if (facultyId) {
            query += ' AND (ps.assignedToFacultyId = ? OR ps.assignedToFacultyId IS NULL)';
            params.push(facultyId);
        }
        if (branch) {
            query += ' AND ps.branch = ?';
            params.push(branch);
        }

        query += ' ORDER BY ps.id DESC';
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/problem-statements', async (req, res) => {
    const { title, description, branch, domain, difficulty, createdBy, assignedToFacultyId } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO problem_statements (title, description, branch, domain, difficulty, createdBy, assignedToFacultyId) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, branch, domain, difficulty || 'Intermediate', createdBy, assignedToFacultyId || null]
        );
        res.status(201).json({ id: result.insertId, title, description, branch, domain, difficulty, createdBy, assignedToFacultyId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/problem-statements/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM problem_statements WHERE id = ?', [req.params.id]);
        res.json({ message: 'Problem statement deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Legacy remove student route
app.delete('/faculty/students/:studentId', async (req, res) => {
    res.status(400).json({ message: "Use the specific route DELETE /faculty/:facultyId/students/:studentId" });
});
