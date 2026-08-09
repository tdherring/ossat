import { Trash2 } from "lucide-react";

const statusStyles = {
  EXECUTING: "text-primary",
  FINISHED: "text-muted-foreground",
  WAITING: "text-muted-foreground",
} as const;

type ProcessStatusValue = keyof typeof statusStyles;
interface CPUProcessProps {
  name: string;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  priority?: number;
  showPriority: boolean;
  status: ProcessStatusValue;
  onDelete?: () => void;
}

const ProcessStatus = ({ status }: { status: ProcessStatusValue }) => (
  <span
    className={`inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusStyles[status]}`}
  >
    {status === "EXECUTING" && (
      <span className="h-1.5 w-1.5 animate-pulse bg-primary" aria-hidden="true" />
    )}
    {status.toLowerCase()}
  </span>
);

const DeleteProcessButton = ({ name, onDelete }: { name: string; onDelete: () => void }) => (
  <button
    type="button"
    className="inline-flex h-7 w-7 items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    aria-label={`Delete ${name}`}
    onClick={onDelete}
  >
    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
  </button>
);

const CPUProcess = ({
  name,
  arrivalTime,
  burstTime,
  remainingTime,
  priority,
  showPriority,
  status,
  onDelete,
}: CPUProcessProps) => {
  const columnCount = 5 + (showPriority ? 1 : 0) + (onDelete ? 1 : 0);
  const executingClass = status === "EXECUTING" ? "executing-process" : "";

  return (
    <>
      <tr className={`process-table__desktop-row ${executingClass}`}>
        <td className="min-w-[7rem] px-2 py-2 font-mono font-semibold text-foreground">{name}</td>
        <td className="px-2 py-2 font-mono tabular-nums">{arrivalTime}</td>
        <td className="px-2 py-2 font-mono tabular-nums">{burstTime}</td>
        <td className="px-2 py-2 font-mono tabular-nums">{remainingTime}</td>
        {showPriority && <td className="px-2 py-2 font-mono tabular-nums">{priority ?? "—"}</td>}
        <td className="px-2 py-2">
          <ProcessStatus status={status} />
        </td>
        {onDelete && (
          <td className="px-1 py-2 text-right">
            <DeleteProcessButton name={name} onDelete={onDelete} />
          </td>
        )}
      </tr>

      <tr className={`process-table__mobile-row ${executingClass}`}>
        <td colSpan={columnCount} className="px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <strong className="truncate font-mono text-sm text-foreground">{name}</strong>
            <div className="flex shrink-0 items-center gap-2">
              <ProcessStatus status={status} />
              {onDelete && <DeleteProcessButton name={name} onDelete={onDelete} />}
            </div>
          </div>
          <dl
            className={`mt-3 grid gap-x-4 gap-y-2 ${showPriority ? "grid-cols-2" : "grid-cols-3"}`}
          >
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Arrival
              </dt>
              <dd className="mt-0.5 font-mono text-xs tabular-nums">{arrivalTime}</dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Burst
              </dt>
              <dd className="mt-0.5 font-mono text-xs tabular-nums">{burstTime}</dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Remaining
              </dt>
              <dd className="mt-0.5 font-mono text-xs tabular-nums">{remainingTime}</dd>
            </div>
            {showPriority && (
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Priority
                </dt>
                <dd className="mt-0.5 font-mono text-xs tabular-nums">{priority ?? "—"}</dd>
              </div>
            )}
          </dl>
        </td>
      </tr>
    </>
  );
};

export default CPUProcess;
