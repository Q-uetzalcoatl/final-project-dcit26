import React, { useState, useEffect, useCallback } from 'react';
import { Timer, AlertTriangle, ChevronRight, CheckCircle, Save, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// CONFIGURATION
const MAX_VIOLATIONS = 5; // The limit before auto-kick

const StudentQuizPage = ({ quiz: propQuiz, studentName, onComplete }) => {
  const navigate = useNavigate();

  // 1. STATE MANAGEMENT
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW: State for the Custom Warning Modal
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  // 2. SUBMISSION LOGIC
  const handleSubmit = useCallback((forceSubmit = false) => {
    if (!activeQuiz) return;

    // Calculate Score
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score++;
    });

    const resultData = {
      id: Date.now(),
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      studentName: studentName || "Student",
      score: score,
      total: activeQuiz.questions.length,
      violations: forceSubmit ? MAX_VIOLATIONS : violations,
      date: new Date().toLocaleString(),
      status: forceSubmit ? "Terminated (Cheating)" : "Completed"
    };

    // Save Results
    const existingResults = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
    existingResults.push(resultData);
    localStorage.setItem('cvsu_db_results', JSON.stringify(existingResults));

    // Clear Session
    localStorage.removeItem('cvsu_quiz_session');

    if (onComplete) {
      onComplete(resultData);
    } else {
      navigate('/'); 
    }
  }, [activeQuiz, answers, violations, studentName, onComplete, navigate]);

  // 3. INITIALIZATION & RECOVERY
  useEffect(() => {
    const initializeQuiz = () => {
      // Check if already taken
      const allResults = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
      const alreadyTaken = allResults.find(r => r.studentName === studentName && (propQuiz && r.quizTitle === propQuiz.title));

      if (alreadyTaken) {
        alert("You have already taken this quiz!");
        if (onComplete) onComplete(alreadyTaken);
        else navigate('/');
        return;
      }

      // Recover Session
      const savedSession = localStorage.getItem('cvsu_quiz_session');
      
      if (propQuiz) {
        setActiveQuiz(propQuiz);
        if (!savedSession || JSON.parse(savedSession).quiz.id !== propQuiz.id) {
           setTimeLeft(propQuiz.duration * 60);
        }
        setIsLoading(false);
      } 
      else if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        setActiveQuiz(parsedSession.quiz);
        setCurrentQuestionIndex(parsedSession.currentQuestionIndex);
        setAnswers(parsedSession.answers);
        setViolations(parsedSession.violations);
        setTimeLeft(parsedSession.timeLeft); 
        setIsLoading(false);
      } 
      else {
        // Fallback for direct URL access without data
        alert("Error: Quiz not found. Returning to home.");
        navigate('/');
      }
    };

    initializeQuiz();
  }, [propQuiz, navigate, studentName]);

  // 4. SECURITY SYSTEM (The Custom Modal Fix)
  useEffect(() => {
    if (!activeQuiz || isTerminated) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => {
          const newVal = prev + 1;
          
          // TRIGGER THE WARNING MODAL
          // We do NOT use alert() anymore. We use our custom state.
          if (newVal < MAX_VIOLATIONS) {
            setShowWarningModal(true);
          }
          return newVal;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeQuiz, isTerminated]);

  // 5. VIOLATION WATCHER (The Kill Switch)
  useEffect(() => {
    if (violations >= MAX_VIOLATIONS && !isTerminated) {
      setIsTerminated(true);
      setShowWarningModal(true); // Ensure modal is open to show the "Terminated" message
      
      // Auto-submit after a brief delay so they see the message
      setTimeout(() => {
        handleSubmit(true);
      }, 3000);
    }
  }, [violations, handleSubmit, isTerminated]);

  // 6. TIMER & AUTO-SAVE
  useEffect(() => {
    if (!activeQuiz || timeLeft <= 0 || isTerminated) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const sessionData = {
      quiz: activeQuiz,
      currentQuestionIndex,
      answers,
      violations,
      timeLeft
    };
    localStorage.setItem('cvsu_quiz_session', JSON.stringify(sessionData));

    return () => clearInterval(timer);
  }, [timeLeft, activeQuiz, currentQuestionIndex, answers, violations, isTerminated]);


  // 7. RENDER
  if (isLoading || !activeQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-bold text-gray-600 animate-pulse">Loading Quiz Session...</div>
      </div>
    );
  }

  const currentQuestion = activeQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOptionSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative">
      
      {/* =========================================================================== */}
      {/* CUSTOM SECURITY MODAL (THE POP UP) */}
      {/* =========================================================================== */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center border-t-8 border-red-600">
            
            {violations >= MAX_VIOLATIONS ? (
              // TERMINATION MESSAGE
              <>
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">QUIZ TERMINATED</h2>
                <p className="text-gray-600 mb-6 text-lg">
                  You exceeded the limit of <b>{MAX_VIOLATIONS} tab switches.</b><br/>
                  Your answers are being auto-submitted.
                </p>
                <div className="animate-pulse text-sm font-bold text-red-500">
                  Redirecting...
                </div>
              </>
            ) : (
              // WARNING MESSAGE
              <>
                <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">SECURITY WARNING</h2>
                <p className="text-gray-600 mb-6">
                  Tab switching is strictly prohibited.<br/>
                  You have recorded <b>{violations}</b> out of <b>{MAX_VIOLATIONS}</b> allowed violations.
                </p>
                <button 
                  onClick={() => setShowWarningModal(false)}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                >
                  I Understand
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-lg font-bold text-green-700">{activeQuiz.title}</h1>
          <p className="text-xs text-gray-500">Candidate: {studentName}</p>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded border-2 font-mono font-bold text-lg 
          ${timeLeft < 60 ? 'border-red-500 text-red-600 bg-red-50' : 'border-green-600 text-green-700 bg-green-50'}`}>
          <Timer size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-gray-200 h-2">
        <div className="bg-green-600 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        
        {/* PERSISTENT VIOLATION BANNER (Top of Quiz) */}
        {violations > 0 && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-600 p-4 flex items-center justify-between">
            <div className="flex items-center text-red-800 font-bold">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <span>SECURITY ALERT: {violations} / {MAX_VIOLATIONS} Violations Detected.</span>
            </div>
          </div>
        )}

        {/* QUESTION CARD */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-gray-400 uppercase">
              Question {currentQuestionIndex + 1} / {activeQuiz.questions.length}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full text-left p-4 rounded border-2 transition-all flex items-center justify-between
                  ${answers[currentQuestionIndex] === idx 
                    ? 'border-green-600 bg-green-50 text-green-900 font-semibold shadow-sm' 
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50 text-gray-700'}`}
              >
                <span>{option}</span>
                {answers[currentQuestionIndex] === idx && <CheckCircle className="text-green-600 w-5 h-5"/>}
              </button>
            ))}
          </div>

          {/* FOOTER CONTROLS */}
          <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded font-medium ${currentQuestionIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Back
            </button>

            {currentQuestionIndex === activeQuiz.questions.length - 1 ? (
              <button
                onClick={() => handleSubmit(false)}
                className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded font-bold shadow flex items-center gap-2"
              >
                <Save size={18} />
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow flex items-center gap-2"
              >
                Next
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizPage;
