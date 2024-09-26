import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Spin, message, Table } from 'antd';
import 'antd/dist/reset.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [canAnswer, setCanAnswer] = useState(false); // Controls if the answer buttons are clickable
  const [timer, setTimer] = useState(30); // Countdown timer
  const [answers, setAnswers] = useState([]); // Store the user's answers
  const [quizFinished, setQuizFinished] = useState(false); // Track if quiz is finished
  const [quizStarted, setQuizStarted] = useState(false); // Track if the quiz has started

  useEffect(() => {
    // Fetch the data from the API
    axios.get('https://jsonplaceholder.typicode.com/posts?_limit=10')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(() => {
        message.error('Failed to fetch quiz data');
        setLoading(false);
      });
  }, []);

  // Timer effect for question lifecycle
  useEffect(() => {
    if (timer === 0) {
      handleNextQuestion(); // Move to the next question or finish the quiz
    }

    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    // Enable answering after 10 seconds
    if (timer === 20) {
      setCanAnswer(true);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const handleAnswerClick = (answer) => {
    if (canAnswer) {
      setSelectedAnswer(answer);
      message.success(`You selected: ${answer}`);
    }
  };

  const handleNextQuestion = () => {
    setAnswers([...answers, {
      questionNumber: currentQuestion + 1, // Add question number to answers
      question: data[currentQuestion]?.title,
      answer: selectedAnswer || 'No Answer',
    }]);
    setSelectedAnswer(null);
    setCanAnswer(false);
    setTimer(30);

    if (currentQuestion < data.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizFinished(true); // End the quiz
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimer(30); // Start timer for the first question
  };

  // Results table columns definition
  const columns = [
    {
      title: 'Question Number',
      dataIndex: 'questionNumber',
      key: 'questionNumber',
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: 'Your Answer',
      dataIndex: 'answer',
      key: 'answer',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Quiz Results</h1>
        <Table dataSource={answers} columns={columns} rowKey="questionNumber" />
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to the Quiz</h1>
        <div className="mb-6">
          <h2 className="text-xl font-bold">Quiz Rules</h2>
          <ul className="list-disc ml-5 mt-4">
            <li>Each question will stay on screen for 30 seconds.</li>
            <li>You can only select an answer after 10 seconds.</li>
            <li>Once you select an answer, you can change it until the 30-second timer ends.</li>
            <li>No going back to previous questions.</li>
            <li>Your results will be shown at the end of the quiz.</li>
          </ul>
        </div>
        <div className="text-center">
          <Button type="primary" size="large" onClick={startQuiz}>
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  const currentQuizData = data[currentQuestion];

  return (
    <div className="App max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Quiz App</h1>

      <div className="mb-6">
        <p className="text-lg font-semibold">Question {currentQuestion + 1} of {data.length}</p>
        <p className="text-lg font-semibold">{currentQuizData.title}</p>
        <p className="mt-2 text-gray-600">{currentQuizData.body}</p>
      </div>

      <div className="flex flex-col space-y-4 mb-6">
        {['A', 'B', 'C', 'D'].map((option, index) => (
          <Button
            key={index}
            type={selectedAnswer === option ? 'primary' : 'default'}
            className="w-full"
            onClick={() => handleAnswerClick(option)}
            disabled={!canAnswer} // Buttons disabled for the first 10 seconds
          >
            {`${option}. ${currentQuizData.body.split(' ')[index * 4] || 'Option'}`}
          </Button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <p>Time left: {timer} seconds</p>
        <Button
          type="primary"
          onClick={handleNextQuestion} // Move to the next question
          disabled={selectedAnswer === null}
        >
          {currentQuestion < data.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </div>
    </div>
  );
}

export default App;
