import React, { useContext, useState, useEffect } from "react";
import GeneralQuizOption from "./GeneralQuizOption";
import { PageContext } from "../../../../contexts/PageContext";
import { UserContext } from "../../../../contexts/UserContext";
import { useMutation, gql, useApolloClient } from "@apollo/client";

const AssessmentLandingPage = () => {
  const [, setActivePage] = useContext(PageContext);
  const [username] = useContext(UserContext).username;

  const [assessments, setAssessments] = useState({});

  const client = useApolloClient();

  const getAssessments = () => {
    username !== null &&
      client
        .query({
          query: gql`
          query GetAssessments {
            getAssessments(username: "${username}", token: "${localStorage.getItem("accessToken")}") {
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
          if (result.data.getAssessments) {
            setAssessments(result.data.getAssessments);
          }
        });
  };

  useEffect(() => getAssessments(), [username]);

  return (
    <div className="tile is-vertical is-parent is-12 container">
      <div className="tile is-child box">
        <h5 className="is-size-5">Initial Assessment</h5>
        <hr className="is-divider mt-2" />
        <p>
          Before we can generate assessments which are best suited to you, you have to complete the <strong>initial quiz</strong>. Click the button below to begin.
        </p>
        <button className="button is-primary mt-4" href="/#" onClick={() => setActivePage("quiz")}>
          Take Initial Quiz
        </button>
      </div>
      <div className="tile is-child box">
        <div className="columns is-vcentered">
          <div className="column is-3">
            <h5 className="is-size-5">General Quizzes</h5>
          </div>
          <div className="column is-9 ">
            <progress className="progress is-info is-small" value={assessments.length > 0 && assessments.filter((assessment) => assessment.submitted).length} max={assessments.length}></progress>
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
              let name = assessment.variant.replaceAll("_", " ");
              let id = assessment.id;
              return (
                <GeneralQuizOption
                  key={`quiz-${id}`}
                  name={name}
                  memory={name.includes("FIT") ? true : false}
                  cpu={name.includes("FIT") ? false : true}
                  id={id}
                  completed={assessment.submitted}
                  score={assessment.score}
                  totalQs={assessment.questionSet.length}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssessmentLandingPage;
