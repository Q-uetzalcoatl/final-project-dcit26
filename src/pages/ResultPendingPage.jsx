import React from 'react';
import { Hourglass, CheckCircle } from 'lucide-react';

/**
 * RESULT PENDING PAGE
 * Displays after a student submits an exam.
 * Shows "Waiting" status by default.
 * Shows "Score" only if the 'released' flag is set to true in the database.
 */
const ResultPendingPage = ({ studentName, quizId, onBack }) => {
  // DATA FETCHING
  // Retrieve all results to check the status of the current user's submission
  const allResults = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
  const myResult = allResults.find(r => r.studentName === studentName && r.quizId === quizId);
  
  // Check release status flag
  const isReleased = myResult && myResult.released;

  return (
    <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-10 text-center">
      
      {/* CONDITIONAL RENDER: Released vs Pending */}
      {isReleased ? (
        <>
          {/* STATE: SCORE RELEASED */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Score Released!</h2>
          <p className="text-gray-500 mb-8">You scored</p>
          <div className="text-6xl font-black text-emerald-600 mb-8">
            {myResult.score} <span className="text-2xl text-gray-400">/ {myResult.total}</span>
          </div>
        </>
      ) : (
        <>
          {/* STATE: WAITING FOR INSTRUCTOR */}
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Hourglass className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Successful</h2>
          <p className="text-gray-600 mb-8">
            Your exam has been submitted safely. Please wait for the instructor to release the results.
          </p>
        </>
      )}

      <button
        onClick={onBack}
        className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default ResultPendingPage;
