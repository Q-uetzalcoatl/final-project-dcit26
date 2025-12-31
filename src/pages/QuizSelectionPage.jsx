/* ========
delete this
========
*/
import React from 'react';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';

const QuizSelectionPage = ({ onSelectQuiz, quizzes, studentName }) => {
  return (
    <div className="w-full max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Available Examinations</h2>
        <p className="text-emerald-700">Welcome back, {studentName}. Select a quiz to begin.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-emerald-100 flex flex-col h-full">
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {quiz.subject}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {quiz.duration} mins
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
              {/* FLEX-GROW pushes the button to the bottom */}
              <p className="text-gray-600 text-sm mb-6 flex-grow">{quiz.description}</p>
              
              <button
                onClick={() => onSelectQuiz(quiz.id)}
                className="w-full group flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors mt-auto"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Take Quiz
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizSelectionPage;
