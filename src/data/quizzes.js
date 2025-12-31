export const QUIZZES = [
  {
    id: 1,
    title: "DCIT 26 Multiple Choice Quiz",
    subject: "DCIT 26",
    description: "Application Development and Emerging Technologies",
    duration: 20,
    password: "dcit", // Password for this quiz
    questions: [
      {
        id: 1,
        question: "What is the primary purpose of React?",
        options: ["Database Management", "Building User Interfaces", "Server-Side Logic", "Operating System"],
        correct: 1
      },
      {
        id: 2,
        question: "Which hook is used for handling side effects like data fetching?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correct: 1
      },
      {
        id: 3,
        question: "What syntax extension does React use to describe UI?",
        options: ["HTML", "XML", "JSX", "Java"],
        correct: 2
      },
      {
        id: 4,
        question: "Which command creates a new Vite project?",
        options: ["npm create vite@latest", "npm start react", "node install vite", "git clone vite"],
        correct: 0
      },
      {
        id: 5,
        question: "What is Tailwind CSS?",
        options: ["A JavaScript Framework", "A Database", "A Utility-First CSS Framework", "A Backend Server"],
        correct: 2
      },
      {
        id: 6,
        question: "Which hook is used to store and update values in a component?",
        options: ["useEffect", "useState", "useHistory", "useCallback"],
        correct: 1
      },
      {
        id: 7,
        question: "In React, what is a 'Component'?",
        options: ["A database table", "A reusable piece of UI", "A function that runs on the server", "A CSS file"],
        correct: 1
      },
      {
        id: 8,
        question: "What does SPA stand for in web development?",
        options: ["Single Page Application", "Standard Protocol API", "Simple Program Access", "Server Port Address"],
        correct: 0
      },
      {
        id: 9,
        question: "Which file usually contains the global styles for the app?",
        options: ["main.jsx", "App.jsx", "index.css", "package.json"],
        correct: 2
      },
      {
        id: 10,
        question: "What is the purpose of 'npm install'?",
        options: ["To run the server", "To delete the project", "To download dependencies listed in package.json", "To publish the website"],
        correct: 2
      }
    ]
  },
  {
    id: 2,
    title: "True or False IT Quiz",
    subject: "IT 101",
    description: "Introduction to Computing",
    duration: 15,
    password: "cvsu", // Password for this quiz
    questions: [
      {
        id: 1,
        question: "HTML is considered a programming language.",
        options: ["True", "False"],
        correct: 1
      },
      {
        id: 2,
        question: "The CPU is often referred to as the brain of the computer.",
        options: ["True", "False"],
        correct: 0
      },
      {
        id: 3,
        question: "RAM stores data permanently, even when the computer is turned off.",
        options: ["True", "False"],
        correct: 1
      },
      {
        id: 4,
        question: "SSD (Solid State Drive) is generally faster than a traditional HDD (Hard Disk Drive).",
        options: ["True", "False"],
        correct: 0
      },
      {
        id: 5,
        question: "1 Byte is equal to 8 Bits.",
        options: ["True", "False"],
        correct: 0
      },
      {
        id: 6,
        question: "Linux is an example of an open-source Operating System.",
        options: ["True", "False"],
        correct: 0
      },
      {
        id: 7,
        question: "HTTP is more secure than HTTPS.",
        options: ["True", "False"],
        correct: 1
      },
      {
        id: 8,
        question: "Python is a high-level programming language.",
        options: ["True", "False"],
        correct: 0
      },
      {
        id: 9,
        question: "A monitor is an Input device.",
        options: ["True", "False"],
        correct: 1
      },
      {
        id: 10,
        question: "Cloud computing requires an internet connection to access data.",
        options: ["True", "False"],
        correct: 0
      }
    ]
  }
];
