import { useContext } from "react";
import CPUProcess from "./CPUProcess";
import { CPUSimulatorContext } from "../../../../contexts/CPUSimulatorContext";

const CPUReadyQueue = () => {
  const [readyQueue] = useContext(CPUSimulatorContext).rQueue;
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [activeSchedulerName] = useContext(CPUSimulatorContext).activeName;
  const [currentProcess] = useContext(CPUSimulatorContext).current;
  const showPriority = activeSchedulerName === "Priority";
  const visibleReadyQueue = (readyQueue ?? []).filter((process) => process.remainingTime > 0);

  return (
    <div className="lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      <div className="flex h-10 items-center">
        <h2 className="text-base font-semibold">Ready queue</h2>
      </div>
      {visibleReadyQueue.length === 0 ? (
        <div className="mt-5 border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No processes are ready at this time.
        </div>
      ) : (
        <div className="process-table-container data-scroll table-container pt-5 lg:min-h-0 lg:flex-1 lg:overflow-auto">
          <table className="table table-fixed w-full">
            <thead className="process-table__desktop-header">
              <tr>
                <th className="w-[28%] px-2">Process</th>
                <th className="px-2">Arrival</th>
                <th className="px-2">Burst</th>
                <th className="px-2">Remaining</th>
                {showPriority && <th className="px-2">Priority</th>}
                <th className="px-2">State</th>
              </tr>
            </thead>
            <tbody>
              {visibleReadyQueue.map((process) => (
                <CPUProcess
                  key={process.name}
                  name={process.name}
                  arrivalTime={process.arrivalTime}
                  burstTime={process.burstTime}
                  remainingTime={process.remainingTime}
                  priority={process.priority}
                  showPriority={showPriority}
                  status={
                    process.remainingTime === 0
                      ? "FINISHED"
                      : activeCPUScheduler.getAllReadyQueues().length > 0 &&
                          currentProcess &&
                          currentProcess.processName === process.name
                        ? "EXECUTING"
                        : "WAITING"
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CPUReadyQueue;
