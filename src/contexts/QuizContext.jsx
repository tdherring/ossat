import React, { createContext, useState } from "react";

export const QuizContext = createContext();

export const QuizProvider = (props) => {
  const [quizAnswers, setQuizAnswers] = useState([...new Array(10).fill(null)]);

  return <QuizContext.Provider value={{ answers: [quizAnswers, setQuizAnswers] }}>{props.children}</QuizContext.Provider>;
};
