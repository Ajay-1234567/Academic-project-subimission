# Academic Project Submission & Evaluation Portal

A modern, full-stack web application designed for colleges to manage academic project submissions and evaluations. Built with Angular (Frontend) and Node.js/Express (Backend).

## Features
- **Role-Based Access**: Secure login for Students, Faculty, and Administrators.
- **Student Dashboard**: Submit project details, view status, and see grades.
- **Faculty Dashboard**: View assigned submissions, evaluate projects, and provide feedback.
- **Real-time Updates**: Instant status reflection.
- **Modern UI**: Glassmorphism design with responsive layout and smooth animations.

## Tech Stack
- **Frontend**: Angular (Latest)
- **Backend**: Node.js + Express
- **Database**: Local JSON storage (for simplicity and portability)

## Getting Started

### Prerequisites
- Node.js installed

### 1. Backend Setup
Navigate to the `backend` folder and start the server:
```bash
cd backend
npm install
node server.js
```
The server will run on `http://localhost:3000`.

### 2. Frontend Setup
Navigate to the `frontend` folder and start the application:
```bash
cd frontend
npm install
ng serve
```
Open your browser and navigate to `http://localhost:4200`.

## Default Credentials
- **Student**: `student` / `password`
- **Faculty**: `faculty` / `password`
- **Admin**: `admin` / `admin`

## Project Structure
- `/backend`: API server and database file.
- `/frontend`: Angular source code.
