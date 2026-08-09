import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import GeneralQuizOption from "../assessment/landing/GeneralQuizOption";
import type { ChartOptions, TooltipItem } from "chart.js";
import type { Assessment } from "../../../types/assessment";
import type { Organisation } from "../../../types/organisation";

const chartColor = (token: string, alpha = 1) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return `hsl(${value} / ${alpha})`;
};

const PerformanceData = ({
  organisations,
  isOrgCreator,
}: {
  organisations: Organisation[];
  isOrgCreator: boolean;
}) => {
  const [selectedOrg, setSelectedOrg] = useState(organisations[0]);
  const [selectedUser, setSelectedUser] = useState(organisations[0]?.members[0] ?? null);
  const [userAssessments, setUserAssessments] = useState<Assessment[]>([]);
  const [averageScores, setAverageScores] = useState<number[]>([]);
  const [variants, setVariants] = useState<string[]>([]);
  const [activeView, setActiveView] = useState("performance");
  const [, setThemeRevision] = useState(0);
  const client = useApolloClient();

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeRevision((value) => value + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setSelectedOrg(
      (current) => organisations.find(({ name }) => name === current?.name) ?? organisations[0],
    );
  }, [organisations]);

  useEffect(() => {
    setSelectedUser(selectedOrg?.members[0] ?? null);
  }, [selectedOrg]);

  useEffect(() => {
    if (!selectedUser) {
      setUserAssessments([]);
      setVariants([]);
      setAverageScores([]);
      return;
    }

    let cancelled = false;
    client
      .query<{ getAssessments: Assessment[] }>({
        fetchPolicy: "network-only",
        query: gql`
          query GetAssessments($username: String!, $token: String!) {
            getAssessments(username: $username, token: $token) {
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
          username: selectedUser.username,
          token: localStorage.getItem("accessToken") ?? "",
        },
      })
      .then((result) => {
        if (cancelled) return;
        const assessments = result.data?.getAssessments ?? [];
        const variantScores: Record<string, number[]> = {};
        setUserAssessments(assessments);

        assessments.forEach((item) => {
          if (
            !item.submitted ||
            item.score === null ||
            ["Initial Assessment", "Generated Assessment"].includes(item.variant)
          )
            return;
          const variant = item.variant.split(" I")[0];
          if (!variantScores[variant]) variantScores[variant] = [];
          variantScores[variant].push((item.score / Math.max(item.questionSet.length, 1)) * 100);
        });

        setVariants(Object.keys(variantScores));
        setAverageScores(
          Object.values(variantScores).map(
            (scores) => scores.reduce((sum, score) => sum + score, 0) / scores.length,
          ),
        );
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Could not load assessment performance.", error);
        setUserAssessments([]);
        setVariants([]);
        setAverageScores([]);
      });
    return () => {
      cancelled = true;
    };
  }, [client, selectedUser]);

  const generalAssessments = userAssessments.filter(
    ({ variant }) => !["Initial Assessment", "Generated Assessment"].includes(variant),
  );
  const completedAssessments = generalAssessments.filter(({ submitted }) => submitted);
  const overallAverage = completedAssessments.length
    ? Math.round(
        completedAssessments.reduce(
          (total, item) => total + (item.score / Math.max(item.questionSet.length, 1)) * 100,
          0,
        ) / completedAssessments.length,
      )
    : 0;

  const chartData = {
    labels: variants,
    datasets: [
      {
        label: "Average score",
        data: averageScores,
        backgroundColor: chartColor("--primary", 0.24),
        borderColor: chartColor("--primary"),
        borderWidth: 1,
        borderRadius: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: {
          label: ({ parsed }: TooltipItem<"bar">) => `${Math.round(parsed.y ?? 0)}% average`,
        },
      },
    },
    scales: {
      x: {
        border: { color: chartColor("--border") },
        grid: { display: false },
        ticks: { color: chartColor("--muted-foreground"), font: { family: "monospace", size: 11 } },
      },
      y: {
        beginAtZero: true,
        max: 100,
        border: { color: chartColor("--border") },
        grid: { color: chartColor("--border", 0.55) },
        ticks: {
          color: chartColor("--muted-foreground"),
          callback: (value) => `${value}%`,
          stepSize: 25,
        },
      },
    },
  };

  return (
    <section className="min-w-0" aria-labelledby="performance-heading">
      <div className="flex flex-col gap-5 border-b pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="performance-heading" className="text-lg font-semibold">
              Performance
            </h2>
            {selectedUser && (
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedUser.firstName} {selectedUser.lastName} · @{selectedUser.username}
              </p>
            )}
          </div>
          <div className="flex gap-6 font-mono text-sm">
            <span>
              <strong className="text-lg text-foreground">{completedAssessments.length}</strong>
              <small className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                Attempts
              </small>
            </span>
            <span>
              <strong className="text-lg text-foreground">{overallAverage}%</strong>
              <small className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                Average
              </small>
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold" htmlFor="performance-organisation">
            Learning group
            <span className="select is-fullwidth mt-2">
              <select
                id="performance-organisation"
                className="font-normal"
                value={organisations.indexOf(selectedOrg)}
                onChange={(event) =>
                  setSelectedOrg(organisations[Number(event.currentTarget.value)])
                }
                disabled={!isOrgCreator}
              >
                {organisations.map((org, index) => (
                  <option key={org.name} value={index}>
                    {org.name}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="block text-sm font-semibold" htmlFor="performance-user">
            Student
            <span className="select is-fullwidth mt-2">
              <select
                id="performance-user"
                className="font-normal"
                value={selectedOrg?.members.indexOf(selectedUser) ?? -1}
                onChange={(event) =>
                  setSelectedUser(selectedOrg.members[Number(event.currentTarget.value)])
                }
                disabled={!selectedOrg?.members.length}
              >
                {selectedOrg?.members.map((member, index) => (
                  <option key={member.username} value={index}>
                    {member.firstName && member.lastName
                      ? `${member.firstName} ${member.lastName}`
                      : member.username}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-1 border-b pt-4" role="tablist" aria-label="Performance view">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === "performance"}
          className={`border-b-2 px-3 py-2 text-sm font-semibold ${activeView === "performance" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveView("performance")}
        >
          Average performance
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === "attempts"}
          className={`border-b-2 px-3 py-2 text-sm font-semibold ${activeView === "attempts" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveView("attempts")}
        >
          Quiz attempts
        </button>
      </div>

      {selectedUser ? (
        activeView === "performance" ? (
          <div className="h-[300px] pt-6">
            <Bar options={chartOptions} data={chartData} />
          </div>
        ) : (
          <div className="table-container pt-4">
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
                    readOnly
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          This learning group has no students.
        </div>
      )}
    </section>
  );
};

export default PerformanceData;
