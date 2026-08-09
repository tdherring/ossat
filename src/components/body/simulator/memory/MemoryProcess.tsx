import { useContext } from "react";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";
import type MemoryProcessData from "../../../../simulator/memory/memory_process";
import DeleteProcessButton from "../DeleteProcessButton";

type ProcessStatus = "Allocating" | "Allocated" | "No fit" | "Waiting";

const statusStyles: Record<ProcessStatus, string> = {
  Allocating: "text-primary",
  Allocated: "text-muted-foreground",
  "No fit": "text-destructive",
  Waiting: "text-muted-foreground",
};

const ProcessStatusLabel = ({ status }: { status: ProcessStatus }) => (
  <span
    className={`inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusStyles[status]}`}
  >
    {status === "Allocating" && (
      <span className="h-1.5 w-1.5 animate-pulse bg-primary" aria-hidden="true" />
    )}
    {status}
  </span>
);

const MemoryProcess = ({
  process,
  onDelete,
}: {
  process: MemoryProcessData;
  onDelete?: () => void;
}) => {
  const [timeDelta] = useContext(MemoryManagerContext).time;
  const [allocated] = useContext(MemoryManagerContext).allocated;
  const [blocks] = useContext(MemoryManagerContext).blocks;
  const processIndex = Object.keys(allocated).indexOf(process.name);
  const hasDecision = processIndex !== -1 && timeDelta > processIndex;
  const isAllocating = processIndex !== -1 && timeDelta === processIndex;
  const allocatedBlock = allocated[process.name];
  const blockIndex = hasDecision && allocatedBlock ? blocks.indexOf(allocatedBlock) : -1;
  const size = process.getSize ? process.getSize() : process.size;
  const placement = blockIndex >= 0 ? `Block ${blockIndex + 1}` : "—";

  let status: ProcessStatus = "Waiting";
  if (isAllocating) status = "Allocating";
  if (hasDecision) status = allocatedBlock ? "Allocated" : "No fit";

  const allocatingClass = isAllocating ? "executing-process" : "";

  return (
    <>
      <tr className={`process-table__desktop-row ${allocatingClass}`}>
        <td className="min-w-[9rem] px-2 py-2 font-mono font-semibold text-foreground">
          {process.name}
        </td>
        <td className="px-2 py-2 font-mono tabular-nums">{size}</td>
        <td className="px-2 py-2 font-mono text-muted-foreground">{placement}</td>
        <td className="relative px-2 py-2">
          <ProcessStatusLabel status={status} />
          {onDelete && (
            <span className="absolute right-1 top-1/2 -translate-y-1/2">
              <DeleteProcessButton name={process.name} onDelete={onDelete} />
            </span>
          )}
        </td>
      </tr>

      <tr className={`process-table__mobile-row ${allocatingClass}`}>
        <td colSpan={4} className="px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <strong className="truncate font-mono text-sm text-foreground">{process.name}</strong>
            <div className="flex shrink-0 items-center gap-2">
              <ProcessStatusLabel status={status} />
              {onDelete && <DeleteProcessButton name={process.name} onDelete={onDelete} />}
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Size
              </dt>
              <dd className="mt-0.5 font-mono text-xs tabular-nums">{size}</dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Placement
              </dt>
              <dd className="mt-0.5 font-mono text-xs text-muted-foreground">{placement}</dd>
            </div>
          </dl>
        </td>
      </tr>
    </>
  );
};

export default MemoryProcess;
