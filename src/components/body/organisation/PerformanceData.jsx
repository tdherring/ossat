import React, { useState, useEffect, useContext } from "react";
import { gql, useApolloClient } from "@apollo/client";
import GeneralQuizOption from "../assessment/landing/GeneralQuizOption";
import { Bar } from "react-chartjs-2";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ResizeContext } from "../../../contexts/ResizeContext";

const PerformanceData = ({ organisations, isOrgCreator }) => {
  const VIEWS = ["User Average Variant Performance", "User Quiz Data"];
  const BACKGROUND_COLOURS = [
    "rgba(255, 0, 0, 0.2)",
    "rgba(0, 200, 100, 0.2)",
    "rgba(255, 0, 255, 0.2)",
    "rgba(238, 130, 238, 0.2)",
    "rgba(106, 90, 205, 0.2)",
    "rgba(255, 165, 0, 0.2)",
    "rgba(0, 193, 255, 0.2)",
    "rgba(60, 179, 113, 0.2)",
    "rgba(255, 227, 0, 0.2)",
    "rgba(36, 72, 106, 0.2)",
  ];
  const BORDER_COLOURS = [
    "rgba(255, 0, 0, 1)",
    "rgba(0, 200, 100, 1)",
    "rgba(255, 0, 255, 1)",
    "rgba(238, 130, 238, 1)",
    "rgba(106, 90, 205, 1)",
    "rgba(255, 165, 0, 1)",
    "rgba(0, 193, 255, 1)",
    "rgba(60, 179, 113, 1)",
    "rgba(255, 227, 0, 1)",
    "rgba(36, 72, 106, 1)",
  ];

  const [selectedOrg, setSelectedOrg] = useState(organisations[0]);
  const [selectedUser, setSelectedUser] = useState(organisations[0] ? organisations[0].members[0] : null);
  const [userAssessments, setUserAssessments] = useState({});
  const [averageScores, setAverageScores] = useState([]);
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  const [variants, setVariants] = useState([]);
  const [width] = useContext(ResizeContext).width;

  const client = useApolloClient();

  const getAssessments = (username) => {
    username &&
      client
        .query({
          fetchPolicy: "network-only",
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
            setUserAssessments(result.data.getAssessments);
            setAverageScores([]);
            setVariants([]);

            let variantScores = {};

            for (let assessment of result.data.getAssessments) {
              let variant = assessment.variant;
              if (assessment.score && variant !== "Initial Assessment" && variant !== "Generated Assessment") {
                let generalVariant = variant.split(" I")[0];
                variantScores[generalVariant] ? variantScores[generalVariant].push(assessment.score) : (variantScores[generalVariant] = [assessment.score]);
              }
            }

            setVariants(Object.keys(variantScores));
            setAverageScores(Object.values(variantScores).map((variantScores) => variantScores.reduce((x, y) => x + y) / variantScores.length));
          }
        });
  };

  useEffect(() => {
    selectedUser && getAssessments(selectedUser.username);
    localStorage.setItem("readOnlyQuiz", true);
  }, [selectedUser]);

  useEffect(() => {
    setSelectedUser(selectedOrg ? selectedOrg.members[0] : null);
  }, [selectedOrg]);

  return (
    <div className="tile is-child box">
      <p className="title is-size-4">Performance Statistics</p>

      <hr className="is-divider mt-2 mb-4" />
      <div className="field is-horizontal">
        <div className="field-body">
          <div className="field">
            <label className="label">Organisation</label>
            {isOrgCreator ? (
              organisations[0] ? (
                <div className="select is-fullwidth">
                  <select
                    onChange={(event) => {
                      setSelectedOrg(organisations[event.target.value]);
                    }}
                  >
                    {organisations.map((org) => (
                      <option key={org.name} className="dropdown-item" value={organisations.indexOf(org)}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <h6 className="is-size-6 has-text-danger">Please create an Organisation.</h6>
              )
            ) : (
              <h6 className="is-size-6">{organisations[0].name}</h6>
            )}
          </div>
          <div className="field">
            {selectedOrg && (
              <>
                <label className="label">User</label>
                {selectedOrg.members.length > 0 ? (
                  <div className="select is-fullwidth">
                    <select
                      onChange={(event) => {
                        setSelectedUser(selectedOrg.members[event.target.value]);
                      }}
                    >
                      {selectedOrg.members.map((member) => (
                        <option key={member.username} className="dropdown-item" value={selectedOrg.members.indexOf(member)}>
                          {member.username} {member.firstName && member.lastName ? `(${member.firstName} ${member.lastName})` : "(N/A)"}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <h6 className="is-size-6 has-text-danger">Organisation has no members.</h6>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <hr className="is-divider" />
      <nav className="level">
        <div className="level-left">
          <div className="level-item">
            <p className="subtitle">
              <strong>{VIEWS[activeViewIndex]}</strong>
              <br />
              <span className="is-size-6 has-text-centered-mobile">
                {selectedUser && selectedUser.username}
                {selectedUser && selectedUser.lastName ? ` (${selectedUser.firstName} ${selectedUser.lastName})` : selectedUser && " (N/A)"}
              </span>
            </p>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <span className="control buttons is-grouped has-addons mb-0 is-pulled-right">
              <a
                className="button is-primary has-tooltip-arrow has-tooltip-left"
                href="/#"
                data-tooltip="Previous View"
                onClick={(event) => {
                  event.preventDefault();
                  activeViewIndex > 0 ? setActiveViewIndex(activeViewIndex - 1) : setActiveViewIndex(VIEWS.length - 1);
                }}
              >
                <FontAwesomeIcon icon={faAngleLeft} />
              </a>
              <a
                className="button is-primary has-tooltip-arrow has-tooltip-left"
                href="/#"
                data-tooltip="Next View"
                onClick={(event) => {
                  event.preventDefault();
                  activeViewIndex < VIEWS.length - 1 ? setActiveViewIndex(activeViewIndex + 1) : setActiveViewIndex(0);
                }}
              >
                <FontAwesomeIcon icon={faAngleRight} />
              </a>
            </span>
          </div>
        </div>
      </nav>
      {VIEWS[activeViewIndex] === "User Average Variant Performance" && selectedUser && (
        <div>
          <Bar
            options={{
              animation: { duration: 0 },
            }}
            style={width > 1408 ? { minWidth: "500px" } : width > 1216 ? { maxWidth: "1088px" } : width > 1023 ? { maxWidth: "896px" } : { maxWidth: width - 100 }}
            data={{
              labels: variants,
              datasets: [
                {
                  label: "Average Variant Score",
                  data: averageScores,
                  backgroundColor: BACKGROUND_COLOURS,
                  borderColor: BORDER_COLOURS,
                  borderWidth: 1,
                },
              ],
            }}
          />
        </div>
      )}
      {VIEWS[activeViewIndex] === "User Quiz Data" && selectedUser && (
        <table className="table is-fullwidth">
          <thead>
            <tr>
              <th>Quiz</th>
              <th className="has-text-centered">Completed</th>
              <th className="has-text-centered">Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(userAssessments).map((key) => {
              let assessment = userAssessments[key];
              let name = assessment.variant;
              let id = assessment.id;

              return (
                name !== "Initial Assessment" &&
                name !== "Generated Assessment" && (
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
      )}
      {!selectedUser && <h6 className="is-size-6 has-text-danger">Statistics unavailable.</h6>}
    </div>
  );
};

export default PerformanceData;
