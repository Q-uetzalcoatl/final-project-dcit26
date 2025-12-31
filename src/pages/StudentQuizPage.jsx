/* ========
delete this
========
*/
import React, { useState, useEffect, useRef } from 'react';
import { Timer, AlertTriangle, ChevronRight, CheckCircle } from 'lucide-react';

const StudentQuizPage = ({ quiz, studentName, onComplete, notify }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60); 
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  
  const startTimeRef = useRef(Date.now());
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;

  // TIMER LOGIC
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ANTI-CHEAT (TAB SWITCHING)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations((prev) => {
          const newCount = prev + 1;
          if (newCount >= 5) {
            handleSubmit();
          } else {
            setShowWarning(true);
          }
          return newCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (qId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    // Calculate Score
    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        score++;
      }
    });

    const endTime = Date.now();
    const durationMs = endTime - startTimeRef.current;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    const timeSpentString = `${minutes}m ${seconds}s`;

    const resultData = {
      studentName,
      quizId: quiz.id,
      score,
      total: quiz.questions.length,
      released: false,
      timestamp: new Date().toISOString(),
      timeSpent: timeSpentString,
      violations: violations
    };

    const existingResults = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
    existingResults.push(resultData);
    localStorage.setItem('cvsu_db_results', JSON.stringify(existingResults));

    onComplete();
  };

  // Progress Bar Calculation
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="w-full max-w-3xl relative mx-auto">
      
      {/* WARNING POPUP */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm text-center border-4 border-red-500 animate-pulse">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">WARNING!</h2>
            <p className="text-gray-800 font-bold mb-4">Tab switching detected!</p>
            <p className="text-sm text-gray-600 mb-6">
              Violation <b>{violations}/5</b>. 
              <br/>Reaching 5 will auto-submit your exam.
            </p>
            <button 
              onClick={() => setShowWarning(false)}
              className="w-full bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700"
            >
              I UNDERSTAND
            </button>
          </div>
        </div>
      )}

      {/* Floating Header */}
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center sticky top-4 z-40 border-l-4 border-emerald-500">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">{quiz.title}</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                />
             </div>
             <span className="text-xs text-gray-500">
               {currentQuestionIndex + 1} of {quiz.questions.length}
             </span>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xl ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
          <Timer className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Card (ONE QUESTION AT A TIME) */}
      <div className="bg-white rounded-xl shadow-lg p-8 min-h-[400px] flex flex-col justify-between">
        <div>
            <h3 className="font-semibold text-xl mb-6 text-gray-800">
              <span className="text-emerald-600 font-bold mr-2">{currentQuestionIndex + 1}.</span> 
              {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(currentQuestion.id, i)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center group ${
                    answers[currentQuestion.id] === i 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 shadow-sm' 
                      : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                    answers[currentQuestion.id] === i 
                      ? 'border-emerald-600 bg-emerald-600' 
                      : 'border-gray-300 group-hover:border-emerald-400'
                  }`}>
                    {answers[currentQuestion.id] === i && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="text-lg">{opt}</span>
                </button>
              ))}
            </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t flex justify-end">
          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!hasAnsweredCurrent}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold shadow-lg transition-all ${
                hasAnsweredCurrent 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 transform active:scale-95' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Submit Examination
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                hasAnsweredCurrent 
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next Question
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentQuizPage;
