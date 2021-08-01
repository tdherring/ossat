import React, { createContext, useState, useEffect } from "react";

export const QuizContext = createContext();

export const QuizProvider = (props) => {
  const [quizAnswers, setQuizAnswers] = useState([...new Array(10).fill(null)]);
  const [activeQuizID, setActiveQuizID] = useState(localStorage.getItem("activeQuizID"));

  return <QuizContext.Provider value={{ answers: [quizAnswers, setQuizAnswers], active: [activeQuizID, setActiveQuizID] }}>{props.children}</QuizContext.Provider>;
};
