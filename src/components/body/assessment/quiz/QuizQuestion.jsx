import React, { useContext } from "react";
import { UserContext } from "../../../../contexts/UserContext";
import { useMutation, gql } from "@apollo/client";

const QuizQuestion = ({ questionNum, questionText, answers, processes, blocks, id, selectedAnswer, submitted, correctAnswer }) => {
  const [username] = useContext(UserContext).username;

  const [setQuestionAnswer] = useMutation(gql`
    mutation SetQuestionAnswer($id: ID!, $answer: JSONString!, $username: String!, $token: String!) {
      setQuestionAnswer(id: $id, answer: $answer, username: $username, token: $token) {
        question {
          selectedAnswer
        }
      }
    }
  `);

  return (
    <div className="tile is-child box">
      <table border="0">
        <tbody>
          <tr>
            <td>
              <b>Q{questionNum}.&nbsp;</b>
            </td>
            <td className="pb-2">{questionText}</td>
          </tr>
          <tr>
            <td></td>
            <td>
              <table className="table is-bordered is-striped is-narrow mr-3 mb-4" style={{ float: "left" }}>
                <caption className="has-text-left pb-1">
                  <em>Processes</em>
                </caption>
                <thead>
                  <tr>
                    <td>
                      <b>Name</b>
                    </td>
                    {blocks ? (
                      <td>
                        <b>Size</b>
                      </td>
                    ) : (
                      <>
                        <td>
                          <b>Arrival Time</b>
                        </td>
                        <td>
                          <b>Burst Time</b>
                        </td>
                        {processes[0].priority !== null && (
                          <td>
                            <b>Priority</b>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {processes.map((process) => (
                    <tr key={`${questionNum}-${process.name}`}>
                      <td>
                        <b>{process.name}</b>
                      </td>
                      {blocks ? (
                        <td>{process.size}</td>
                      ) : (
                        <>
                          <td>{process.arrival_time === null ? "N/A" : process.arrival_time}</td>
                          <td>{process.burst_time}</td>
                          {process.priority !== null && <td>{process.priority}</td>}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {blocks && (
                <>
                  <table className="table is-bordered is-striped is-narrow mb-4" style={{ float: "left" }}>
                    <caption className="has-text-left pb-1">
                      <em>Blocks</em>
                    </caption>
                    <thead>
                      <tr>
                        <td>
                          <b>Name</b>
                        </td>
                        <td>
                          <b>Size</b>
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {blocks.map((block) => {
                        return (
                          <tr key={`${questionNum}-${block.name}`}>
                            <td>{block.name}</td>
                            <td>{block.size}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </td>

            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>
              <form>
                <div className="field">
                  <div className="control">
                    {answers &&
                      answers.map((answer) => (
                        <span key={`${questionNum}-ans${answers.indexOf(answer)}`}>
                          <label className="radio">
                            <input
                              type="radio"
                              name={`radiogroup${questionNum}`}
                              className={submitted ? "disabled" : ""}
                              defaultChecked={selectedAnswer && answer.name === selectedAnswer.name ? true : false}
                              onClick={() => {
                                setQuestionAnswer({ variables: { id: id, answer: JSON.stringify(answer), username: username, token: localStorage.getItem("accessToken") } });
                              }}
                              disabled={submitted ? true : false}
                            />
                            &nbsp;
                            {
                              <>
                                <b>{answer.name}</b> -{" "}
                                {blocks
                                  ? `\tSize: ${answer.size}`
                                  : `\tArrival Time: ${answer.arrival_time === null ? "N/A" : answer.arrival_time}, Burst Time: ${answer.burst_time}${
                                      answer.priority === null ? "" : ", Priority:" + answer.priority
                                    }`}
                              </>
                            }
                          </label>
                          <br />
                        </span>
                      ))}
                    {submitted &&
                      (selectedAnswer && selectedAnswer.name === correctAnswer.name ? (
                        <article className="message is-success my-4">
                          <div className="message-body p-3">That's the correct answer!</div>
                        </article>
                      ) : (
                        <article className="message is-danger my-4">
                          <div className="message-body p-3">
                            Incorrect. The correct answer is <b>{correctAnswer.name}</b>.
                          </div>
                        </article>
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
