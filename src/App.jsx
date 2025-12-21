import React from 'react';
import { QuizProvider, useQuiz } from './context/QuizContext';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';

function QuizContent() {
  const { state } = useQuiz();
  return state.showResults ? <ResultScreen /> : <QuizScreen />;
}

function App() {
  return (
    <QuizProvider>
      <QuizContent />
    </QuizProvider>
  );
}
export default App;
