import React, { useContext, useEffect } from "react";
import { QuizContext } from "../../../../contexts/QuizContext";

const QuizQuestion = ({ questionNum, questionText, answers }) => {
  const [quizAnswers, setQuizAnswers] = useContext(QuizContext).answers;

  return (
    <div className="tile is-child box">
      <table border="0">
        <tbody>
          <tr>
            <td>Q{questionNum}.</td>
            <td>{questionText}</td>
          </tr>
          <tr>
            <td></td>
            <td>
              <form className="mt-4">
                <div className="field">
                  <div className="control">
                    {answers &&
                      answers.map((answer) => (
                        <span key={`${questionNum}-${answers.indexOf(answer)}`}>
                          <label className="radio">
                            <input
                              type="radio"
                              name={`radiogroup${questionNum}`}
                              onClick={() =>
                                setQuizAnswers((quizAnswers) => {
                                  return [...quizAnswers.slice(0, questionNum - 1), answers.indexOf(answer), ...quizAnswers.slice(questionNum, questionNum.length)];
                                })
                              }
                            />
                            &nbsp;{answer}
                          </label>
                          <br />
                        </span>
                      ))}
                  </div>
                </div>
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default QuizQuestion;
