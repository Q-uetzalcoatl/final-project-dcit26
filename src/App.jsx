import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AlertTriangle, LogOut } from 'lucide-react';

// Import Data
import { QUIZZES } from './data/quizzes';

// Import Pages
import LoginPage from './pages/LoginPage';
import QuizSelectionPage from './pages/QuizSelectionPage';
import StudentQuizPage from './pages/StudentQuizPage';
import ResultPendingPage from './pages/ResultPendingPage';
import AdminDashboard from './pages/AdminDashboard';
import PasswordModal from './components/PasswordModal';

export default function App() {
  const [view, setView] = useState('login'); 
  const [studentName, setStudentName] = useState('');
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Initialize from sessionStorage (Tab Specific)
  useEffect(() => {
    const savedName = sessionStorage.getItem('cvsu_student_name');
    const savedView = sessionStorage.getItem('cvsu_current_view');
    const savedQuizId = sessionStorage.getItem('cvsu_active_quiz');
    
    if (savedName) setStudentName(savedName);
    if (savedQuizId) setActiveQuizId(savedQuizId);

    if (savedName && savedName.toLowerCase() === 'admin') {
        setView('admin');
    } else if (savedView) {
        setView(savedView);
    }
  }, []);

  // Save State to sessionStorage
  useEffect(() => {
    if (view !== 'login') sessionStorage.setItem('cvsu_current_view', view);
    if (activeQuizId) sessionStorage.setItem('cvsu_active_quiz', activeQuizId);
  }, [view, activeQuizId]);

  const handleLogin = (name) => {
    if (!name) return;
    sessionStorage.setItem('cvsu_student_name', name);
    setStudentName(name);

    if (name === 'Admin') {
      setView('admin');
    } else {
      setView('dashboard');
    }
  };

  const handleSelectQuiz = (quizId) => {
    // Note: Results should still use localStorage so they persist across reloads/sessions
    // Otherwise, restarting the browser would delete all student grades!
    const allResults = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
    const existingAttempt = allResults.find(r => r.studentName === studentName && r.quizId === quizId);

    if (existingAttempt) {
      if (existingAttempt.released) {
        setActiveQuizId(quizId);
        setView('waiting');
      } else {
        alert("You have already taken this quiz. Please wait for the instructor to release your score.");
      }
    } else {
      setActiveQuizId(quizId);
      setView('quiz_password');
    }
  };

  const handlePasswordSuccess = () => {
    const allResults = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
    const existing = allResults.find(r => r.studentName === studentName && r.quizId === activeQuizId);

    if (existing) {
       alert("You have already taken this quiz. Please wait for the instructor to release your score.");
       setView('dashboard');
    } else {
      setView('quiz');
    }
  };

  const handleLogout = () => {
    sessionStorage.clear(); // Clears only this tab
    setStudentName('');
    setActiveQuizId(null);
    setView('login');
    window.location.reload(); 
  };

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-yellow-50 text-emerald-900 font-sans selection:bg-yellow-200">
        {notification && (
          <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-xl border-l-4 animate-bounce
            ${notification.type === 'error' ? 'bg-red-100 border-red-500 text-red-900' : 'bg-yellow-100 border-yellow-500 text-yellow-900'}
          `}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold">{notification.msg}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-emerald-700 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-emerald-900 font-bold text-lg shadow-sm">CVSU</div>
             <div>
               <h1 className="text-lg font-bold leading-none">CvSU Portal</h1>
               <span className="text-xs text-emerald-200 opacity-80">Online Examination System</span>
             </div>
          </div>
          {studentName && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs text-emerald-200">Logged in as</span>
                  <span className="font-bold text-white text-sm">{studentName}</span>
              </div>
              <button onClick={handleLogout} className="bg-emerald-800 hover:bg-emerald-900 p-2 rounded-lg transition-colors border border-emerald-600" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </header>

        <main className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {view === 'dashboard' && (
              <QuizSelectionPage 
                onSelectQuiz={handleSelectQuiz} 
                quizzes={QUIZZES} 
                studentName={studentName} 
                />
              )}

          {view === 'quiz_password' && (
            <PasswordModal 
              quiz={QUIZZES.find(q => q.id === activeQuizId)} 
              onSuccess={handlePasswordSuccess} 
              onBack={() => setView('dashboard')} 
              />
            )}

        {view === 'quiz' && (
          <StudentQuizPage 
            quiz={QUIZZES.find(q => q.id === activeQuizId)} 
            studentName={studentName} 
            onComplete={() => setView('waiting')}
            notify={showNotification}
            />
          )}

        {view === 'waiting' && (
          <ResultPendingPage 
            studentName={studentName} 
            quizId={activeQuizId} 
            onBack={() => setView('dashboard')} 
          />
        )}
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
    }
