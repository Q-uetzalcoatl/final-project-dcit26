import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const PasswordModal = ({ quiz, onSuccess, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check against the password stored in quizzes.js
    // quiz.password is now 'dcit' (Quiz 1) or 'cvsu' (Quiz 2)
    if (password === quiz.password) { 
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Enter Quiz Password</h3>
          <p className="text-sm text-gray-500">
            Please enter the access code for <b>{quiz.title}</b>.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Enter password..."
            className={`w-full p-3 border rounded-lg text-center text-lg tracking-widest mb-4 outline-none focus:ring-2 ${
              error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-emerald-200'
            }`}
            autoFocus
          />
          {error && <p className="text-red-500 text-xs text-center mb-4">Incorrect password. Try again.</p>}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Start Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
