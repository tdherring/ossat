import React, { useContext, useState, useEffect, useCallback } from "react";
import GeneralQuizOption from "./GeneralQuizOption";
import { PageContext } from "../../../../contexts/PageContext";
import { UserContext } from "../../../../contexts/UserContext";
import { QuizContext } from "../../../../contexts/QuizContext";
import { gql, useApolloClient } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";

const AssessmentLandingPage = () => {
  const [, setActivePage] = useContext(PageContext);
  const [, setActiveQuizID] = useContext(QuizContext).active;
  const [username] = useContext(UserContext).username;

  const [assessments, setAssessments] = useState({});
  const [initialAssessmentID, setInitialAssessmentID] = useState(null);
  const [loading, setLoading] = useState(true);

  const client = useApolloClient();

  const getAssessments = useCallback(
    (variant = null) => {
      username !== null &&
        client
          .query({
            fetchPolicy: "network-only",
            query: gql`
              query GetAssessments {
                getAssessments(username: "${username}", token: "${localStorage.getItem("accessToken")}"${variant ? ', variant: "' + variant + '"' : ""}) {
                  id
                  variant
                  score
                  submitted
                  questionSet {
                    id
                  }
                }
              }
            `,
          })
          .then((result) => {
            if (result.data.getAssessments.length > 0) {
              setAssessments(result.data.getAssessments);
              if (variant === "Initial Assessment") {
                console.log(result.data.getAssessments);
                setInitialAssessmentID(result.data.getAssessments[0].id);
                setActiveQuizID(result.data.getAssessments[0].id);
              } else {
                setLoading(false);
              }
            }
          });
    },
    [client, username]
  );

  useEffect(() => {
    getAssessments("Initial Assessment");
    getAssessments();
  }, [username, getAssessments]);

  return (
    !loading &&
    (Object.keys(assessments).length === 0 ? (
      <div className="tile is-vertical is-parent is-12 container">
        <div className="tile is-child box">
          <h5 className="is-size-5">Account Activation Required</h5>
          <hr className="is-divider mt-2" />
          <p>To gain access to the assessments section, you must first activate your account. Please check your inbox.</p>
        </div>
      </div>
    ) : (
      <div className="tile is-vertical is-parent is-12 container">
        <div className="tile is-child box">
          <h5 className="is-size-5">Initial Assessment</h5>
          <hr className="is-divider mt-2" />
          <p>
            Before we can generate assessments which are best suited to you, you have to complete the <strong>initial quiz</strong>. Click the button below to begin.
          </p>
          <button
            className="button is-primary mt-4"
            href="/#"
            onClick={() => {
              localStorage.setItem("activeQuizID", initialAssessmentID);
              setActivePage("quiz");
            }}
          >
            <FontAwesomeIcon icon={faBook} className="mr-2" />
            Take Initial Quiz
          </button>
        </div>
        <div className="tile is-child box">
          <div className="columns is-vcentered">
            <div className="column is-3">
              <h5 className="is-size-5">General Quizzes</h5>
            </div>
            <div className="column is-9 ">
              <progress className="progress is-info is-small" value={assessments.length > 0 && assessments.filter((assessment) => assessment.submitted).length} max={assessments.length - 2}></progress>
            </div>
          </div>

          <hr className="is-divider mt-2" />

          <table className="table is-fullwidth">
            <thead>
              <tr>
                <th>Quiz</th>
                <th className="has-text-centered">Completed</th>
                <th className="has-text-centered">Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(assessments).map((key) => {
                let assessment = assessments[key];
                let name = assessment.variant;
                let id = assessment.id;
                return (
                  name !== "Initial Assessment" && (
                    <GeneralQuizOption
                      key={`quiz-${id}`}
                      name={name}
                      memory={name.includes("Fit") ? true : false}
                      cpu={name.includes("Fit") ? false : true}
                      id={id}
                      completed={assessment.submitted}
                      score={assessment.score}
                      totalQs={assessment.questionSet.length}
                    />
                  )
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    ))
  );
};

export default AssessmentLandingPage;
