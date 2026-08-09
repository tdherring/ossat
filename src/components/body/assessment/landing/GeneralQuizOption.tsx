import { Check, Cpu, MemoryStick } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../../lib/routes";

interface GeneralQuizOptionProps {
  name: string;
  completed: boolean;
  cpu: boolean;
  memory: boolean;
  id: string;
  score: number;
  totalQs: number;
  readOnly?: boolean;
}

const GeneralQuizOption = ({
  name,
  completed,
  cpu,
  memory,
  id,
  score,
  totalQs,
  readOnly = false,
}: GeneralQuizOptionProps) => {
  const navigate = useNavigate();

  const openQuiz = () => {
    navigate(readOnly ? routes.learningGroupAssessment(id) : routes.assessment(id));
  };

  return (
    <>
      <tr className="group hidden sm:table-row">
        <td className="px-3 py-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 text-left text-sm font-semibold text-foreground hover:text-primary"
            onClick={openQuiz}
          >
            {cpu && (
              <Cpu
                className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary"
                strokeWidth={1.75}
              />
            )}
            {memory && (
              <MemoryStick
                className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary"
                strokeWidth={1.75}
              />
            )}
            <span>{name}</span>
          </button>
        </td>
        <td className="px-3 py-3 text-sm text-muted-foreground">
          {cpu ? "CPU scheduling" : "Memory allocation"}
        </td>
        <td className="px-3 py-3 text-center">
          {completed ? (
            <Check
              className="mx-auto h-4 w-4 text-primary"
              strokeWidth={2}
              aria-label="Completed"
            />
          ) : (
            <span className="text-xs text-muted-foreground">Not started</span>
          )}
        </td>
        <td className="px-3 py-3 text-right font-mono text-sm tabular-nums">
          {completed ? `${score}/${totalQs}` : "—"}
        </td>
      </tr>
      <tr className="group sm:hidden">
        <td colSpan={4} className="px-3 py-3">
          <button
            type="button"
            className="flex w-full items-start gap-3 text-left"
            onClick={openQuiz}
          >
            {cpu && (
              <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            )}
            {memory && (
              <MemoryStick
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
            )}
            <span className="min-w-0 flex-1">
              <strong className="block text-sm text-foreground">{name}</strong>
              <span className="mt-1 block text-xs text-muted-foreground">
                {cpu ? "CPU scheduling" : "Memory allocation"}
              </span>
            </span>
            <span className="shrink-0 text-right">
              {completed && (
                <Check className="ml-auto h-4 w-4 text-primary" aria-label="Completed" />
              )}
              <span className="mt-1 block font-mono text-xs">
                {completed ? `${score}/${totalQs}` : "—"}
              </span>
            </span>
          </button>
        </td>
      </tr>
    </>
  );
};

export default GeneralQuizOption;
