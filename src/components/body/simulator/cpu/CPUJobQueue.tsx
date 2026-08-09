import { useContext } from "react";
import CPUProcess from "./CPUProcess";
import { CPUSimulatorContext } from "../../../../contexts/CPUSimulatorContext";
import { Plus } from "lucide-react";
import { ModalContext } from "../../../../contexts/ModalContext";
import type CPUProcessData from "../../../../simulator/cpu/cpu_process";

const CPUJobQueue = () => {
  const [jobQueue, setJobQueue] = useContext(CPUSimulatorContext).jQueue;
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [activeSchedulerName] = useContext(CPUSimulatorContext).activeName;
  const [currentProcess] = useContext(CPUSimulatorContext).current;
  const [, setActiveModal] = useContext(ModalContext);
  const hasStarted = activeCPUScheduler.getAllReadyQueues().length > 0;
  const showPriority = activeSchedulerName === "Priority";

  const getProcessStatus = (process: CPUProcessData): "FINISHED" | "EXECUTING" | "WAITING" => {
    if (process.remainingTime === 0) return "FINISHED";
    if (hasStarted && currentProcess?.processName === process.name) return "EXECUTING";
    return "WAITING";
  };

  const deleteProcess = (processName: string) => {
    activeCPUScheduler.removeProcess(processName);
    setJobQueue([...activeCPUScheduler.getJobQueue()]);
  };

  return (
    <div className="lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      <div className="flex h-10 items-center justify-between gap-4">
        <h2 className="text-base font-semibold">Job queue</h2>
        <button
          type="button"
          className="button px-3"
          onClick={() => setActiveModal("addCPUProcess")}
          disabled={hasStarted}
        >
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Add process
        </button>
      </div>
      {jobQueue.length === 0 ? (
        <div className="mt-5 border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Add a process to begin building the workload.
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
                {!hasStarted && (
                  <th className="w-10 px-1">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {jobQueue.map((process) => (
                <CPUProcess
                  key={process.name}
                  name={process.name}
                  arrivalTime={process.arrivalTime}
                  burstTime={process.burstTime}
                  remainingTime={process.remainingTime}
                  priority={process.priority}
                  showPriority={showPriority}
                  status={getProcessStatus(process)}
                  onDelete={hasStarted ? undefined : () => deleteProcess(process.name)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CPUJobQueue;
