import React from "react";
import QuizQuestion from "./QuizQuestion";
import { QuizProvider } from "../../../../contexts/QuizContext";

const QuizModule = () => {
  return (
    <QuizProvider>
      <div className="tile is-parent is-vertical is-12 container">
        <QuizQuestion questionNum="1" questionText="This is what a question will look like..." answers={[1, 2, 3, 4, 5]} />
        <QuizQuestion questionNum="2" />
        <QuizQuestion questionNum="3" />
        <QuizQuestion questionNum="4" />
        <QuizQuestion questionNum="5" />
        <QuizQuestion questionNum="6" />
        <QuizQuestion questionNum="7" />
        <QuizQuestion questionNum="8" />
        <QuizQuestion questionNum="9" />
        <QuizQuestion questionNum="10" />
      </div>
    </QuizProvider>
  );
};

export default QuizModule;
