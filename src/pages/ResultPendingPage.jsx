import React from 'react';
// Import icons used in the status UI
import { Hourglass, CheckCircle } from 'lucide-react';

const ResultPendingPage = ({ studentName, quizId, onBack }) => {
  // Props: `studentName` and `quizId` identify the student's submission.
  // `onBack` is a callback to return to the previous screen.

  // Read all saved results from localStorage (fall back to empty array)
  const allResults = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
  // Find this student's specific result by matching name and quiz id
  const myResult = allResults.find(r => r.studentName === studentName && r.quizId === quizId);

  // `isReleased` is true when a matching result exists and its `released` flag is truthy
  const isReleased = myResult && myResult.released;

  return (
    <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-10 text-center">
      {/* If the instructor released the score, show the released view */}
      {isReleased ? (
        <>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Score Released!</h2>
          {/* Summary text and the numeric score */}
          <p className="text-gray-500 mb-8">You scored </p>
          <div className="text-6xl font-black text-emerald-600 mb-8">
            {/* Display score and total; assumes `myResult` exists when released */}
            {myResult.score} <span className="text-2xl text-gray-400">/ {myResult.total}</span>
          </div>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Hourglass className="w-10 h-10 text-amber-600" />
          </div>
          {/* Pending view: informs the student that submission was received */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Successful</h2>
          <p className="text-gray-600 mb-8">
            Your exam has been submitted safely. Please wait for the instructor to release the results.
          </p>
        </>
      )}

      {/* Back button uses the provided `onBack` callback */}
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
