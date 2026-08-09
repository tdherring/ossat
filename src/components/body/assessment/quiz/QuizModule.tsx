import { useContext, useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import QuizQuestion from "./QuizQuestion";
import { UserContext } from "../../../../contexts/UserContext";
import { gql } from "@apollo/client";
import { useApolloClient, useMutation } from "@apollo/client/react";
import Button from "../../../ui/Button";
import {
  parseJson,
  type QuizBlock,
  type QuizProcess,
  type QuizQuestionData,
} from "../../../../types/assessment";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "../../../../lib/routes";

const QuizModule = ({ readOnly = false }: { readOnly?: boolean }) => {
  const { assessmentId = "" } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [username] = useContext(UserContext).username;
  const [questions, setQuestions] = useState<QuizQuestionData[]>([]);
  const [successfulSubmit, setSuccessfulSubmit] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(true);
  const [variant, setVariant] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();

  const getQuestions = useCallback(() => {
    if (username === null) return;
    client
      .query<{ getQuestions: QuizQuestionData[] }>({
        fetchPolicy: "network-only",
        query: gql`
          query GetQuestions($username: String!, $token: String!, $assessmentId: ID!) {
            getQuestions(username: $username, token: $token, assessmentId: $assessmentId) {
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
        variables: {
          username,
          token: localStorage.getItem("accessToken") ?? "",
          assessmentId,
        },
      })
      .then((result) => {
        const results = result.data?.getQuestions ?? [];
        setQuestions(results);
        setIsSubmitted(results[0]?.assessment?.submitted ?? false);
        setVariant(results[0]?.assessment?.variant ?? "Assessment");
        setScore(results[0]?.assessment?.score ?? null);
        setLoading(false);
      })
      .catch(() => {
        setQuestions([]);
        setLoading(false);
      });
  }, [assessmentId, client, username]);

  const [submitAssessment, { loading: submitting }] = useMutation<
    { submitAssessment: { assessment: { submitted: boolean } } },
    { id: string; username: string; token: string }
  >(gql`
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

  if (loading)
    return (
      <div className="col-span-12 py-16 text-center text-sm text-muted-foreground">
        Loading assessment…
      </div>
    );

  const returnPath = readOnly ? routes.learningGroups : routes.assessments;

  return (
    <div className="col-span-12 w-full">
      <header className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => navigate(returnPath)}
          >
            <ArrowLeft className="h-4 w-4" />{" "}
            {readOnly ? "Back to learning groups" : "Back to assessments"}
          </button>
          <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            {variant}
          </h1>
        </div>
        {isSubmitted && (
          <div className="border-l-2 border-primary pl-4">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Score
            </span>
            <strong className="font-mono text-2xl font-semibold tabular-nums">
              {score}/{questions.length}
            </strong>
          </div>
        )}
      </header>

      <div className="divide-y">
        {questions.map((question, index) => (
          <QuizQuestion
            key={question.id}
            questionNum={index + 1}
            id={question.id}
            questionText={question.questionText}
            answers={parseJson<QuizProcess[]>(question.answer.answers)}
            processes={parseJson<QuizProcess[]>(question.processes)}
            blocks={parseJson<QuizBlock[] | null>(question.blocks)}
            selectedAnswer={parseJson<QuizProcess | null>(question.selectedAnswer)}
            correctAnswer={
              isSubmitted ? parseJson<QuizProcess | null>(question.correctAnswer) : null
            }
            submitted={isSubmitted}
            readOnly={readOnly}
          />
        ))}
      </div>

      {!isSubmitted && !readOnly && (
        <div className="flex items-center gap-4 border-t pt-6">
          <Button
            disabled={submitting}
            onClick={() =>
              submitAssessment({
                variables: {
                  id: assessmentId,
                  username: username ?? "",
                  token: localStorage.getItem("accessToken") ?? "",
                },
              })
                .then((result) =>
                  result.data?.submitAssessment.assessment.submitted
                    ? (setSuccessfulSubmit(true), getQuestions())
                    : setSuccessfulSubmit(false),
                )
                .catch(() => setSuccessfulSubmit(false))
            }
          >
            Submit assessment
          </Button>
          {successfulSubmit === false && (
            <p className="text-sm text-destructive">Submission failed. Please try again.</p>
          )}
        </div>
      )}
      {successfulSubmit === true && (
        <p className="border-l-2 border-primary pl-3 text-sm text-primary">
          Assessment submitted and graded.
        </p>
      )}
    </div>
  );
};

export default QuizModule;
