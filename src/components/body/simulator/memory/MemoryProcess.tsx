import { useContext } from "react";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";
import type MemoryProcessData from "../../../../simulator/memory/memory_process";

const MemoryProcess = ({ process }: { process: MemoryProcessData }) => {
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

  let status = "Waiting";
  if (isAllocating) status = "Allocating";
  if (hasDecision) status = allocated[process.name] ? "Allocated" : "No fit";

  const statusStyle = {
    Allocating: "bg-primary",
    Allocated: "bg-primary/50",
    "No fit": "bg-destructive",
    Waiting: "border border-border bg-background",
  }[status];
  const statusText = isAllocating
    ? "text-primary"
    : status === "No fit"
      ? "text-destructive"
      : "text-muted-foreground";
  const allocatingClass = isAllocating ? "executing-process" : "";

  const processIdentity = (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={`h-2.5 w-2.5 shrink-0 ${statusStyle} ${isAllocating ? "animate-pulse" : ""}`}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <strong className="block truncate font-mono text-sm text-foreground">{process.name}</strong>
        <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${statusText}`}>
          {status}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <tr className={`process-table__desktop-row ${allocatingClass}`}>
        <td className="min-w-[9rem] px-2">{processIdentity}</td>
        <td className="px-2 font-mono tabular-nums">{size}</td>
        <td className="px-2 font-mono text-muted-foreground">{placement}</td>
      </tr>

      <tr className={`process-table__mobile-row ${allocatingClass}`}>
        <td colSpan={3} className="px-3 py-3">
          {processIdentity}
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
