# CvSU Online Examination System

A secure, web-based examination portal developed for **DCIT 26 (Application Development and Emerging Technologies)**. This application allows students to take timed examinations with built-in security features while providing instructors with a dashboard to manage and release scores.

## 🚀 Features

### 🎓 Student Portal
* **Secure Login:** Authentication using Student Email and ID Number.
* **Quiz Selection:** View available exams with details on duration and subject.
* **Password Protection:** Exams are secured with specific access codes.
* **Real-time Timer:** Countdown timer that auto-submits the exam when time expires.
* **Anti-Cheat System:**
    * Detects if the student switches tabs or minimizes the window.
    * Issues warnings for suspicious activity.
    * **Auto-submits** the exam after 5 recorded violations.
* **Result Tracking:** Students can view their scores only after the instructor releases them.

### 🛡️ Instructor (Admin) Dashboard
* **Submission Monitoring:** View a list of all student attempts.
* **Detailed Analytics:** See the score, **time spent**, and **violation count** for each student.
* **Score Release:** One-click button to release results to all students.

## 🛠️ Tech Stack

* **Frontend Framework:** React (Vite)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **State Management:** React Hooks (useState, useEffect)
* **Routing:** React Router DOM

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/Q-uetzalcoatl/final-project-dcit26.git](https://github.com/Q-uetzalcoatl/final-project-dcit26.git)
    cd final-project-dcit26
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173`.

## 🔑 Default Credentials (For Testing)

Since this project uses a mock database structure for demonstration purposes, use the following credentials to access the system:

**👮 Instructor Login**
* **Toggle Switch:** Select "Instructor"
* **Email:** `admin@cvsu.edu.ph`
* **Password:** `admin123`

**👨‍🎓 Student Login**
* **Toggle Switch:** Select "Student"
* **Email:** `john@cvsu.edu.ph`
* **Student ID:** `2025001`

**📝 Quiz Access Codes**
* **Midterm Examination:** `dcit`
* **Final Project Quiz:** `cvsu`

## 📂 Project Structure

* `src/components` - Reusable UI components (Modals, etc.)
* `src/data` - Mock database files (Quizzes, Users)
* `src/pages` - Main application views (Login, Quiz, Dashboard)
* `src/App.jsx` - Main routing and state logic

## 👥 Group Members

* **[Nathaniel M. Abaya]** - Lead Developer
* **[Carl Andrey E. Damayo]** - Content Manager
* **[Rhayzel Ann Joy B. Aquino]** - UI/UX Designer
* **[Devieth Joshua M. Anto]** - Documentation
* **[Rodrigo Victor M. Beltran]** - Documentation
* **[John Gabriel C.Perjes]** - Quality Assurance 

