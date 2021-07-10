import React from "react";
import GeneralQuizOption from "./GeneralQuizOption";

const AssessmentLandingPage = () => {
  return (
    <div className="tile is-vertical is-parent is-12 container">
      <div className="tile is-child box">
        <h5 className="is-size-5">Initial Assessment</h5>
        <hr className="is-divider mt-2" />
        <p>
          Before we can generate assessments which are best suited to you, you have to complete the <strong>initial quiz</strong>. Click the button below to begin.
        </p>
        <button className="button is-primary mt-4" href="/#">
          Take Initial Quiz
        </button>
      </div>
      <div className="tile is-child box">
        <div className="columns is-vcentered">
          <div className="column is-3">
            <h5 className="is-size-5">General Quizes</h5>
          </div>
          <div className="column is-9 ">
            <progress className="progress is-info is-small" value="45" max="100">
              45%
            </progress>
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
            <GeneralQuizOption name="FCFS I" cpu />
            <GeneralQuizOption name="SJF I" cpu />
            <GeneralQuizOption name="Priority I" cpu completed />
            <GeneralQuizOption name="RR I" cpu />
            <GeneralQuizOption name="SRTF I" cpu />
            <GeneralQuizOption name="First Fit I" memory completed />
            <GeneralQuizOption name="Best Fit I" memory completed />
            <GeneralQuizOption name="Worst Fit I" memory />
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssessmentLandingPage;
