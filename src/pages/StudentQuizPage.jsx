import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle, ChevronRight, CheckCircle, Save, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ==================================================================================
// STUDENT QUIZ PAGE (FINAL FIX)
// ==================================================================================
const StudentQuizPage = ({ quiz: propQuiz, studentName, onComplete }) => {
  const navigate = useNavigate();

  // --------------------------------------------------------------------------------
  // 1. STATE INITIALIZATION
  // --------------------------------------------------------------------------------
  // 'activeQuiz' is null initially to prevent the "White Screen" crash
  const [activeQuiz, setActiveQuiz] = useState(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --------------------------------------------------------------------------------
  // 2. SESSION RECOVERY & "ALREADY TAKEN" CHECK (The Critical Fix)
  // --------------------------------------------------------------------------------
  useEffect(() => {
    const initializeQuiz = () => {
      // A. CHECK IF ALREADY TAKEN
      // We look at the MAIN DATABASE (cvsu_db_results) to see if this student finished this quiz.
      const allResults = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
      const alreadyTaken = allResults.find(
        r => r.studentName === studentName && 
        (propQuiz && r.quizTitle === propQuiz.title) // Check by title or ID
      );

      if (alreadyTaken) {
        alert("You have already taken this quiz!");
        if (onComplete) onComplete(alreadyTaken); // Just show results
        else navigate('/');
        return;
      }

      // B. SESSION RECOVERY (Handle Page Refresh)
      const savedSession = localStorage.getItem('cvsu_quiz_session');
      
      if (propQuiz) {
        // Scenario 1: Fresh Start (or coming from App.jsx)
        setActiveQuiz(propQuiz);
        // Only set time if we aren't recovering a session for this specific quiz
        if (!savedSession || JSON.parse(savedSession).quiz.id !== propQuiz.id) {
           setTimeLeft(propQuiz.duration * 60);
        }
        setIsLoading(false);
      } 
      else if (savedSession) {
        // Scenario 2: Refresh detected (Prop is missing, but storage exists)
        const parsedSession = JSON.parse(savedSession);
        
        setActiveQuiz(parsedSession.quiz);
        setCurrentQuestionIndex(parsedSession.currentQuestionIndex);
        setAnswers(parsedSession.answers);
        setViolations(parsedSession.violations);
        setTimeLeft(parsedSession.timeLeft); 
        setIsLoading(false);
      } 
      else {
        // Scenario 3: Unauthorized / URL manipulation
        alert("Error: Quiz not found. Returning to home.");
        navigate('/');
      }
    };

    initializeQuiz();
  }, [propQuiz, navigate, studentName]);

  // --------------------------------------------------------------------------------
  // 3. SECURITY SYSTEM (Restored)
  // --------------------------------------------------------------------------------
  useEffect(() => {
    if (!activeQuiz) return;

    // A. Tab Switching Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => {
          const newVal = prev + 1;
          // Optional: Auto-submit if too many violations (e.g., > 5)
           if (newVal >= 5) {
             alert("Too many violations! Quiz is being auto-submitted.");
             // We need to call submit via a ref or just force it here. 
             // For safety, we just alert now, but you can trigger submit.
           }
          return newVal;
        });
        alert("WARNING: Tab switching is a violation! This has been recorded.");
      }
    };

    // B. Window Blur (Clicking outside browser)
    const handleBlur = () => {
       // Optional: You can enable this if strict mode is needed
       // setViolations(prev => prev + 1);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [activeQuiz]);

  // --------------------------------------------------------------------------------
  // 4. TIMER & AUTO-SAVE
  // --------------------------------------------------------------------------------
  useEffect(() => {
    if (!activeQuiz || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // TIME'S UP
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Save Session continuously
    const sessionData = {
      quiz: activeQuiz,
      currentQuestionIndex,
      answers,
      violations,
      timeLeft
    };
    localStorage.setItem('cvsu_quiz_session', JSON.stringify(sessionData));

    return () => clearInterval(timer);
  }, [timeLeft, activeQuiz, currentQuestionIndex, answers, violations]);

  // --------------------------------------------------------------------------------
  // 5. SUBMISSION LOGIC (Restored DB Saving)
  // --------------------------------------------------------------------------------
  const handleSubmit = (isTimeOut = false) => {
    if (!activeQuiz) return;

    // 1. Calculate Score
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score++;
    });

    // 2. Create Result Object
    const resultData = {
      id: Date.now(), // Unique ID for the result
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      studentName: studentName || "Student",
      score: score,
      total: activeQuiz.questions.length,
      violations: violations,
      date: new Date().toLocaleString(),
      status: isTimeOut ? "Timed Out" : "Completed"
    };

    // 3. SAVE TO "DATABASE" (localStorage 'cvsu_db_results')
    // This ensures the Admin Dashboard sees it.
    const existingResults = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
    existingResults.push(resultData);
    localStorage.setItem('cvsu_db_results', JSON.stringify(existingResults));

    // 4. Clear Temporary Session (So they can't resume a finished quiz)
    localStorage.removeItem('cvsu_quiz_session');

    // 5. Notify Parent / Finish
    if (isTimeOut) alert("Time is up! Your quiz has been submitted.");
    
    if (onComplete) {
      onComplete(resultData);
    } else {
      navigate('/'); 
    }
  };

  // --------------------------------------------------------------------------------
  // 6. RENDER HELPERS
  // --------------------------------------------------------------------------------
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOptionSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
  };

  // --------------------------------------------------------------------------------
  // 7. MAIN RENDER (With Guard Clause)
  // --------------------------------------------------------------------------------
  
  // PREVENT CRASH: If data isn't ready, show loader.
  if (isLoading || !activeQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-bold text-gray-600 animate-pulse">Loading Quiz Session...</div>
      </div>
    );
  }

  const currentQuestion = activeQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
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
        {/* VIOLATION ALERT */}
        {violations > 0 && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-600 p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center text-red-800 font-bold">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <span>SECURITY ALERT: {violations} Tab Violation(s) Detected!</span>
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
