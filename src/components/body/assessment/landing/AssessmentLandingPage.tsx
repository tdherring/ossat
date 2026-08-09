import { useContext, useState, useEffect, useCallback } from "react";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import GeneralQuizOption from "./GeneralQuizOption";
import { UserContext } from "../../../../contexts/UserContext";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import Button from "../../../ui/Button";
import type { Assessment } from "../../../../types/assessment";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../../lib/routes";

const AssessmentLandingPage = () => {
  const navigate = useNavigate();
  const [username] = useContext(UserContext).username;
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [initialAssessmentID, setInitialAssessmentID] = useState<string | null>(null);
  const [generatedAssessmentID, setGeneratedAssessmentID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();

  const getAssessments = useCallback(
    (variant: string | null = null) => {
      if (username === null) return;
      client
        .query<{ getAssessments: Assessment[] }>({
          fetchPolicy: "network-only",
          query: gql`
            query GetAssessments($username: String!, $token: String!, $variant: String) {
              getAssessments(username: $username, token: $token, variant: $variant) {
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
          variables: {
            username,
            token: localStorage.getItem("accessToken") ?? "",
            variant,
          },
        })
        .then((result) => {
          const results = result.data?.getAssessments ?? [];
          if (variant === "Initial Assessment") {
            setInitialAssessmentID(results[0]?.id ?? null);
          } else if (variant === "Generated Assessment") {
            setGeneratedAssessmentID(results[0]?.id ?? null);
          } else {
            setAssessments(results);
            setLoading(false);
          }
        });
    },
    [client, username],
  );

  useEffect(() => {
    getAssessments("Initial Assessment");
    getAssessments("Generated Assessment");
    getAssessments();
  }, [username, getAssessments]);

  const generalAssessments = assessments.filter(
    ({ variant }) => !["Initial Assessment", "Generated Assessment"].includes(variant),
  );
  const completedCount = generalAssessments.filter(({ submitted }) => submitted).length;
  const featuredID = generatedAssessmentID ?? initialAssessmentID;
  const featuredName = generatedAssessmentID ? "Generated Assessment" : "Initial Assessment";

  const openFeaturedAssessment = () => {
    if (!featuredID) return;
    navigate(routes.assessment(featuredID));
  };

  if (loading)
    return (
      <div className="col-span-12 py-16 text-center text-sm text-muted-foreground">
        Loading assessments…
      </div>
    );

  if (assessments.length === 0) {
    return (
      <section className="col-span-12 mx-auto w-full max-w-4xl border px-6 py-10">
        <h1 className="font-display text-4xl font-semibold tracking-wide">Assessments</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Activate your account to access assessment material.
        </p>
      </section>
    );
  }

  return (
    <div className="col-span-12 w-full">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            Assessments
          </h1>
        </div>
        <div className="font-mono text-sm text-muted-foreground">
          <strong className="text-foreground">{completedCount}</strong> /{" "}
          {generalAssessments.length} general quizzes complete
        </div>
      </header>

      <section className="grid gap-5 border-b py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.75} />
            <h2 className="text-lg font-semibold">{featuredName}</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {generatedAssessmentID
              ? "Review the assessment generated from your previous results."
              : "Complete the initial assessment to establish a starting point."}
          </p>
        </div>
        <Button
          onClick={openFeaturedAssessment}
          disabled={!featuredID}
          className="gap-2 md:min-w-44"
        >
          Open assessment <ArrowRight className="h-4 w-4" />
        </Button>
      </section>

      <section className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">General quizzes</h2>
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-primary" /> Completed
          </span>
        </div>
        <div
          className="mt-4 h-1 bg-muted"
          aria-label={`${completedCount} of ${generalAssessments.length} quizzes complete`}
        >
          <div
            className="h-full bg-primary transition-[width]"
            style={{
              width: `${generalAssessments.length ? (completedCount / generalAssessments.length) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="table-container mt-5 border-t">
          <table className="table w-full">
            <thead className="hidden sm:table-header-group">
              <tr>
                <th className="px-3">Quiz</th>
                <th className="px-3">Area</th>
                <th className="px-3 text-center">Status</th>
                <th className="px-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {generalAssessments.map((item) => (
                <GeneralQuizOption
                  key={item.id}
                  name={item.variant}
                  memory={item.variant.includes("Fit")}
                  cpu={!item.variant.includes("Fit")}
                  id={item.id}
                  completed={item.submitted}
                  score={item.score}
                  totalQs={item.questionSet.length}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AssessmentLandingPage;
