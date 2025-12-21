import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { questions } from '../data/questions';

function ResultScreen() {
  const { state, dispatch } = useQuiz();
  
  // Calculate percentage
  const percentage = Math.round((state.score / questions.length) * 100);

  // Logic for the dynamic "Side Comments"
  let message = '';
  let bgColor = '';
  
  if (percentage >= 80) {
    message = 'Excellent Work! 🎉';
    bgColor = 'bg-green-100 text-green-800 border-green-200';
  } else if (percentage >= 60) {
    message = 'Good Job! 👍';
    bgColor = 'bg-blue-100 text-blue-800 border-blue-200';
  } else {
    message = 'Keep Practicing! 💪';
    bgColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        
        {/* Big Percentage Circle */}
        <div className="mb-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg">
            {percentage}%
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
        
        {/* Dynamic Message Badge */}
        <div className={`inline-block px-6 py-2 rounded-full text-lg font-semibold mb-6 border ${bgColor}`}>
          {message}
        </div>

        {/* The Grey Box for Score Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-100">
          <p className="text-gray-500 text-sm uppercase tracking-wide mb-2 font-semibold">Final Score</p>
          <p className="text-4xl font-bold text-gray-800">
            {state.score} / {questions.length}
          </p>
        </div>

        <button
          onClick={() => dispatch({ type: 'RESTART' })}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default ResultScreen;
