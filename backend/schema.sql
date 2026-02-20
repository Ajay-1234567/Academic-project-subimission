CREATE DATABASE IF NOT EXISTS academic_portal;
USE academic_portal;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'faculty', 'admin') NOT NULL,
    name VARCHAR(255) NOT NULL
);

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
);

CREATE TABLE IF NOT EXISTS evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT,
    facultyId INT,
    comments TEXT,
    score INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id),
    FOREIGN KEY (facultyId) REFERENCES users(id)
);

-- Insert dummy data if empty
INSERT IGNORE INTO users (id, username, password, role, name) VALUES 
(1, 'student1', 'password', 'student', 'Alice Student'),
(2, 'faculty1', 'password', 'faculty', 'Dr. Bob Faculty'),
(3, 'admin', 'password', 'admin', 'Admin User');
