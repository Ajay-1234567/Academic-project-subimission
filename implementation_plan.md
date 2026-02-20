# Academic Project Submission & Evaluation Portal - Implementation Plan

## Goal
Build a professional, realistic, and aesthetically pleasing full-stack application for managing academic project submissions and evaluations.

## Tech Stack
- **Frontend**: Angular (Latest)
- **Backend**: Node.js + Express
- **Database**: Local JSON-based storage (for easy setup/portability) or In-Memory
- **Styling**: Vanilla CSS (Modern, Glassmorphism, Animations, Responsive)

## Modules
1.  **Authentication & Roles**
    -   Login Screen (Student, Faculty, Admin)
    -   Role-based redirects
2.  **Student Portal**
    -   Dashboard: View current project status.
    -   Submission: Form to upload project details (Title, Abstract, Repository URL, Documentation URL).
    -   Results: View grades and feedback.
3.  **Faculty Portal**
    -   Dashboard: List of assigned submissions.
    -   Evaluation: Interface to view project details and input grades/feedback.

## Design System (Premium Aesthetics)
-   **Theme**: Dark mode with vibrant accent gradients (Violet/Blue/Teal).
-   **UI Elements**:
    -   Glassmorphism cards (translucent backgrounds with blur).
    -   Smooth hover effects and micro-interactions.
    -   Modern typography (Inter/Roboto).
    -   Animated transitions between views.

## Step-by-Step Plan
1.  **Setup**: Initialize project structure (frontend/backend).
2.  **Backend**: Create Express server with API endpoints for auth, submissions, and grading.
3.  **Frontend Core**: Setup Angular, global styles, and layout components (Navbar, Sidebar).
4.  **Features**: Implement key views (Login, Student Dashboard, Faculty Dashboard).
5.  **Polish**: Add animations, ensure responsiveness, and "wow" factor.
