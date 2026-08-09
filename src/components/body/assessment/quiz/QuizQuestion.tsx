import { useContext, useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { UserContext } from "../../../../contexts/UserContext";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import type { QuizBlock, QuizProcess } from "../../../../types/assessment";

const ProcessTable = ({ processes, memory }: { processes: QuizProcess[]; memory: boolean }) => {
  const hasPriority = !memory && processes.some((process) => process.priority != null);
  return (
    <div className="table-container border-t">
      <table className="table table-fixed w-full text-xs">
        <thead>
          <tr>
            <th className="px-2">Process</th>
            {memory ? (
              <th className="px-2 text-right">Size</th>
            ) : (
              <>
                <th className="px-2 text-right">Arrival</th>
                <th className="px-2 text-right">Burst</th>
                {hasPriority && <th className="px-2 text-right">Priority</th>}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {processes.map((process) => (
            <tr key={process.name}>
              <td className="px-2 py-2 font-mono font-semibold">{process.name}</td>
              {memory ? (
                <td className="px-2 py-2 text-right font-mono">{process.size}</td>
              ) : (
                <>
                  <td className="px-2 py-2 text-right font-mono">{process.arrival_time ?? "—"}</td>
                  <td className="px-2 py-2 text-right font-mono">{process.burst_time}</td>
                  {hasPriority && (
                    <td className="px-2 py-2 text-right font-mono">{process.priority ?? "—"}</td>
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BlockTable = ({ blocks }: { blocks: QuizBlock[] }) => (
  <div className="table-container border-t">
    <table className="table w-full text-xs">
      <thead>
        <tr>
          <th className="px-2">Block</th>
          <th className="px-2 text-right">Size</th>
        </tr>
      </thead>
      <tbody>
        {blocks.map((block) => (
          <tr key={block.name}>
            <td className="px-2 py-2 font-mono font-semibold">{block.name}</td>
            <td className="px-2 py-2 text-right font-mono">{block.size}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const answerSummary = (answer: QuizProcess, memory: boolean) =>
  memory
    ? `Size ${answer.size}`
    : `Arrival ${answer.arrival_time ?? "—"} · Burst ${answer.burst_time}${answer.priority == null ? "" : ` · Priority ${answer.priority}`}`;

interface QuizQuestionProps {
  questionNum: number;
  questionText: string;
  answers: QuizProcess[];
  processes: QuizProcess[];
  blocks: QuizBlock[] | null;
  id: string;
  selectedAnswer: QuizProcess | null;
  submitted: boolean;
  correctAnswer: QuizProcess | null;
  readOnly?: boolean;
}

const QuizQuestion = ({
  questionNum,
  questionText,
  answers,
  processes,
  blocks,
  id,
  selectedAnswer,
  submitted,
  correctAnswer,
  readOnly = false,
}: QuizQuestionProps) => {
  const [username] = useContext(UserContext).username;
  const isReadOnly = submitted || readOnly;
  const isMemoryQuestion = Boolean(blocks);
  const [currentAnswer, setCurrentAnswer] = useState(selectedAnswer);
  const isCorrect =
    submitted && currentAnswer?.name !== undefined && currentAnswer.name === correctAnswer?.name;

  useEffect(() => setCurrentAnswer(selectedAnswer), [selectedAnswer]);

  const [setQuestionAnswer] = useMutation<
    { setQuestionAnswer: { question: { selectedAnswer: string } } },
    { id: string; answer: string; username: string; token: string }
  >(gql`
    mutation SetQuestionAnswer(
      $id: ID!
      $answer: JSONString!
      $username: String!
      $token: String!
    ) {
      setQuestionAnswer(id: $id, answer: $answer, username: $username, token: $token) {
        question {
          selectedAnswer
        }
      }
    }
  `);

  return (
    <section className="py-7" aria-labelledby={`question-${id}`}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.75fr)]">
        <div>
          <div className="flex gap-3">
            <span className="font-mono text-sm text-primary">
              {String(questionNum).padStart(2, "0")}
            </span>
            <h2 id={`question-${id}`} className="text-base font-semibold leading-6">
              {questionText}
            </h2>
          </div>
          <div className={`mt-5 grid gap-4 ${blocks ? "sm:grid-cols-2" : ""}`}>
            <ProcessTable processes={processes} memory={isMemoryQuestion} />
            {blocks && <BlockTable blocks={blocks} />}
          </div>
        </div>

        <div className="lg:border-l lg:pl-6">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Answer
          </span>
          <div className="mt-3 grid gap-2">
            {answers?.map((answer) => {
              const selected = currentAnswer?.name === answer.name;
              const correct = submitted && correctAnswer?.name === answer.name;
              return (
                <label
                  key={answer.name}
                  className={`flex cursor-pointer items-start gap-3 rounded-[3px] border px-3 py-2.5 text-sm transition-colors ${selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"} ${isReadOnly ? "cursor-default" : ""}`}
                >
                  <input
                    type="radio"
                    name={`question-${id}`}
                    className="mt-1 accent-[hsl(var(--primary))]"
                    checked={selected}
                    onChange={() => {
                      const previousAnswer = currentAnswer;
                      setCurrentAnswer(answer);
                      setQuestionAnswer({
                        variables: {
                          id,
                          answer: JSON.stringify(answer),
                          username: username ?? "",
                          token: localStorage.getItem("accessToken") ?? "",
                        },
                      }).catch((error) => {
                        console.error("Could not save the selected answer.", error);
                        setCurrentAnswer(previousAnswer);
                      });
                    }}
                    disabled={isReadOnly}
                  />
                  <span className="min-w-0 flex-1">
                    <strong className="font-mono">{answer.name}</strong>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {answerSummary(answer, isMemoryQuestion)}
                    </span>
                  </span>
                  {correct && (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-label="Correct answer"
                    />
                  )}
                </label>
              );
            })}
          </div>
          {submitted && (
            <div
              className={`mt-3 flex items-start gap-2 border-l-2 px-3 py-2 text-xs ${isCorrect ? "border-primary text-primary" : "border-destructive text-destructive"}`}
            >
              {isCorrect ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              <span>
                {isCorrect ? "Correct." : `Correct answer: ${correctAnswer?.name ?? "—"}.`}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default QuizQuestion;
