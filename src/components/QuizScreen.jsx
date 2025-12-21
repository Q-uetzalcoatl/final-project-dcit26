import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { questions } from '../data/questions';

function QuizScreen() {
  const { state, dispatch } = useQuiz();
  const currentQuestion = questions[state.currentQuestionIndex];

  const handleAnswer = (selectedIndex) => {
    dispatch({
      type: 'ANSWER_QUESTION',
      payload: {
        selectedAnswer: selectedIndex,
        correctAnswer: currentQuestion.correctAnswer
      }
    });
  };

  // Calculate progress for the bar
  const progressPercentage = ((state.currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        
        {/* TOP BAR: Question Count (Left) and Score Tally (Right) */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2 font-semibold">
            <span>Question {state.currentQuestionIndex + 1} of {questions.length}</span>
            <span className="text-indigo-600">Current Score: {state.score}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {currentQuestion.question}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 font-medium text-gray-700 hover:text-indigo-700"
            >
              <span className="inline-block w-8 h-8 rounded-full bg-gray-100 text-center leading-8 mr-3 font-bold text-gray-600">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuizScreen;
