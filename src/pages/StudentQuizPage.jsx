import React, { useState, useEffect, useRef } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

const StudentQuizPage = ({ quiz, studentName, onComplete, notify }) => {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60); // Convert mins to seconds
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  
  // To track total time spent
  const startTimeRef = useRef(Date.now());

  // TIMER LOGIC
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time is up
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
            handleSubmit(); // Auto-submit on 5th violation
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

  const handleSubmit = () => {
    // Calculate Score
    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        score++;
      }
    });

    // Calculate Time Spent
    const endTime = Date.now();
    const durationMs = endTime - startTimeRef.current;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    const timeSpentString = `${minutes}m ${seconds}s`;

    // Save Result
    const resultData = {
      studentName,
      quizId: quiz.id,
      score,
      total: quiz.questions.length,
      released: false,
      timestamp: new Date().toISOString(),
      timeSpent: timeSpentString, // SAVED HERE
      violations: violations // Save violation count too
    };

    const existingResults = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
    existingResults.push(resultData);
    localStorage.setItem('cvsu_db_results', JSON.stringify(existingResults));

    onComplete();
  };

  return (
    <div className="w-full max-w-4xl relative">
      
      {/* WARNING POPUP */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm text-center border-4 border-red-500 animate-pulse">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">WARNING!</h2>
            <p className="text-gray-800 font-bold mb-4">
              Tab switching is detected!
            </p>
            <p className="text-sm text-gray-600 mb-6">
              You have committed <b>{violations}/5</b> violations. 
              <br/>If you reach 5, your exam will be automatically submitted.
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
          <p className="text-xs text-gray-500">Attempting as: {studentName}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xl ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
          <Timer className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="space-y-8">
          {quiz.questions.map((q, index) => (
            <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="font-semibold text-lg mb-4 flex gap-2">
                <span className="text-emerald-600 font-bold">{index + 1}.</span> 
                {q.question}
              </h3>
              <div className="space-y-2 pl-6">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(q.id, i)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center ${
                      answers[q.id] === i 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium ring-1 ring-emerald-500' 
                        : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${answers[q.id] === i ? 'border-emerald-600 bg-emerald-600' : 'border-gray-400'}`}>
                      {answers[q.id] === i && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Questions Answered: {Object.keys(answers).length} / {quiz.questions.length}
          </div>
          <button
            onClick={handleSubmit}
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 shadow-lg transform active:scale-95 transition-all"
          >
            Submit Examination
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizPage;
