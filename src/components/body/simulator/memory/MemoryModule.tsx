import { useContext } from "react";
import MemoryControls from "./MemoryControls";
import MemoryLayout from "./MemoryLayout";
import MemoryJobQueue from "./MemoryJobQueue";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";

const algorithmDescriptions = {
  "First Fit": "Scans from the beginning and uses the first block large enough for the process.",
  "Best Fit": "Uses the smallest available block that can hold the process.",
  "Worst Fit": "Uses the largest available block, leaving the largest possible remainder.",
};

const MemoryModule = () => {
  const [timeDelta] = useContext(MemoryManagerContext).time;
  const [activeManagerName] = useContext(MemoryManagerContext).activeName;

  return (
    <div className="col-span-12 flex h-full min-h-0 min-w-0 flex-col">
      <header className="flex flex-col gap-6 pb-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            Memory Manager
          </h1>
        </div>
        <div className="grid min-w-32 grid-cols-[1fr_auto] items-center border bg-card">
          <span className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Allocation step
          </span>
          <strong className="border-l px-5 py-3 font-mono text-2xl font-semibold tabular-nums">
            {timeDelta}
          </strong>
        </div>
      </header>

      <section
        className="mt-4 min-h-0 flex-1 lg:flex lg:flex-col lg:overflow-hidden"
        aria-label="Memory simulation workspace"
      >
        <div className="shrink-0 pb-5">
          <MemoryControls policyDescription={algorithmDescriptions[activeManagerName]} />
        </div>

        <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
          <section className="min-w-0 lg:min-h-0">
            <MemoryJobQueue />
          </section>
          <section className="min-w-0 lg:min-h-0">
            <MemoryLayout />
          </section>
        </div>
      </section>
    </div>
  );
};

export default MemoryModule;
