import { useContext } from "react";
import CPUControls from "./CPUControls";
import CPUJobQueue from "./CPUJobQueue";
import CPUReadyQueue from "./CPUReadyQueue";
import CPUSchedule from "./CPUSchedule";
import { CPUSimulatorContext } from "../../../../contexts/CPUSimulatorContext";

const algorithmDescriptions = {
  FCFS: "Runs processes in arrival order until each one completes.",
  SJF: "Selects the ready process with the shortest burst time.",
  Priority: "Selects the ready process with the highest assigned priority.",
  RR: "Shares CPU time by rotating through ready processes using a fixed time quantum.",
  SRTF: "Preempts the running process when a shorter remaining job becomes ready.",
};

const CPUModule = () => {
  const [timeDelta] = useContext(CPUSimulatorContext).time;
  const [activeSchedulerName] = useContext(CPUSimulatorContext).activeName;

  return (
    <div className="col-span-12 flex h-full min-h-0 min-w-0 flex-col">
      <header className="flex flex-col gap-6 pb-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            CPU Scheduler
          </h1>
        </div>
        <div className="grid min-w-32 grid-cols-[1fr_auto] items-center border bg-card">
          <span className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Simulation time
          </span>
          <strong className="border-l px-5 py-3 font-mono text-2xl font-semibold tabular-nums">
            {timeDelta}
          </strong>
        </div>
      </header>

      <section
        className="mt-4 min-h-0 flex-1 lg:flex lg:flex-col lg:overflow-hidden"
        aria-label="CPU simulation workspace"
      >
        <div className="shrink-0 pb-5">
          <CPUControls policyDescription={algorithmDescriptions[activeSchedulerName]} />
        </div>

        <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-2">
          <section className="min-w-0 lg:min-h-0">
            <CPUJobQueue />
          </section>
          <section className="min-w-0 lg:min-h-0">
            <CPUReadyQueue />
          </section>
        </div>
        <section className="shrink-0 pt-5">
          <CPUSchedule />
        </section>
      </section>
    </div>
  );
};

export default CPUModule;
