import React, { useState, useEffect, useRef } from 'react';
import { Timer, AlertTriangle, ChevronRight, CheckCircle, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// COMPONENT: StudentQuizPage
// RESPONSIBILITY: Handles the taking of the quiz, timer logic, and session recovery.
const StudentQuizPage = ({ quiz: propQuiz, studentName, onComplete }) => {
  const navigate = useNavigate();

  // =========================================================================
  // 1. STATE MANAGEMENT
  // =========================================================================
  
  // NOTE: We initialize 'activeQuiz' as null. 
  // PROBLEM FIX: Previously, accessing quiz.questions immediately caused a crash on reload.
  // SOLUTION: We wait to see if we can recover the session from localStorage first.
  const [activeQuiz, setActiveQuiz] = useState(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  
  // Loading state to prevent rendering UI before data is ready (White Screen Fix)
  const [isLoading, setIsLoading] = useState(true);

  // =========================================================================
  // 2. SESSION RECOVERY LOGIC (The Crash Fix)
  // =========================================================================
  useEffect(() => {
    const loadSession = () => {
      // Check if there is an unfinished session in the browser storage
      const savedSession = localStorage.getItem('cvsu_quiz_session');
      
      if (propQuiz) {
        // SCENARIO A: Normal Navigation
        // The user came from the App/Home component properly.
        // We use the prop and start a fresh session.
        setActiveQuiz(propQuiz);
        setTimeLeft(propQuiz.duration * 60);
        setIsLoading(false);
      } else if (savedSession) {
        // SCENARIO B: Page Reload / Crash Recovery
        // The prop is undefined (because of F5), but we found data in storage.
        const parsedSession = JSON.parse(savedSession);
        
        console.log("Session Restored:", parsedSession); // For debugging
        
        // Restore the state exactly as it was
        setActiveQuiz(parsedSession.quiz);
        setCurrentQuestionIndex(parsedSession.currentQuestionIndex);
        setAnswers(parsedSession.answers);
        setViolations(parsedSession.violations);
        setTimeLeft(parsedSession.timeLeft); // Resume timer, don't restart it
        setIsLoading(false);
      } else {
        // SCENARIO C: Unauthorized Access
        // No prop and no saved session. Redirect to home to prevent crash.
        alert("No active quiz session found. Returning to home.");
        navigate('/'); 
      }
    };

    loadSession();
  }, [propQuiz, navigate]);

  // =========================================================================
  // 3. AUTO-SAVE (Session Persistence)
  // =========================================================================
  // LOGIC: Every time the student answers or time changes, we save to localStorage.
  // This ensures that if they crash/reload, we have the latest data in Scenario B above.
  useEffect(() => {
    if (activeQuiz) {
      const sessionData = {
        quiz: activeQuiz,
        currentQuestionIndex,
        answers,
        violations,
        timeLeft
      };
      localStorage.setItem('cvsu_quiz_session', JSON.stringify(sessionData));
    }
  }, [activeQuiz, currentQuestionIndex, answers, violations, timeLeft]);

  // =========================================================================
  // 4. TIMER LOGIC
  // =========================================================================
  useEffect(() => {
    // Don't start timer until quiz is loaded
    if (!activeQuiz || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleSubmit(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [activeQuiz, timeLeft]);

  // =========================================================================
  // 5. EVENT HANDLERS
  // =========================================================================

  const handleOptionSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleSubmit = (isTimeOut = false) => {
    // IMPORTANT: Clear the session storage so the user doesn't get stuck 
    // reloading into an old quiz next time.
    localStorage.removeItem('cvsu_quiz_session');
    
    // Calculate Score
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score++;
    });

    const results = {
      quizTitle: activeQuiz.title,
      score: score,
      total: activeQuiz.questions.length,
      violations: violations,
      studentName: studentName || "Student",
      date: new Date().toISOString()
    };

    // Send results back to parent component (App.jsx)
    if (onComplete) {
      onComplete(results);
    } else {
      navigate('/');
    }
  };

  // Helper to format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // =========================================================================
  // 6. RENDER (UI)
  // =========================================================================

  // CRITICAL GUARD CLAUSE:
  // If we are still loading or activeQuiz is null, DO NOT try to render the questions.
  // This prevents the "Cannot read properties of undefined" White Screen error.
  if (isLoading || !activeQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-xl font-bold text-gray-600">Restoring your session...</p>
        </div>
      </div>
    );
  }

  // Define current question variables only after the Guard Clause passed
  const currentQuestion = activeQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Header with Timer */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{activeQuiz.title}</h1>
          <p className="text-sm text-gray-500">Student: {studentName || 'Guest'}</p>
        </div>
        
        {/* Timer Display */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xl ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          <Timer className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div className="bg-green-600 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="max-w-4xl mx-auto p-6 mt-6">
        {/* Anti-Cheat Warning Display */}
        {violations > 0 && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 p-4 flex items-center text-red-700">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>Warning: {violations} Violation(s) Detected.</span>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between group
                  ${answers[currentQuestionIndex] === idx 
                    ? 'border-green-600 bg-green-50 text-green-800' 
                    : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
              >
                <span className="font-medium text-lg">{option}</span>
                {answers[currentQuestionIndex] === idx && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between items-center pt-6 border-t">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-2 rounded-lg font-medium ${currentQuestionIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Previous
            </button>

            {currentQuestionIndex === activeQuiz.questions.length - 1 ? (
              <button
                onClick={() => handleSubmit(false)}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transform transition hover:scale-105"
              >
                <Save className="w-5 h-5" />
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transform transition hover:scale-105"
              >
                Next Question
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizPage;
