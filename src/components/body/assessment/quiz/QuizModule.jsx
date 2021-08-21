import React, { useContext, useState, useEffect, useCallback } from "react";
import QuizQuestion from "./QuizQuestion";
import { QuizContext } from "../../../../contexts/QuizContext";
import { UserContext } from "../../../../contexts/UserContext";
import { gql, useApolloClient, useMutation } from "@apollo/client";

const QuizModule = () => {
  const [activeQuizID] = useContext(QuizContext).active;
  const [username] = useContext(UserContext).username;
  const [questions, setQuestions] = useState([]);

  const [successfulSubmit, setSuccessfulSubmit] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(true);
  const [variant, setVariant] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const client = useApolloClient();
  let question_num = 0;

  const getQuestions = useCallback(() => {
    username !== null &&
      client
        .query({
          fetchPolicy: "network-only",
          query: gql`
          query GetQuestions {
            getQuestions(username: "${username}", token: "${localStorage.getItem("accessToken")}", assessmentId: "${activeQuizID}") {
              id
              questionText
              selectedAnswer
              correctAnswer
              processes
              blocks
              assessment {
                submitted
                variant
                score
              }
              answer {
                answers
              }
            }
          }
        `,
        })
        .then((result) => {
          if (result.data.getQuestions) {
            setQuestions(result.data.getQuestions);
            setIsSubmitted(result.data.getQuestions[0].assessment.submitted);
            setVariant(result.data.getQuestions[0].assessment.variant);
            setScore(result.data.getQuestions[0].assessment.score);
            setLoading(false);
          }
        });
  }, [activeQuizID, client, username]);

  const [submitAssessment] = useMutation(gql`
    mutation SubmitAssessment($id: ID!, $username: String!, $token: String!) {
      submitAssessment(id: $id, username: $username, token: $token) {
        assessment {
          submitted
        }
      }
    }
  `);

  useEffect(() => {
    getQuestions();
  }, [username, getQuestions]);

  return (
    !loading && (
      <div className="tile is-parent is-vertical is-12 container">
        <p className="title mb-0">
          <span>{variant}</span>
          {isSubmitted && (
            <span className="is-pulled-right is-hidden-touch is-hidden-mobile">
              Score: {score}/{questions.length}
            </span>
          )}
        </p>
        {isSubmitted && (
          <p className="subtitle is-hidden-desktop mt-1">
            Score: {score}/{questions.length}
          </p>
        )}
        <hr className="is-divider mt-2"></hr>
        {questions.map((question) => {
          question_num++;
          return (
            <QuizQuestion
              key={`q-${question.id}`}
              questionNum={question_num}
              id={question.id}
              questionText={question.questionText}
              answers={JSON.parse(question.answer.answers)}
              processes={JSON.parse(question.processes)}
              blocks={JSON.parse(question.blocks)}
              selectedAnswer={JSON.parse(question.selectedAnswer)}
              correctAnswer={isSubmitted && JSON.parse(question.correctAnswer)}
              submitted={isSubmitted}
            />
          );
        })}
        {!isSubmitted && (
          <a
            className={`button is-primary`}
            href="/#"
            onClick={() => {
              submitAssessment({ variables: { id: activeQuizID, username: username, token: localStorage.getItem("accessToken") } }).then((result) =>
                result.data.submitAssessment.assessment.submitted ? (setSuccessfulSubmit(true), getQuestions()) : setSuccessfulSubmit(false)
              );
            }}
          >
            Submit
          </a>
        )}
        {successfulSubmit === true ? (
          <p className="has-text-success pt-4">Quiz successfully submitted and graded! Please scroll up to check your results.</p>
        ) : (
          successfulSubmit !== null && <p className="has-text-danger pt-4">Submission unsuccessful. Please try again!</p>
        )}
      </div>
    )
  );
};

export default QuizModule;
