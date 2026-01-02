import React, { useState, useEffect } from 'react';
import { Users, FileCheck, RefreshCw, Clock, AlertTriangle } from 'lucide-react';

/**
 * ADMIN DASHBOARD COMPONENT
 * Provides the instructor with a high-level view of all submissions.
 * Features:
 * 1. Summary Cards (Total Students, Submissions)
 * 2. Detailed Table (Scores, Time Spent, Violation Tracking)
 * 3. Bulk Action (Release All Scores)
 */
const AdminDashboard = () => {
  const [results, setResults] = useState([]);

  // Load results on mount
  useEffect(() => {
    loadResults();
  }, []);

  // Reads from LocalStorage to simulate backend database fetch
  const loadResults = () => {
    const data = JSON.parse(localStorage.getItem('cvsu_db_results') || '[]');
    setResults(data);
  };

  // BULK ACTION: Updates the 'released' flag for ALL submissions
  const releaseAll = () => {
    const updated = results.map(r => ({ ...r, released: true }));
    localStorage.setItem('cvsu_db_results', JSON.stringify(updated));
    setResults(updated);
    alert("All currently submitted scores have been released to students.");
  };

  return (
    <div className="w-full max-w-6xl">
      {/* DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h2>
          <p className="text-emerald-700">Manage student submissions and release grades.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadResults} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={releaseAll} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-md">
            <FileCheck className="w-4 h-4" /> Release All Scores
          </button>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              {/* Calculate unique students using Set */}
              <p className="text-2xl font-bold">{new Set(results.map(r => r.studentName)).size}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg"><FileCheck className="w-6 h-6 text-green-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Submissions</p>
              <p className="text-2xl font-bold">{results.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED RESULTS TABLE */}
      {/* We use a container with overflow hidden for rounded corners, and inner div for scrolling */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-emerald-100">
        
        {/* SCROLL WRAPPER: Allows horizontal scrolling on mobile */}
        <div className="overflow-x-auto">
          
          {/* TABLE: min-w-[800px] ensures it doesn't squish on small screens */}
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                {/* whitespace-nowrap prevents headers from breaking into two lines */}
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Student Name</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Quiz ID</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Score</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Time Spent</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Violations</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No submissions yet.</td></tr>
              ) : (
                results.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-medium whitespace-nowrap">{r.studentName}</td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">Quiz #{r.quizId}</td>
                    <td className="p-4 font-bold text-emerald-600 whitespace-nowrap">{r.score} / {r.total}</td>
                    <td className="p-4 text-sm text-gray-600 flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3 h-3" /> {r.timeSpent || 'N/A'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {/* LOGIC: Only show if violations is GREATER THAN 0 */}
                      {r.violations > 0 ? (
                        <span className="text-red-600 font-bold flex items-center gap-1 text-xs bg-red-50 px-2 py-1 rounded">
                          <AlertTriangle className="w-3 h-3" /> {r.violations}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
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
    </div>
  );
};

export default AdminDashboard;
