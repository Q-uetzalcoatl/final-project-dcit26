import React, { useState, useEffect } from 'react';
// Import icon components used in the UI from lucide-react
import { Users, FileCheck, RefreshCw, Clock, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  // `results` holds the list of submission objects; `setResults` updates it
  const [results, setResults] = useState([]);

  // Load stored results once when the component mounts
  useEffect(() => {
    loadResults();
  }, []);

  // Read saved submissions from localStorage and update state
  const loadResults = () => {
    const data = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
    setResults(data);
  };

  // Mark every result as released, persist to localStorage, and update UI
  const releaseAll = () => {
    const updated = results.map(r => ({ ...r, released: true }));
    localStorage.setItem('cvsu_db_results', JSON.stringify(updated));
    setResults(updated);
    alert("All currently submitted scores have been released to students.");
  };

  return (
    <div className="w-full max-w-6xl">
      {/* Header: title, description and action buttons */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h2>
          <p className="text-emerald-700">Manage student submissions and release grades.</p>
        </div>
        <div className="flex gap-3">
          {/* Refresh button reads the latest data from localStorage */}
          <button onClick={loadResults} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {/* Release All sets every submission's `released` flag to true */}
          <button onClick={releaseAll} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-md">
            <FileCheck className="w-4 h-4" /> Release All Scores
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* KPI card: total unique students */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              {/* Count unique student names using a Set */}
              <p className="text-2xl font-bold">{new Set(results.map(r => r.studentName)).size}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg"><FileCheck className="w-6 h-6 text-green-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Submissions</p>
              {/* Total number of submissions */}
              <p className="text-2xl font-bold">{results.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          {/* Table header for submission list */}
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Student Name</th>
              <th className="p-4 font-semibold text-gray-600">Quiz ID</th>
              <th className="p-4 font-semibold text-gray-600">Score</th>
              <th className="p-4 font-semibold text-gray-600">Time Spent</th>
              <th className="p-4 font-semibold text-gray-600">Violations</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          {/* Table body: render either a placeholder or a row per result */}
          <tbody className="divide-y">
            {results.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No submissions yet.</td></tr>
            ) : (
              results.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {/* Student name and quiz identifier */}
                  <td className="p-4 font-medium">{r.studentName}</td>
                  <td className="p-4 text-gray-500">Quiz #{r.quizId}</td>
                  {/* Score display (score / total) */}
                  <td className="p-4 font-bold text-emerald-600">{r.score} / {r.total}</td>
                  {/* Time spent: show clock icon and fallback to 'N/A' */}
                  <td className="p-4 text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {r.timeSpent || 'N/A'}
                  </td>
                  <td className="p-4">
                    {/* If violations exist, show a red badge; otherwise a dash */}
                    {r.violations > 0 ? (
                      <span className="text-red-600 font-bold flex items-center gap-1 text-xs bg-red-50 px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3" /> {r.violations}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {/* Status pill depends on `released` boolean */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.released ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {r.released ? 'Released' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
