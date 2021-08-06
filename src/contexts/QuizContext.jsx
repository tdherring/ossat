import React, { createContext, useState } from "react";

export const QuizContext = createContext();

export const QuizProvider = (props) => {
  const [activeQuizID, setActiveQuizID] = useState(localStorage.getItem("activeQuizID"));

  return <QuizContext.Provider value={{ active: [activeQuizID, setActiveQuizID] }}>{props.children}</QuizContext.Provider>;
};
