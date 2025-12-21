import React, { createContext, useContext, useReducer } from 'react';
import { questions } from '../data/questions';

const initialState = {
  score: 0,
  currentQuestionIndex: 0,
  showResults: false,
  userAnswers: []
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'ANSWER_QUESTION': {
      const isCorrect = action.payload.selectedAnswer === action.payload.correctAnswer;
      const newScore = isCorrect ? state.score + 1 : state.score;
      const nextIndex = state.currentQuestionIndex + 1;
      const isLastQuestion = nextIndex >= questions.length;

      return {
        ...state,
        score: newScore,
        currentQuestionIndex: nextIndex,
        showResults: isLastQuestion,
        userAnswers: [...state.userAnswers, action.payload.selectedAnswer]
      };
    }
    case 'RESTART': return initialState;
    default: return state;
  }
}

const QuizContext = createContext();

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) { throw new Error('useQuiz must be used within QuizProvider'); }
  return context;
}
